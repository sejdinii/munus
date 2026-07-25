/**
 * workers/ingestion/runner/run.ts
 *
 * Pure, dependency-injected orchestration layer for a single ingestion cycle:
 * routes each company to its ATS adapter, isolates per-company failures,
 * caps concurrency, resolves dual-ATS companies to one authoritative source,
 * dedupes, and reports freshness/health to an injected JobStore. No network,
 * no Supabase SDK, no Next.js — see runner/types.ts for the injected shapes.
 */

import { fetchAshbyJobs } from "../adapters/ashby";
import { fetchGreenhouseJobs } from "../adapters/greenhouse";
import { fetchLeverJobs } from "../adapters/lever";
import { fetchSmartRecruitersJobs } from "../adapters/smartrecruiters";
import { fetchWorkableJobs } from "../adapters/workable";
import { dedupeJobs, resolveCompanySource } from "../dedupe";
import type { AtsSource, CompanyFeed, FetchJson, IngestionResult } from "../types";
import type {
  FeedHealth,
  IngestedJob,
  RunEvent,
  RunIngestionOptions,
  RunnerCompany,
  RunnerDeps,
  RunSummary,
} from "./types";

const DEFAULT_CONCURRENCY = 4;

type Adapter = (feed: CompanyFeed, fetchJson: FetchJson) => Promise<IngestionResult>;

const ADAPTERS: Record<AtsSource, Adapter> = {
  greenhouse: fetchGreenhouseJobs,
  lever: fetchLeverJobs,
  ashby: fetchAshbyJobs,
  workable: fetchWorkableJobs,
  smartrecruiters: fetchSmartRecruitersJobs,
};

interface RouteOutcome {
  entry: RunnerCompany;
  result: IngestionResult;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/** Runs one company's adapter with error isolation: an adapter normally
 * reports failure (404, malformed body, non-200) as an unhealthy
 * IngestionResult rather than throwing, but fetchJson itself can still
 * reject (network error) — that exception must never escape and abort the
 * whole run, so it is caught here and folded into the same unhealthy shape. */
async function routeOne(entry: RunnerCompany, deps: RunnerDeps): Promise<RouteOutcome> {
  deps.log({ type: "company_start", company: entry.company, ats: entry.ats });

  try {
    const adapter = ADAPTERS[entry.ats];
    const result = await adapter(entry, deps.fetchJson);

    if (result.healthy) {
      deps.log({
        type: "company_ok",
        company: entry.company,
        ats: entry.ats,
        host: result.host,
        jobCount: result.jobs.length,
      });
    } else {
      deps.log({
        type: "company_error",
        company: entry.company,
        ats: entry.ats,
        error: result.error ?? "unknown adapter error",
      });
    }

    return { entry, result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    deps.log({ type: "company_error", company: entry.company, ats: entry.ats, error: message });
    return {
      entry,
      result: {
        company: entry.company,
        source: entry.ats,
        host: hostnameOf(entry.feed_url),
        feedUrl: entry.feed_url,
        jobs: [],
        healthy: false,
        error: message,
      },
    };
  }
}

/** Fixed-size worker pool: exactly `limit` workers each pull the next index
 * in turn, so no more than `limit` calls to `fn` are ever in flight. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fn(items[index] as T);
    }
  }

  const poolSize = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: poolSize }, () => worker()));
  return results;
}

export async function runIngestion(
  companies: RunnerCompany[],
  deps: RunnerDeps,
  opts: RunIngestionOptions = {},
): Promise<RunSummary> {
  const start = deps.now();
  const concurrency = opts.concurrency ?? DEFAULT_CONCURRENCY;

  const outcomes = await mapWithConcurrency(companies, concurrency, (entry) =>
    routeOne(entry, deps),
  );

  // Health: exactly one record per routed (company, ats) entry, always —
  // including both legs of a dual-ATS company (D13 #3/#4: observability must
  // not be hidden by which source currently wins).
  for (const outcome of outcomes) {
    const health: FeedHealth = {
      company: outcome.entry.company,
      ats: outcome.entry.ats,
      host: outcome.result.host,
      ok: outcome.result.healthy,
      jobCount: outcome.result.jobs.length,
      at: deps.now(),
      ...(outcome.result.error !== undefined ? { error: outcome.result.error } : {}),
    };
    await deps.store.recordFeedHealth(health);
  }

  // Group by companyId (not by route) — a dual-ATS company's two entries
  // share a companyId and must be resolved to ONE authoritative source
  // (D13 #4) before upsert/markMissing.
  const byCompanyId = new Map<string, RouteOutcome[]>();
  for (const outcome of outcomes) {
    const group = byCompanyId.get(outcome.entry.companyId);
    if (group) group.push(outcome);
    else byCompanyId.set(outcome.entry.companyId, [outcome]);
  }

  const verifiedAt = new Date(start).toISOString();

  let ok = 0;
  let failed = 0;
  let jobsUpserted = 0;
  let jobsMarkedMissing = 0;
  const failures: { company: string; error: string }[] = [];

  for (const [companyId, group] of byCompanyId) {
    const anyHealthy = group.some((outcome) => outcome.result.healthy);

    if (!anyHealthy) {
      failed += 1;
      const error = group
        .map((outcome) => outcome.result.error ?? "unknown adapter error")
        .join("; ");
      failures.push({ company: group[0]!.entry.company, error });
      // Deliberate deviation (see final report): a company with NO healthy
      // feed this run is never passed to markMissing. We have no trustworthy
      // "what's currently posted" list for it this cycle, and calling
      // markMissing with an empty seen-set would flip every previously-open
      // job closed off the back of a transient outage, not a real closure.
      continue;
    }

    ok += 1;

    const winner =
      group.length === 1 ? group[0]!.result : resolveCompanySource(group.map((o) => o.result));
    const deduped = dedupeJobs(winner.jobs);

    if (deduped.length > 0) {
      const ingestedJobs: IngestedJob[] = deduped.map((job) => ({
        ...job,
        companyId,
        verifiedAt,
      }));
      const upsertResult = await deps.store.upsertJobs(ingestedJobs);
      jobsUpserted += upsertResult.count;
    }

    const seenExternalIds = deduped.map((job) => job.external_id);
    const missingCount = await deps.store.markMissing(companyId, seenExternalIds);
    jobsMarkedMissing += missingCount;
  }

  const summary: RunSummary = {
    companiesRun: byCompanyId.size,
    ok,
    failed,
    jobsUpserted,
    jobsMarkedMissing,
    durationMs: deps.now() - start,
    failures,
  };

  deps.log({ type: "run_complete", summary });

  return summary;
}
