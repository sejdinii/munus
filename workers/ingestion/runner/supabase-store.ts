/**
 * Supabase-backed JobStore (W1) — the persistence layer the runner contract
 * promised would "land with credentials". Uses an admin (service-role)
 * client: ingestion is server-side machinery and never runs under a user
 * session (RLS is bypassed by design here — same trust level as the cron).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { SEED_COMPANIES } from "../config/seed";
import { companyIdFor } from "../config/identity";
import type { FeedHealth, IngestedJob, JobStore, UpsertResult } from "./types";

const nameBySlug = new Map(
  SEED_COMPANIES.map((c) => [companyIdFor(c.company), c.company]),
);

export class SupabaseJobStore implements JobStore {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Ensure the company row exists (slug = the runner's stable companyId). */
  private async ensureCompany(
    slug: string,
    source: IngestedJob["source"],
  ): Promise<string> {
    const feed = SEED_COMPANIES.find((c) => companyIdFor(c.company) === slug);
    const { data, error } = await this.supabase
      .from("companies")
      .upsert(
        {
          name: nameBySlug.get(slug) ?? slug,
          slug,
          ats: source,
          feed_url: feed?.feed_url ?? "",
        },
        { onConflict: "ats,slug" },
      )
      .select("id")
      .single();
    if (error) throw new Error(`company upsert ${slug}: ${error.message}`);
    return data.id as string;
  }

  async upsertJobs(jobs: IngestedJob[]): Promise<UpsertResult> {
    if (jobs.length === 0) return { count: 0 };

    const companyByKey = new Map<string, string>();
    for (const job of jobs) {
      const key = `${job.companyId}\u0000${job.source}`;
      if (!companyByKey.has(key)) {
        companyByKey.set(key, await this.ensureCompany(job.companyId, job.source));
      }
    }

    const rows = jobs.map((job) => ({
      company_id: companyByKey.get(`${job.companyId}\u0000${job.source}`)!,
      source: job.source,
      external_id: job.external_id,
      title: job.title,
      location: job.location,
      remote: job.remote,
      // salary_min/max are INTEGER columns; some feeds emit fractional
      // values (e.g. "45,712.50") — round defensively, keep null as null.
      salary_min: job.salary_min == null ? null : Math.round(job.salary_min),
      salary_max: job.salary_max == null ? null : Math.round(job.salary_max),
      currency: job.currency,
      description: job.description,
      apply_url: job.apply_url,
      posted_at: job.posted_at,
      verified_at: job.verifiedAt,
      open: true,
    }));

    const { error } = await this.supabase.from("jobs").upsert(rows, {
      onConflict: "source,external_id",
      ignoreDuplicates: false,
    });
    if (error) throw new Error(`jobs upsert: ${error.message}`);
    return { count: rows.length };
  }

  async markMissing(companyId: string, seenExternalIds: string[]): Promise<number> {
    const { data: companyRows, error: companyError } = await this.supabase
      .from("companies")
      .select("id")
      .eq("slug", companyId);
    if (companyError) throw new Error(`company lookup ${companyId}: ${companyError.message}`);
    if (!companyRows || companyRows.length === 0) return 0;
    const companyIds = companyRows.map((row) => row.id as string);

    const { data: openJobs, error: jobsError } = await this.supabase
      .from("jobs")
      .select("id, external_id")
      .in("company_id", companyIds)
      .eq("open", true);
    if (jobsError) throw new Error(`open-jobs lookup ${companyId}: ${jobsError.message}`);

    const seen = new Set(seenExternalIds);
    const missingIds = (openJobs ?? [])
      .filter((job) => !seen.has(job.external_id as string))
      .map((job) => job.id as string);
    if (missingIds.length === 0) return 0;

    const { error: updateError } = await this.supabase
      .from("jobs")
      .update({ open: false })
      .in("id", missingIds);
    if (updateError) throw new Error(`mark missing ${companyId}: ${updateError.message}`);
    return missingIds.length;
  }

  async recordFeedHealth(record: FeedHealth): Promise<void> {
    const slug = companyIdFor(record.company);
    const { data: companyRows, error } = await this.supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .eq("ats", record.ats)
      .limit(1);
    if (error) throw new Error(`feed-health company lookup ${slug}: ${error.message}`);
    const companyId = (companyRows?.[0]?.id as string | undefined) ?? null;
    if (!companyId) return; // company not seeded/created — skip telemetry row

    const { error: insertError } = await this.supabase.from("feed_health").insert({
      company_id: companyId,
      ok: record.ok,
      host: record.host ?? null,
      job_count: record.jobCount,
      error: record.error ?? null,
      at: new Date(record.at).toISOString(),
    });
    if (insertError) throw new Error(`feed-health insert ${slug}: ${insertError.message}`);
  }
}
