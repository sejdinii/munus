/**
 * workers/ingestion/adapters/smartrecruiters.ts
 *
 * Parses a SmartRecruiters postings LIST response
 * (`https://api.smartrecruiters.com/v1/companies/{id}/postings`) into
 * NormalizedJob[]. Fetching is injected via FetchJson so this module never
 * touches the network, in tests or otherwise.
 *
 * Shape hand-reconstructed from SmartRecruiters' public postings-API docs
 * (network is unavailable in this environment — see fixtures) — re-verify
 * against a live response before this adapter's first real cron run.
 *
 * HONESTY NOTE (spec, CONTRACTS §3 invariant 4 spirit — never invent what
 * you don't have): the LIST endpoint used here carries NO job description
 * and no public apply page — `ref` is SmartRecruiters' own detail-endpoint
 * link (`.../postings/{id}`), not something a candidate can open. This
 * adapter therefore always sets description="" and salary nulls, and stores
 * `ref` as apply_url as-is (it is at least a resolvable URL, unlike a
 * fabricated public link). SMARTRECRUITERS_NEEDS_DETAIL_FETCH documents that
 * a future worker must follow `ref` with a per-posting detail call before
 * these jobs are description-complete / have a real apply page.
 *
 * No EU-host fallback here — that's a Greenhouse-specific quirk (D13 #2);
 * SmartRecruiters' postings API is a single endpoint per company id.
 */

import { detectRemote } from "../normalize";
import type { AtsSource, CompanyFeed, FetchJson, IngestionResult, NormalizedJob } from "../types";

/** See ashby.ts for the full rationale — same closed-AtsSource-union
 * workaround, same SHARED-CHANGE REQUEST in this slice's final report. */
export const SMARTRECRUITERS_SOURCE: AtsSource = "smartrecruiters";

/**
 * SmartRecruiters' postings LIST endpoint never carries a job description or
 * a public-facing apply page — see the module docblock above. A future
 * ingestion worker MUST follow each posting's `ref` link with a per-posting
 * detail fetch to fill in description/apply_url before these jobs are shown
 * to users. This adapter only lists postings; it deliberately does not
 * fabricate either field in the meantime.
 */
export const SMARTRECRUITERS_NEEDS_DETAIL_FETCH = true;

interface SmartRecruitersLocation {
  city?: string;
  country?: string;
  remote?: boolean;
}

interface SmartRecruitersCompany {
  identifier?: string;
  name?: string;
}

interface SmartRecruitersPosting {
  id: string | number;
  name: string;
  releasedDate: string;
  location?: SmartRecruitersLocation;
  /** Link to this posting's own detail endpoint (not a public apply page —
   * see SMARTRECRUITERS_NEEDS_DETAIL_FETCH). */
  ref?: string;
  company?: SmartRecruitersCompany;
}

interface SmartRecruitersResponse {
  totalFound: number;
  content: SmartRecruitersPosting[];
}

function isSmartRecruitersResponse(value: unknown): value is SmartRecruitersResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { content?: unknown }).content)
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
    source: SMARTRECRUITERS_SOURCE,
    host: hostnameOf(feed.feed_url),
    feedUrl: feed.feed_url,
    jobs: [],
    healthy: false,
    error,
  };
}

function locationTextOf(location: SmartRecruitersLocation | undefined): string {
  if (!location) return "";
  return [location.city, location.country].filter(Boolean).join(", ");
}

function toNormalizedJob(posting: SmartRecruitersPosting): NormalizedJob {
  const title = posting.name ?? "";
  const location = locationTextOf(posting.location);

  return {
    source: SMARTRECRUITERS_SOURCE,
    external_id: String(posting.id),
    title,
    location,
    remote: Boolean(posting.location?.remote) || detectRemote(title, location),
    // LIST endpoint has no description to scan for a salary range — never
    // estimated, never left to a stale/borrowed value. See module docblock.
    salary_min: null,
    salary_max: null,
    currency: null,
    description: "",
    apply_url: posting.ref ?? "",
    posted_at: new Date(posting.releasedDate).toISOString(),
  };
}

export async function fetchSmartRecruitersJobs(
  feed: CompanyFeed,
  fetchJson: FetchJson,
): Promise<IngestionResult> {
  const result = await fetchJson(feed.feed_url);

  if (result.status !== 200) {
    return unhealthy(feed, `unexpected status ${result.status}`);
  }

  if (!isSmartRecruitersResponse(result.json)) {
    return unhealthy(feed, "malformed smartrecruiters response: missing content array");
  }

  return {
    company: feed.company,
    source: SMARTRECRUITERS_SOURCE,
    host: hostnameOf(feed.feed_url),
    feedUrl: feed.feed_url,
    jobs: result.json.content.map(toNormalizedJob),
    // A 200 with an empty content array is healthy-but-quiet (D13 #3), same
    // as Greenhouse/Lever/Ashby/Workable.
    healthy: true,
  };
}
