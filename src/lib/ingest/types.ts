// Phase 1 · Ingestion — the make-or-break piece (docs/SCOUT_MVP_PLAN.md §2).
// Public ATS endpoints give free, legal, structured, fresh job feeds straight
// from company career sites. Every source sits behind an adapter; the network
// sits behind a fetcher seam so the pipeline runs identically against live
// feeds or recorded fixtures.

export type Ats = "greenhouse" | "lever";

export type SeedCompany = {
  name: string;
  slug: string;
  ats: Ats;
  /** Slug not yet confirmed against the live feed — expect 404s, track health. */
  unverified?: boolean;
};

/** One job as normalized out of an adapter, before storage. */
export type NormalizedJob = {
  externalId: string;
  title: string;
  location: string;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  description: string;
  applyUrl: string;
  postedAt: string | null;
};

/** JSON fetcher seam: live HTTP or fixtures. Throws FeedError on failure. */
export type FeedFetcher = (url: string) => Promise<unknown>;

export class FeedError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

export interface AtsAdapter {
  ats: Ats;
  feedUrl(slug: string): string;
  /** Parse a raw feed payload into normalized jobs. Must never invent fields. */
  parse(payload: unknown): NormalizedJob[];
}

export type CompanyIngestResult = {
  company: string;
  ats: Ats;
  ok: boolean;
  jobsSeen: number;
  jobsUpserted: number;
  jobsClosed: number;
  error?: string;
};

export type IngestRunReport = {
  startedAt: string;
  finishedAt: string;
  mode: "live" | "fixtures";
  companies: CompanyIngestResult[];
  totals: { seen: number; upserted: number; closed: number; failures: number };
};
