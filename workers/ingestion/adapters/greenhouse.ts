/**
 * workers/ingestion/adapters/greenhouse.ts
 *
 * Parses a Greenhouse boards-api response (`{jobs: [...]}` with content=true)
 * into NormalizedJob[]. Fetching is injected via FetchJson so this module
 * never touches the network, in tests or otherwise.
 *
 * D13 #2: tries the given feed_url first; on 404, retries against
 * boards-api.eu.greenhouse.io and records which host actually succeeded.
 */

import { detectRemote, parseSalary, stripHtml } from "../normalize";
import type { CompanyFeed, FetchJson, IngestionResult, NormalizedJob } from "../types";

interface GreenhouseJob {
  id: number | string;
  title: string;
  absolute_url: string;
  updated_at: string;
  location?: { name?: string };
  content?: string;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

function isGreenhouseResponse(value: unknown): value is GreenhouseResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { jobs?: unknown }).jobs)
  );
}

const PRIMARY_HOST = "boards-api.greenhouse.io";
const EU_HOST = "boards-api.eu.greenhouse.io";

/** Returns the EU-host equivalent of a primary-host feed URL, or null if the
 * URL isn't parseable or isn't on the primary host to begin with. */
function toEuUrl(feedUrl: string): string | null {
  try {
    const url = new URL(feedUrl);
    if (url.hostname !== PRIMARY_HOST) return null;
    url.hostname = EU_HOST;
    return url.toString();
  } catch {
    return null;
  }
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function unhealthy(feed: CompanyFeed, feedUrl: string, error: string): IngestionResult {
  return {
    company: feed.company,
    source: "greenhouse",
    host: hostnameOf(feedUrl),
    feedUrl,
    jobs: [],
    healthy: false,
    error,
  };
}

function toNormalizedJob(job: GreenhouseJob): NormalizedJob {
  const title = job.title ?? "";
  const location = job.location?.name ?? "";
  const description = stripHtml(job.content ?? "");
  const salary = parseSalary(description);

  return {
    source: "greenhouse",
    external_id: String(job.id),
    title,
    location,
    remote: detectRemote(title, location),
    salary_min: salary.salary_min,
    salary_max: salary.salary_max,
    currency: salary.currency,
    description,
    apply_url: job.absolute_url,
    posted_at: new Date(job.updated_at).toISOString(),
  };
}

function parseResponse(feed: CompanyFeed, feedUrl: string, json: unknown): IngestionResult {
  if (!isGreenhouseResponse(json)) {
    return unhealthy(feed, feedUrl, "malformed greenhouse response: missing jobs array");
  }

  return {
    company: feed.company,
    source: "greenhouse",
    host: hostnameOf(feedUrl),
    feedUrl,
    jobs: json.jobs.map(toNormalizedJob),
    // A 200 with an empty jobs array is healthy-but-quiet (D13 #3) — jobs.length
    // is not consulted here, on purpose.
    healthy: true,
  };
}

export async function fetchGreenhouseJobs(
  feed: CompanyFeed,
  fetchJson: FetchJson,
): Promise<IngestionResult> {
  const primary = await fetchJson(feed.feed_url);

  if (primary.status === 200) {
    return parseResponse(feed, feed.feed_url, primary.json);
  }

  if (primary.status === 404) {
    const euUrl = toEuUrl(feed.feed_url);
    if (!euUrl) {
      return unhealthy(feed, feed.feed_url, "404 and no EU fallback host available");
    }

    const fallback = await fetchJson(euUrl);
    if (fallback.status === 200) {
      return parseResponse(feed, euUrl, fallback.json);
    }
    return unhealthy(
      feed,
      euUrl,
      `404 on primary host and status ${fallback.status} on EU host`,
    );
  }

  return unhealthy(feed, feed.feed_url, `unexpected status ${primary.status}`);
}
