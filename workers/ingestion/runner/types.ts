/**
 * workers/ingestion/runner/types.ts
 *
 * Pure types for the ingestion orchestration layer. No Next.js, no Supabase
 * SDK, no network — only type-only imports from `../types` (per this slice's
 * instructions: `workers/ingestion/config/` is owned by a parallel slice and
 * is never imported here; the company list this runner routes is accepted as
 * a plain runtime parameter — see `RunnerCompany` below).
 */

import type { AtsSource, CompanyFeed, FetchJson, NormalizedJob } from "../types";

// Re-exported so callers (config module, future Supabase JobStore impl,
// tests) can build a FetchJson / AtsSource-shaped value without reaching
// into workers/ingestion/types.ts themselves.
export type { FetchJson };

/**
 * One company's routing info PLUS the DB id the runner needs to key
 * `upsertJobs` / `markMissing` calls. `CompanyFeed` (owned by wave 1) only
 * carries adapter-routing fields (company/ats/feed_url); this slice adds the
 * one extra field the orchestration layer requires.
 *
 * A company live on two ATS platforms mid-migration (CONTRACTS §2 D13 #4 —
 * Alan, Back Market, Ledger) is represented as TWO `RunnerCompany` entries
 * that share the same `companyId` but differ in `ats`/`feed_url`. The runner
 * groups by `companyId` to apply `resolveCompanySource`.
 *
 * SHARED-CHANGE REQUEST (see final report): the parallel `config/` slice's
 * runtime company list must produce values conforming to this shape (i.e.
 * include `companyId` alongside `company`/`ats`/`feed_url`, and repeat the
 * same `companyId` for a dual-ATS company's two rows).
 */
export interface RunnerCompany extends CompanyFeed {
  companyId: string;
}

/** One row this runner asks the store to persist for a company whose feed
 * was healthy this run. Extends NormalizedJob (the adapter output shape)
 * with the two fields only the orchestration layer can supply: which
 * company row it belongs to, and the freshness timestamp for this run. */
export interface IngestedJob extends NormalizedJob {
  companyId: string;
  /** ISO 8601 UTC, derived from `deps.now()` at the start of the run — every
   * job upserted in a run shares one verifiedAt so "freshness" reflects the
   * run, not the exact ms an individual store call happened to execute. */
  verifiedAt: string;
}

/** Result of a store upsert call. Intentionally minimal — the real Supabase
 * implementation may insert or update; this layer only needs a total row
 * count to fold into `RunSummary.jobsUpserted`. */
export interface UpsertResult {
  count: number;
}

/** Per-(company, ats) health snapshot. Recorded for EVERY routed entry,
 * always — including both legs of a dual-ATS company, and the losing side of
 * a `resolveCompanySource` pick — because feed observability must not be
 * hidden by which source currently "wins" (CONTRACTS §2 D13 #3, #4). */
export interface FeedHealth {
  company: string;
  ats: AtsSource;
  host: string;
  ok: boolean;
  jobCount: number;
  error?: string;
  /** epoch ms, from `deps.now()`. */
  at: number;
}

/**
 * Persistence boundary. An in-memory fake implements this for run.test.ts;
 * the real Supabase-backed implementation lands in a later slice once
 * credentials exist (see final report) — this interface is the contract it
 * must satisfy.
 */
export interface JobStore {
  upsertJobs(jobs: IngestedJob[]): Promise<UpsertResult>;
  /** Reports the full set of external_ids seen THIS run for `companyId`
   * (post-dedupe). The store is responsible for diffing against what it
   * already has stored and flipping the difference to `open=false`; it
   * returns how many rows it marked missing. Only called when the company
   * had at least one healthy feed result this run — see run.ts for why. */
  markMissing(companyId: string, seenExternalIds: string[]): Promise<number>;
  recordFeedHealth(record: FeedHealth): Promise<void>;
}

/** Observability hook. Deliberately coarse — enough to log/trace a run
 * without the runner depending on any particular logging library. */
export type RunEvent =
  | { type: "company_start"; company: string; ats: AtsSource }
  | { type: "company_ok"; company: string; ats: AtsSource; host: string; jobCount: number }
  | { type: "company_error"; company: string; ats: AtsSource; error: string }
  | { type: "run_complete"; summary: RunSummary };

export interface RunnerDeps {
  fetchJson: FetchJson;
  /** epoch ms. Injected so tests control elapsed time / verifiedAt without
   * touching the system clock. */
  now: () => number;
  log: (event: RunEvent) => void;
  store: JobStore;
}

export interface RunIngestionOptions {
  /** Max companies fetched concurrently. Default 4 — keeps us from hammering
   * any single ATS provider across a large seed list. */
  concurrency?: number;
}

export interface RunSummary {
  /** Count of DISTINCT companies attempted this run (a dual-ATS company's two
   * routed entries count once) — kept consistent with `ok`/`failed`, which
   * are also per-company, so `ok + failed === companiesRun` always holds. */
  companiesRun: number;
  ok: number;
  failed: number;
  jobsUpserted: number;
  jobsMarkedMissing: number;
  durationMs: number;
  failures: { company: string; error: string }[];
}
