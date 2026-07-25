/**
 * workers/ingestion/types.ts
 *
 * Pure TypeScript types for the ingestion pipeline. No Next.js, no network,
 * no DB client — this module is safe to import from adapters, normalizers,
 * and tests alike.
 *
 * NormalizedJob mirrors the `jobs` table shape from CONTRACTS.md §2, minus
 * DB-only columns (id, company_id, verified_at, open, embedding) which are
 * assigned at the persistence step this slice does not own.
 */

/** ATS platforms this slice implements. CONTRACTS §2 lists ashby/workable/
 * smartrecruiters too — out of scope for this wave. */
export type AtsSource =
  | "greenhouse"
  | "lever"
  | "ashby"
  | "workable"
  | "smartrecruiters";

export interface NormalizedJob {
  source: AtsSource;
  external_id: string;
  title: string;
  location: string;
  remote: boolean;
  /** CONTRACTS §3 invariant 4 / D13: null unless an explicit range is stated
   * in the posting text. Never estimated. */
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  description: string;
  apply_url: string;
  /** ISO 8601 UTC timestamp, normalized from whatever the source ATS sends. */
  posted_at: string;
}

/**
 * Config describing one company's feed. Per CONTRACTS "Ingestion adapter
 * contract" #1 (D13 #1): feed_url is evidence-confirmed seed data, and must
 * NEVER be derived by slugifying `company` — ~20% of Greenhouse slugs are
 * legacy names (e.g. miro -> realtimeboardglobal). This type only carries
 * what the config/seed list is expected to supply; building that seed list
 * is out of scope for this slice (see final report).
 */
export interface CompanyFeed {
  company: string;
  ats: AtsSource;
  feed_url: string;
}

/** Result of a single fetchJson(url) call. Modeled as a plain value (status +
 * body) rather than throw/reject so adapters can handle 404s as ordinary
 * control flow instead of exceptions. */
export interface FetchResult {
  status: number;
  json: unknown;
}

/** Fetching is injected so adapters and their tests never touch the network. */
export type FetchJson = (url: string) => Promise<FetchResult>;

export interface IngestionResult {
  company: string;
  source: AtsSource;
  /** Hostname that actually returned 200 (e.g. "boards-api.eu.greenhouse.io"
   * after a D13 #2 fallback). Empty string if no host ever succeeded. */
  host: string;
  /** Full URL that returned 200 (or was last attempted, on failure). */
  feedUrl: string;
  jobs: NormalizedJob[];
  /** True whenever the feed was reachable and returned parseable JSON — an
   * empty jobs array is healthy-but-quiet per D13 #3, never an error. */
  healthy: boolean;
  /** Present only when healthy is false. */
  error?: string;
}
