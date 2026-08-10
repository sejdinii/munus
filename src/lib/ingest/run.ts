// Ingestion runner: seed → fetch each active company's feed → normalize →
// upsert with freshness → close vanished postings → record source health.

import seedJson from "../../../data/companies-seed.json";
import { greenhouseAdapter } from "./adapters/greenhouse";
import { leverAdapter } from "./adapters/lever";
import { FIXTURE_SEED, fixtureFetcher } from "./fixtures";
import { ingestStore } from "./store";
import {
  FeedError,
  type AtsAdapter,
  type CompanyIngestResult,
  type FeedFetcher,
  type IngestRunReport,
  type SeedCompany,
} from "./types";

const ADAPTERS: Record<string, AtsAdapter> = {
  greenhouse: greenhouseAdapter,
  lever: leverAdapter,
};

/** Deactivate a source after this many consecutive failures (health alert). */
const FAIL_THRESHOLD = 5;
const FETCH_TIMEOUT_MS = 15_000;

export const liveFetcher: FeedFetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: { "User-Agent": "munus-ingest/1.0 (+https://munus.app)" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new FeedError(`HTTP ${response.status} for ${url}`, response.status);
  return response.json();
};

export function fixturesEnabled(): boolean {
  return process.env.INGEST_FIXTURES === "1" || !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export async function runIngestion(): Promise<IngestRunReport> {
  const startedAt = new Date().toISOString();
  const fixtures = fixturesEnabled();
  const fetcher = fixtures ? fixtureFetcher : liveFetcher;
  const seed: SeedCompany[] = fixtures
    ? FIXTURE_SEED
    : (seedJson as { companies: SeedCompany[] }).companies;

  await ingestStore.seedCompanies(seed);
  const companies = await ingestStore.listActiveCompanies();

  const results: CompanyIngestResult[] = [];
  for (const company of companies) {
    const adapter = ADAPTERS[company.ats];
    if (!adapter) {
      results.push({
        company: company.name,
        ats: company.ats,
        ok: false,
        jobsSeen: 0,
        jobsUpserted: 0,
        jobsClosed: 0,
        error: `no adapter for ats "${company.ats}"`,
      });
      continue;
    }
    try {
      const payload = await fetcher(adapter.feedUrl(company.slug));
      const jobs = adapter.parse(payload);
      const { upserted, closed } = await ingestStore.syncCompanyJobs(company.id, jobs);
      await ingestStore.recordHealth(company.id, true, FAIL_THRESHOLD);
      results.push({
        company: company.name,
        ats: company.ats,
        ok: true,
        jobsSeen: jobs.length,
        jobsUpserted: upserted,
        jobsClosed: closed,
      });
    } catch (error) {
      await ingestStore.recordHealth(company.id, false, FAIL_THRESHOLD);
      results.push({
        company: company.name,
        ats: company.ats,
        ok: false,
        jobsSeen: 0,
        jobsUpserted: 0,
        jobsClosed: 0,
        error: error instanceof FeedError ? error.message : String(error),
      });
    }
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    mode: fixtures ? "fixtures" : "live",
    companies: results,
    totals: {
      seen: results.reduce((n, r) => n + r.jobsSeen, 0),
      upserted: results.reduce((n, r) => n + r.jobsUpserted, 0),
      closed: results.reduce((n, r) => n + r.jobsClosed, 0),
      failures: results.filter((r) => !r.ok).length,
    },
  };
}
