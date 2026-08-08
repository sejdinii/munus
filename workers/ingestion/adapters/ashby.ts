/**
 * workers/ingestion/adapters/ashby.ts
 *
 * Parses an Ashby posting-api job-board response
 * (`https://api.ashbyhq.com/posting-api/job-board/{slug}`) into
 * NormalizedJob[]. Fetching is injected via FetchJson so this module never
 * touches the network, in tests or otherwise.
 *
 * Shape hand-reconstructed from Ashby's public posting-api docs (network is
 * unavailable in this environment — see fixtures) — re-verify against a live
 * response before this adapter's first real cron run.
 *
 * No EU-host fallback here — that's a Greenhouse-specific quirk (D13 #2);
 * Ashby's posting-api is a single endpoint per job-board slug.
 */

import { detectRemote, parseSalary, stripHtml } from "../normalize";
import type { AtsSource, CompanyFeed, FetchJson, IngestionResult, NormalizedJob } from "../types";

/**
 * CONTRACTS §2 lists "ashby" | "workable" | "smartrecruiters" as AtsSource
 * members, but workers/ingestion/types.ts (wave-1 owned; not a file this
 * slice may edit) still declares `AtsSource = "greenhouse" | "lever"` only.
 * This cast bridges the gap without touching types.ts — see this slice's
 * final report, SHARED-CHANGE REQUEST: widen AtsSource to include the three
 * new sources. Once that lands this constant's cast is a no-op.
 */
export const ASHBY_SOURCE: AtsSource = "ashby";

interface AshbyJob {
  id: string;
  title: string;
  location?: string;
  secondaryLocations?: string[];
  employmentType?: string;
  isRemote?: boolean;
  publishedAt: string;
  jobUrl?: string;
  applyUrl?: string;
  descriptionPlain?: string;
}

interface AshbyResponse {
  jobs: AshbyJob[];
}

function isAshbyResponse(value: unknown): value is AshbyResponse {
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
    source: ASHBY_SOURCE,
    host: hostnameOf(feed.feed_url),
    feedUrl: feed.feed_url,
    jobs: [],
    healthy: false,
    error,
  };
}

/** secondaryLocations feeds remote *detection* only (combined with the
 * primary location before running detectRemote) — the displayed `location`
 * field stays the single primary location string, matching the other
 * adapters' one-string-per-job shape. */
function toNormalizedJob(job: AshbyJob): NormalizedJob {
  const title = job.title ?? "";
  const primaryLocation = job.location ?? "";
  const allLocationsText = [primaryLocation, ...(job.secondaryLocations ?? [])]
    .filter(Boolean)
    .join(", ");
  const description = stripHtml(job.descriptionPlain ?? "");
  const salary = parseSalary(description);

  return {
    source: ASHBY_SOURCE,
    external_id: String(job.id),
    title,
    location: primaryLocation,
    remote: Boolean(job.isRemote) || detectRemote(title, allLocationsText),
    salary_min: salary.salary_min,
    salary_max: salary.salary_max,
    currency: salary.currency,
    description,
    // Spec: apply_url=jobUrl, fallback applyUrl.
    apply_url: job.jobUrl || job.applyUrl || "",
    posted_at: new Date(job.publishedAt).toISOString(),
  };
}

export async function fetchAshbyJobs(
  feed: CompanyFeed,
  fetchJson: FetchJson,
): Promise<IngestionResult> {
  const result = await fetchJson(feed.feed_url);

  if (result.status !== 200) {
    return unhealthy(feed, `unexpected status ${result.status}`);
  }

  if (!isAshbyResponse(result.json)) {
    return unhealthy(feed, "malformed ashby response: missing jobs array");
  }

  return {
    company: feed.company,
    source: ASHBY_SOURCE,
    host: hostnameOf(feed.feed_url),
    feedUrl: feed.feed_url,
    jobs: result.json.jobs.map(toNormalizedJob),
    // A 200 with an empty jobs array is healthy-but-quiet (D13 #3), same as
    // Greenhouse/Lever.
    healthy: true,
  };
}
