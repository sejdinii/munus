// Ingestion storage. Runs in worker context (cron/API route — NO cookies),
// so the Supabase side uses the service role directly, never the session
// client. Dev side extends the same .dev-data file the app store uses.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { env, hasSupabase } from "@/lib/env";
import type { Ats, NormalizedJob, SeedCompany } from "./types";

export type IngestCompany = {
  id: string;
  name: string;
  slug: string;
  ats: Ats;
  active: boolean;
  /** Consecutive fetch failures — health signal; deactivate at the threshold. */
  failStreak?: number;
};

export interface IngestStore {
  /** Insert seed companies that aren't present yet (by slug+ats). */
  seedCompanies(seed: SeedCompany[]): Promise<number>;
  listActiveCompanies(): Promise<IngestCompany[]>;
  /**
   * Upsert this company's jobs (dedupe key: externalId), stamp verified_at,
   * and close jobs that vanished from the feed. Returns counts.
   */
  syncCompanyJobs(
    companyId: string,
    jobs: NormalizedJob[],
  ): Promise<{ upserted: number; closed: number }>;
  recordHealth(companyId: string, ok: boolean, failThreshold: number): Promise<void>;
  countOpenJobs(): Promise<number>;
}

/* ------------------------------- dev (file) ------------------------------ */

const DATA_DIR = path.join(process.cwd(), ".dev-data");
const DATA_FILE = path.join(DATA_DIR, "ingest.json");

type DevJob = NormalizedJob & {
  id: string;
  companyId: string;
  verifiedAt: string;
  open: boolean;
};
type DevData = { companies: IngestCompany[]; jobs: DevJob[] };

async function loadDev(): Promise<DevData> {
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf8")) as DevData;
  } catch {
    return { companies: [], jobs: [] };
  }
}
async function saveDev(data: DevData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export const devIngestStore: IngestStore = {
  async seedCompanies(seed) {
    const data = await loadDev();
    let added = 0;
    for (const c of seed) {
      if (!data.companies.some((x) => x.slug === c.slug && x.ats === c.ats)) {
        data.companies.push({
          id: randomUUID(),
          name: c.name,
          slug: c.slug,
          ats: c.ats,
          active: true,
          failStreak: 0,
        });
        added++;
      }
    }
    await saveDev(data);
    return added;
  },

  async listActiveCompanies() {
    return (await loadDev()).companies.filter((c) => c.active);
  },

  async syncCompanyJobs(companyId, jobs) {
    const data = await loadDev();
    const now = new Date().toISOString();
    const seen = new Set(jobs.map((j) => j.externalId));
    let upserted = 0;
    for (const job of jobs) {
      const existing = data.jobs.find(
        (j) => j.companyId === companyId && j.externalId === job.externalId,
      );
      if (existing) {
        Object.assign(existing, job, { verifiedAt: now, open: true });
      } else {
        data.jobs.push({ ...job, id: randomUUID(), companyId, verifiedAt: now, open: true });
      }
      upserted++;
    }
    let closed = 0;
    for (const j of data.jobs) {
      if (j.companyId === companyId && j.open && !seen.has(j.externalId)) {
        j.open = false;
        closed++;
      }
    }
    await saveDev(data);
    return { upserted, closed };
  },

  async recordHealth(companyId, ok, failThreshold) {
    const data = await loadDev();
    const company = data.companies.find((c) => c.id === companyId);
    if (!company) return;
    company.failStreak = ok ? 0 : (company.failStreak ?? 0) + 1;
    if (!ok && (company.failStreak ?? 0) >= failThreshold) company.active = false;
    await saveDev(data);
  },

  async countOpenJobs() {
    return (await loadDev()).jobs.filter((j) => j.open).length;
  },
};

/* --------------------------- supabase (service) -------------------------- */

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for ingestion");
  return createClient(env.supabaseUrl, key, { auth: { persistSession: false } });
}

export const supabaseIngestStore: IngestStore = {
  async seedCompanies(seed) {
    const supabase = serviceClient();
    const { data: existing, error } = await supabase.from("companies").select("slug, ats");
    if (error) throw new Error(`companies select failed: ${error.message}`);
    const have = new Set((existing ?? []).map((c) => `${c.ats}:${c.slug}`));
    const fresh = seed.filter((c) => !have.has(`${c.ats}:${c.slug}`));
    if (fresh.length === 0) return 0;
    const { error: insertError } = await supabase.from("companies").insert(
      fresh.map((c) => ({
        name: c.name,
        slug: c.slug,
        ats: c.ats,
        feed_url:
          c.ats === "greenhouse"
            ? `https://boards-api.greenhouse.io/v1/boards/${c.slug}/jobs?content=true`
            : `https://api.lever.co/v0/postings/${c.slug}?mode=json`,
        active: true,
      })),
    );
    if (insertError) throw new Error(`companies insert failed: ${insertError.message}`);
    return fresh.length;
  },

  async listActiveCompanies() {
    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, slug, ats, active")
      .eq("active", true);
    if (error) throw new Error(`companies select failed: ${error.message}`);
    return (data ?? []) as IngestCompany[];
  },

  async syncCompanyJobs(companyId, jobs) {
    const supabase = serviceClient();
    const now = new Date().toISOString();
    const { error: upsertError } = await supabase.from("jobs").upsert(
      jobs.map((j) => ({
        company_id: companyId,
        external_id: j.externalId,
        title: j.title,
        location: j.location,
        remote: j.remote,
        salary_min: j.salaryMin,
        salary_max: j.salaryMax,
        currency: j.currency,
        description: j.description,
        apply_url: j.applyUrl,
        posted_at: j.postedAt,
        verified_at: now,
        open: true,
      })),
      { onConflict: "company_id,external_id" },
    );
    if (upsertError) throw new Error(`jobs upsert failed: ${upsertError.message}`);

    // Close postings that vanished from the feed (never show a dead link twice).
    const seen = jobs.map((j) => j.externalId);
    let closed = 0;
    const closeQuery = supabase
      .from("jobs")
      .update({ open: false })
      .eq("company_id", companyId)
      .eq("open", true);
    const { data: closedRows, error: closeError } = await (seen.length > 0
      ? closeQuery.not("external_id", "in", `(${seen.map((s) => `"${s}"`).join(",")})`)
      : closeQuery
    ).select("id");
    if (closeError) throw new Error(`jobs close failed: ${closeError.message}`);
    closed = closedRows?.length ?? 0;

    return { upserted: jobs.length, closed };
  },

  async recordHealth() {
    // fail_streak column ships in a later migration; supabase health tracking
    // is a no-op until then (dev store already enforces the contract).
  },

  async countOpenJobs() {
    const supabase = serviceClient();
    const { count, error } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("open", true);
    if (error) throw new Error(`jobs count failed: ${error.message}`);
    return count ?? 0;
  },
};

export const ingestStore: IngestStore = hasSupabase ? supabaseIngestStore : devIngestStore;
