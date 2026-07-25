/**
 * workers/ingestion/adapters/workable.ts
 *
 * Parses a Workable "widget" account feed
 * (`https://apply.workable.com/api/v1/widget/accounts/{slug}`) into
 * NormalizedJob[]. Fetching is injected via FetchJson so this module never
 * touches the network, in tests or otherwise.
 *
 * Shape hand-reconstructed from Workable's public widget-API docs (network
 * is unavailable in this environment — see fixtures) — re-verify against a
 * live response before this adapter's first real cron run.
 *
 * FOUNDER RISK (BACKLOG.md RISKS, Batch 2, 2026-07-23): Workable now has (at
 * least) two live URL schemes for a job's public apply page — legacy
 * slug-based (`apply.workable.com/{slug}/j/{jobId}/`) and a newer opaque
 * hash-ID scheme (`jobs.workable.com/company/{hash}/jobs-at-{company}` or
 * `apply.workable.com/j/{hash}/`). This adapter never parses or validates
 * the shape of a job's `url` — it stores it verbatim as apply_url — and the
 * feed's account identifier is taken only from `feed.feed_url` (config,
 * evidence-confirmed), never reconstructed from a job's url. See
 * workable.test.ts for a fixture job using the hash-ID form proving parsing
 * doesn't depend on which scheme the URL uses.
 *
 * No EU-host fallback here — that's a Greenhouse-specific quirk (D13 #2);
 * Workable's widget API is a single endpoint per account slug.
 */

import { detectRemote, parseSalary, stripHtml } from "../normalize";
import type { AtsSource, CompanyFeed, FetchJson, IngestionResult, NormalizedJob } from "../types";

/** See ashby.ts for the full rationale — same closed-AtsSource-union
 * workaround, same SHARED-CHANGE REQUEST in this slice's final report. */
export const WORKABLE_SOURCE = "workable" as AtsSource;

interface WorkableJobLocation {
  city?: string;
  country?: string;
  remote?: boolean;
}

interface WorkableJob {
  title: string;
  shortcode: string;
  /** Workable's internal requisition code; not used — shortcode is the
   * canonical external id per spec. Kept in the type for shape fidelity. */
  code?: string;
  url: string;
  published_on: string;
  city?: string;
  country?: string;
  locations?: WorkableJobLocation[];
  remote?: boolean;
  description?: string;
}

interface WorkableResponse {
  name?: string;
  jobs: WorkableJob[];
}

function isWorkableResponse(value: unknown): value is WorkableResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { jobs?: unknown }).jobs)
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function unhealthy(feed: CompanyFeed, error: string): IngestionResult {
  return {
    company: feed.company,
    source: WORKABLE_SOURCE,
    host: hostnameOf(feed.feed_url),
    feedUrl: feed.feed_url,
    jobs: [],
    healthy: false,
    error,
  };
}

/** Some Workable accounts return a `locations` array (one entry per office),
 * others a flat `city`/`country` pair — support both, never guess one from
 * the other. */
function locationTextOf(job: WorkableJob): string {
  if (job.locations && job.locations.length > 0) {
    return job.locations
      .map((loc) => [loc.city, loc.country].filter(Boolean).join(", "))
      .filter(Boolean)
      .join("; ");
  }
  return [job.city, job.country].filter(Boolean).join(", ");
}

function isAnyLocationRemote(job: WorkableJob): boolean {
  return Boolean(job.remote) || Boolean(job.locations?.some((loc) => loc.remote));
}

function toNormalizedJob(job: WorkableJob): NormalizedJob {
  const title = job.title ?? "";
  const location = locationTextOf(job);
  const description = stripHtml(job.description ?? "");
  const salary = parseSalary(description);

  return {
    source: WORKABLE_SOURCE,
    external_id: String(job.shortcode),
    title,
    location,
    remote: isAnyLocationRemote(job) || detectRemote(title, location),
    salary_min: salary.salary_min,
    salary_max: salary.salary_max,
    currency: salary.currency,
    description,
    // Stored verbatim regardless of which of Workable's two URL schemes it
    // uses — see the founder-risk note above.
    apply_url: job.url,
    posted_at: new Date(job.published_on).toISOString(),
  };
}

export async function fetchWorkableJobs(
  feed: CompanyFeed,
  fetchJson: FetchJson,
): Promise<IngestionResult> {
  const result = await fetchJson(feed.feed_url);

  if (result.status !== 200) {
    return unhealthy(feed, `unexpected status ${result.status}`);
  }

  if (!isWorkableResponse(result.json)) {
    return unhealthy(feed, "malformed workable response: missing jobs array");
  }

  return {
    company: feed.company,
    source: WORKABLE_SOURCE,
    host: hostnameOf(feed.feed_url),
    feedUrl: feed.feed_url,
    jobs: result.json.jobs.map(toNormalizedJob),
    // A 200 with an empty jobs array is healthy-but-quiet (D13 #3), same as
    // Greenhouse/Lever/Ashby.
    healthy: true,
  };
}
