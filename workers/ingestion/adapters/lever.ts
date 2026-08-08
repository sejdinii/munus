/**
 * workers/ingestion/adapters/lever.ts
 *
 * Parses a Lever postings-api response (a bare array of postings) into
 * NormalizedJob[]. Fetching is injected via FetchJson so this module never
 * touches the network, in tests or otherwise.
 *
 * No EU-host fallback here — that's a Greenhouse-specific quirk (D13 #2);
 * Lever's postings API is a single endpoint per company.
 */

import { detectRemote, parseSalary, stripHtml } from "../normalize";
import type { CompanyFeed, FetchJson, IngestionResult, NormalizedJob } from "../types";

interface LeverPosting {
  id: string;
  text: string;
  categories?: { location?: string };
  hostedUrl: string;
  createdAt: number | string;
  descriptionPlain?: string;
}

function isLeverResponse(value: unknown): value is LeverPosting[] {
  return Array.isArray(value);
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
    source: "lever",
    host: hostnameOf(feed.feed_url),
    feedUrl: feed.feed_url,
    jobs: [],
    healthy: false,
    error,
  };
}

function toNormalizedJob(posting: LeverPosting): NormalizedJob {
  const title = posting.text ?? "";
  const location = posting.categories?.location ?? "";
  const description = stripHtml(posting.descriptionPlain ?? "");
  const salary = parseSalary(description);

  return {
    source: "lever",
    external_id: String(posting.id),
    title,
    location,
    remote: detectRemote(title, location),
    salary_min: salary.salary_min,
    salary_max: salary.salary_max,
    currency: salary.currency,
    description,
    apply_url: posting.hostedUrl,
    posted_at: new Date(posting.createdAt).toISOString(),
  };
}

export async function fetchLeverJobs(
  feed: CompanyFeed,
  fetchJson: FetchJson,
): Promise<IngestionResult> {
  const result = await fetchJson(feed.feed_url);

  if (result.status !== 200) {
    return unhealthy(feed, `unexpected status ${result.status}`);
  }

  if (!isLeverResponse(result.json)) {
    return unhealthy(feed, "malformed lever response: expected an array of postings");
  }

  return {
    company: feed.company,
    source: "lever",
    host: hostnameOf(feed.feed_url),
    feedUrl: feed.feed_url,
    jobs: result.json.map(toNormalizedJob),
    // An empty array here is equally healthy-but-quiet, matching D13 #3's
    // intent even though Lever isn't named in that bullet explicitly.
    healthy: true,
  };
}
