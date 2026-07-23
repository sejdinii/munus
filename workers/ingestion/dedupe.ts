/**
 * workers/ingestion/dedupe.ts
 *
 * Two levels of dedupe:
 *  1. dedupeJobs — the baseline CONTRACTS §2 key: (source, external_id).
 *     Handles the same posting being re-fetched across cron runs.
 *  2. resolveCompanySource — D13 #4: a company mid dual-ATS migration (Alan,
 *     Back Market, Ledger) can be live on two ATS platforms at once, each
 *     with its own (source, external_id) namespace, so key-based dedupe alone
 *     can't merge them. Pick the source with more postings; break ties on
 *     freshness (most recent posted_at among its jobs).
 */

import type { IngestionResult, NormalizedJob } from "./types";

/** Dedupes a flat job list on (source, external_id), keeping the freshest
 * posted_at when the same key appears more than once. */
export function dedupeJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const bestByKey = new Map<string, NormalizedJob>();

  for (const job of jobs) {
    const key = `${job.source}:${job.external_id}`;
    const existing = bestByKey.get(key);
    if (!existing || Date.parse(job.posted_at) > Date.parse(existing.posted_at)) {
      bestByKey.set(key, job);
    }
  }

  return Array.from(bestByKey.values());
}

function freshestPostedAt(jobs: NormalizedJob[]): number {
  return jobs.reduce((max, job) => Math.max(max, Date.parse(job.posted_at) || 0), 0);
}

/**
 * Given ingestion results for the SAME company from two (or more) ATS
 * sources, picks the one to treat as authoritative for this cycle: more
 * postings wins; a tie in postings count is broken by whichever has the
 * fresher max posted_at (D13 #4: "prefer the fresher/larger board").
 *
 * Callers are responsible for grouping results by company before calling
 * this — it does not itself check that `results` share a company.
 */
export function resolveCompanySource(results: IngestionResult[]): IngestionResult {
  if (results.length === 0) {
    throw new Error("resolveCompanySource requires at least one IngestionResult");
  }

  return results.reduce((best, candidate) => {
    if (candidate.jobs.length !== best.jobs.length) {
      return candidate.jobs.length > best.jobs.length ? candidate : best;
    }
    return freshestPostedAt(candidate.jobs) > freshestPostedAt(best.jobs) ? candidate : best;
  });
}
