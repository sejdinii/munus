import { describe, expect, it } from "vitest";
import { runIngestion } from "./run";
import type {
  FeedHealth,
  IngestedJob,
  JobStore,
  RunEvent,
  RunnerCompany,
  RunnerDeps,
  UpsertResult,
} from "./types";
import type { FetchJson } from "../types";

// ---------------------------------------------------------------------------
// In-memory JobStore fake — stands in for the real Supabase implementation,
// which lands once credentials exist (see this slice's final report).
// ---------------------------------------------------------------------------

class InMemoryJobStore implements JobStore {
  upsertCalls: IngestedJob[][] = [];
  missingCalls: { companyId: string; seenExternalIds: string[] }[] = [];
  healthRecords: FeedHealth[] = [];
  private openByCompany = new Map<string, Set<string>>();

  /** Pre-populate what a PRIOR run had persisted as still-open for a
   * company, so a test can assert what THIS run reports missing. */
  seedOpenJobs(companyId: string, externalIds: string[]): void {
    this.openByCompany.set(companyId, new Set(externalIds));
  }

  async upsertJobs(jobs: IngestedJob[]): Promise<UpsertResult> {
    this.upsertCalls.push(jobs);
    for (const job of jobs) {
      const set = this.openByCompany.get(job.companyId) ?? new Set<string>();
      set.add(job.external_id);
      this.openByCompany.set(job.companyId, set);
    }
    return { count: jobs.length };
  }

  async markMissing(companyId: string, seenExternalIds: string[]): Promise<number> {
    this.missingCalls.push({ companyId, seenExternalIds });
    const open = this.openByCompany.get(companyId) ?? new Set<string>();
    const seen = new Set(seenExternalIds);
    let missing = 0;
    for (const id of open) {
      if (!seen.has(id)) missing += 1;
    }
    this.openByCompany.set(companyId, new Set(seenExternalIds));
    return missing;
  }

  async recordFeedHealth(record: FeedHealth): Promise<void> {
    this.healthRecords.push(record);
  }
}

function makeDeps(store: JobStore, fetchJson: FetchJson): RunnerDeps {
  let clock = 1_000_000;
  return {
    fetchJson,
    now: () => clock++,
    log: () => {},
    store,
  };
}

function company(overrides: Partial<RunnerCompany> = {}): RunnerCompany {
  return {
    company: "Acme",
    companyId: "co-acme",
    ats: "greenhouse",
    feed_url: "https://boards-api.greenhouse.io/v1/boards/acme/jobs?content=true",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Raw-response fixture builders — one per ATS, matching each adapter's
// documented request/response shape (see workers/ingestion/adapters/*.ts).
// ---------------------------------------------------------------------------

function greenhouseFixture(jobIds: string[]) {
  return {
    jobs: jobIds.map((id) => ({
      id,
      title: `Engineer ${id}`,
      absolute_url: `https://boards.greenhouse.io/acme/jobs/${id}`,
      updated_at: "2026-07-20T00:00:00.000Z",
      location: { name: "Berlin, Germany" },
      content: "<p>Build things.</p>",
    })),
  };
}

function leverFixture(jobIds: string[]) {
  return jobIds.map((id) => ({
    id,
    text: `Engineer ${id}`,
    categories: { location: "Remote - Europe" },
    hostedUrl: `https://jobs.lever.co/acme/${id}`,
    createdAt: "2026-07-20T00:00:00.000Z",
    descriptionPlain: "Build things.",
  }));
}

function ashbyFixture(jobIds: string[]) {
  return {
    jobs: jobIds.map((id) => ({
      id,
      title: `Engineer ${id}`,
      location: "Amsterdam, Netherlands",
      isRemote: false,
      publishedAt: "2026-07-20T00:00:00.000Z",
      jobUrl: `https://jobs.ashbyhq.com/acme/${id}`,
      descriptionPlain: "Build things.",
    })),
  };
}

function workableFixture(jobIds: string[]) {
  return {
    jobs: jobIds.map((id) => ({
      title: `Engineer ${id}`,
      shortcode: id,
      url: `https://apply.workable.com/acme/j/${id}/`,
      published_on: "2026-07-20T00:00:00.000Z",
      city: "Lisbon",
      country: "Portugal",
      description: "Build things.",
    })),
  };
}

function smartRecruitersFixture(jobIds: string[]) {
  return {
    totalFound: jobIds.length,
    content: jobIds.map((id) => ({
      id,
      name: `Engineer ${id}`,
      releasedDate: "2026-07-20T00:00:00.000Z",
      location: { city: "Paris", country: "France" },
      ref: `https://api.smartrecruiters.com/v1/companies/acme/postings/${id}`,
    })),
  };
}

const byNumber = (a: number, b: number) => a - b;

// ---------------------------------------------------------------------------

describe("runIngestion", () => {
  it("happy path: routes every ATS type, upserts jobs, marks nothing missing on a first run", async () => {
    const companies: RunnerCompany[] = [
      company({
        company: "GreenCo",
        companyId: "co-green",
        ats: "greenhouse",
        feed_url: "https://boards-api.greenhouse.io/v1/boards/green/jobs?content=true",
      }),
      company({
        company: "LeverCo",
        companyId: "co-lever",
        ats: "lever",
        feed_url: "https://api.lever.co/v0/postings/lever?mode=json",
      }),
      company({
        company: "AshbyCo",
        companyId: "co-ashby",
        ats: "ashby",
        feed_url: "https://api.ashbyhq.com/posting-api/job-board/ashbyco",
      }),
      company({
        company: "WorkableCo",
        companyId: "co-workable",
        ats: "workable",
        feed_url: "https://apply.workable.com/api/v1/widget/accounts/workableco",
      }),
      company({
        company: "SmartCo",
        companyId: "co-smart",
        ats: "smartrecruiters",
        feed_url: "https://api.smartrecruiters.com/v1/companies/smartco/postings",
      }),
    ];

    const fetchJson: FetchJson = async (url) => {
      if (url.includes("green")) return { status: 200, json: greenhouseFixture(["g1", "g2"]) };
      if (url.includes("lever")) return { status: 200, json: leverFixture(["l1"]) };
      if (url.includes("ashbyco")) return { status: 200, json: ashbyFixture(["a1", "a2", "a3"]) };
      if (url.includes("workableco")) return { status: 200, json: workableFixture(["w1"]) };
      if (url.includes("smartco")) return { status: 200, json: smartRecruitersFixture(["s1", "s2"]) };
      throw new Error(`unexpected url ${url}`);
    };

    const store = new InMemoryJobStore();
    const deps = makeDeps(store, fetchJson);

    const summary = await runIngestion(companies, deps);

    expect(summary.companiesRun).toBe(5);
    expect(summary.ok).toBe(5);
    expect(summary.failed).toBe(0);
    expect(summary.failures).toEqual([]);
    expect(summary.jobsUpserted).toBe(9); // 2 + 1 + 3 + 1 + 2
    expect(summary.jobsMarkedMissing).toBe(0);
    expect(summary.durationMs).toBeGreaterThanOrEqual(0);

    expect(store.healthRecords).toHaveLength(5);
    expect(store.healthRecords.every((h) => h.ok)).toBe(true);
    expect(store.healthRecords.map((h) => h.jobCount).sort(byNumber)).toEqual([1, 1, 2, 2, 3]);

    const allUpserted = store.upsertCalls.flat();
    expect(allUpserted).toHaveLength(9);
    for (const job of allUpserted) {
      expect(job.companyId).toBeTruthy();
      expect(job.verifiedAt).toBeTruthy();
    }
  });

  it("isolates a failing feed — it never aborts the run and lands in failures", async () => {
    const companies: RunnerCompany[] = [
      company({
        company: "GoodCo",
        companyId: "co-good",
        ats: "lever",
        feed_url: "https://api.lever.co/v0/postings/good?mode=json",
      }),
      company({
        company: "BrokenCo",
        companyId: "co-broken",
        ats: "lever",
        feed_url: "https://api.lever.co/v0/postings/broken?mode=json",
      }),
      company({
        company: "ThrowsCo",
        companyId: "co-throws",
        ats: "lever",
        feed_url: "https://api.lever.co/v0/postings/throws?mode=json",
      }),
    ];

    const fetchJson: FetchJson = async (url) => {
      if (url.includes("good")) return { status: 200, json: leverFixture(["l1", "l2"]) };
      if (url.includes("broken")) return { status: 500, json: null };
      if (url.includes("throws")) throw new Error("network exploded");
      throw new Error(`unexpected url ${url}`);
    };

    const store = new InMemoryJobStore();
    const deps = makeDeps(store, fetchJson);

    const summary = await runIngestion(companies, deps);

    expect(summary.companiesRun).toBe(3);
    expect(summary.ok).toBe(1);
    expect(summary.failed).toBe(2);
    expect(summary.jobsUpserted).toBe(2);
    expect(summary.failures).toHaveLength(2);
    expect(summary.failures.map((f) => f.company).sort()).toEqual(["BrokenCo", "ThrowsCo"]);
    expect(summary.failures.find((f) => f.company === "ThrowsCo")?.error).toContain(
      "network exploded",
    );

    // Failing companies are never passed to markMissing — no trustworthy
    // "what's open now" data this cycle (see run.ts deviation note).
    expect(store.missingCalls.map((m) => m.companyId)).toEqual(["co-good"]);

    expect(store.healthRecords).toHaveLength(3);
    expect(store.healthRecords.find((h) => h.company === "BrokenCo")?.ok).toBe(false);
    expect(store.healthRecords.find((h) => h.company === "ThrowsCo")?.ok).toBe(false);
    expect(store.healthRecords.find((h) => h.company === "ThrowsCo")?.error).toContain(
      "network exploded",
    );
  });

  it("treats a 200 with an empty jobs array as healthy, not a failure (D13 #3)", async () => {
    const companies: RunnerCompany[] = [
      company({
        company: "QuietCo",
        companyId: "co-quiet",
        ats: "lever",
        feed_url: "https://api.lever.co/v0/postings/quiet?mode=json",
      }),
    ];
    const fetchJson: FetchJson = async () => ({ status: 200, json: [] });

    const store = new InMemoryJobStore();
    store.seedOpenJobs("co-quiet", ["old1", "old2"]);
    const deps = makeDeps(store, fetchJson);

    const summary = await runIngestion(companies, deps);

    expect(summary.ok).toBe(1);
    expect(summary.failed).toBe(0);
    expect(summary.jobsUpserted).toBe(0);
    // Healthy-but-empty DOES flow into markMissing (unlike a real outage) —
    // the board genuinely reports zero open roles right now.
    expect(store.missingCalls).toEqual([{ companyId: "co-quiet", seenExternalIds: [] }]);
    expect(summary.jobsMarkedMissing).toBe(2);
    expect(store.healthRecords[0]).toMatchObject({ ok: true, jobCount: 0 });
  });

  it("reports jobs no longer present in the feed to markMissing", async () => {
    const companies: RunnerCompany[] = [
      company({
        company: "AcmeCo",
        companyId: "co-acme2",
        ats: "lever",
        feed_url: "https://api.lever.co/v0/postings/acme2?mode=json",
      }),
    ];
    const fetchJson: FetchJson = async () => ({
      status: 200,
      json: leverFixture(["keep1", "new1"]),
    });

    const store = new InMemoryJobStore();
    store.seedOpenJobs("co-acme2", ["keep1", "gone1", "gone2"]);
    const deps = makeDeps(store, fetchJson);

    const summary = await runIngestion(companies, deps);

    expect(store.missingCalls).toEqual([
      { companyId: "co-acme2", seenExternalIds: ["keep1", "new1"] },
    ]);
    expect(summary.jobsMarkedMissing).toBe(2); // gone1, gone2
  });

  it("resolves a dual-ATS company to one authoritative source (D13 #4) and still reports health for both legs", async () => {
    const companies: RunnerCompany[] = [
      company({
        company: "Ledger",
        companyId: "co-ledger",
        ats: "greenhouse",
        feed_url: "https://boards-api.greenhouse.io/v1/boards/ledger/jobs?content=true",
      }),
      company({
        company: "Ledger",
        companyId: "co-ledger",
        ats: "lever",
        feed_url: "https://api.lever.co/v0/postings/ledger?mode=json",
      }),
    ];

    const fetchJson: FetchJson = async (url) => {
      // Smaller board.
      if (url.includes("greenhouse")) return { status: 200, json: greenhouseFixture(["gh1", "gh2"]) };
      // Larger board -> wins per D13 #4.
      if (url.includes("lever")) return { status: 200, json: leverFixture(["lv1", "lv2", "lv3"]) };
      throw new Error(`unexpected url ${url}`);
    };

    const store = new InMemoryJobStore();
    const deps = makeDeps(store, fetchJson);

    const summary = await runIngestion(companies, deps);

    // One distinct company, not two routes.
    expect(summary.companiesRun).toBe(1);
    expect(summary.ok).toBe(1);
    expect(summary.failed).toBe(0);

    // Both legs still get their own health record.
    expect(store.healthRecords).toHaveLength(2);
    expect(store.healthRecords.find((h) => h.ats === "greenhouse")).toMatchObject({
      ok: true,
      jobCount: 2,
    });
    expect(store.healthRecords.find((h) => h.ats === "lever")).toMatchObject({
      ok: true,
      jobCount: 3,
    });

    // Only the winning (larger) board's jobs get upserted — no cross-source
    // duplicates.
    expect(summary.jobsUpserted).toBe(3);
    const upserted = store.upsertCalls.flat();
    expect(upserted.every((j) => j.source === "lever")).toBe(true);
    expect(upserted.map((j) => j.external_id).sort()).toEqual(["lv1", "lv2", "lv3"]);
  });

  it("respects the concurrency cap — never more than N companies in flight at once", async () => {
    const companies: RunnerCompany[] = Array.from({ length: 9 }, (_, i) =>
      company({
        company: `Co${i}`,
        companyId: `co-${i}`,
        ats: "lever",
        feed_url: `https://api.lever.co/v0/postings/co${i}?mode=json`,
      }),
    );

    let inFlight = 0;
    let maxInFlight = 0;
    const fetchJson: FetchJson = async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return { status: 200, json: leverFixture([]) };
    };

    const store = new InMemoryJobStore();
    const deps = makeDeps(store, fetchJson);

    const summary = await runIngestion(companies, deps, { concurrency: 3 });

    expect(maxInFlight).toBeLessThanOrEqual(3);
    expect(maxInFlight).toBeGreaterThan(1); // proves it's actually concurrent, not serialized
    expect(summary.companiesRun).toBe(9);
    expect(summary.ok).toBe(9);
  });

  it("defaults concurrency to 4 when opts is omitted", async () => {
    const companies: RunnerCompany[] = Array.from({ length: 6 }, (_, i) =>
      company({
        company: `Co${i}`,
        companyId: `co-${i}`,
        ats: "lever",
        feed_url: `https://api.lever.co/v0/postings/co${i}?mode=json`,
      }),
    );

    let inFlight = 0;
    let maxInFlight = 0;
    const fetchJson: FetchJson = async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return { status: 200, json: leverFixture([]) };
    };

    const store = new InMemoryJobStore();
    const deps = makeDeps(store, fetchJson);

    await runIngestion(companies, deps);

    expect(maxInFlight).toBeLessThanOrEqual(4);
  });

  it("summary numbers add up across a mixed run (ok/failed/upserted/missing all reconcile)", async () => {
    const companies: RunnerCompany[] = [
      company({
        company: "Ok1",
        companyId: "co-ok1",
        ats: "lever",
        feed_url: "https://api.lever.co/v0/postings/ok1?mode=json",
      }),
      company({
        company: "Ok2",
        companyId: "co-ok2",
        ats: "greenhouse",
        feed_url: "https://boards-api.greenhouse.io/v1/boards/ok2/jobs?content=true",
      }),
      company({
        company: "Empty1",
        companyId: "co-empty1",
        ats: "workable",
        feed_url: "https://apply.workable.com/api/v1/widget/accounts/empty1",
      }),
      company({
        company: "Down1",
        companyId: "co-down1",
        ats: "ashby",
        feed_url: "https://api.ashbyhq.com/posting-api/job-board/down1",
      }),
    ];

    const fetchJson: FetchJson = async (url) => {
      if (url.includes("ok1")) return { status: 200, json: leverFixture(["a", "b"]) };
      if (url.includes("ok2")) return { status: 200, json: greenhouseFixture(["c"]) };
      if (url.includes("empty1")) return { status: 200, json: workableFixture([]) };
      if (url.includes("down1")) return { status: 503, json: null };
      throw new Error(`unexpected url ${url}`);
    };

    const store = new InMemoryJobStore();
    store.seedOpenJobs("co-empty1", ["stale1"]);
    const deps = makeDeps(store, fetchJson);

    const summary = await runIngestion(companies, deps);

    expect(summary.companiesRun).toBe(summary.ok + summary.failed);
    expect(summary.failures).toHaveLength(summary.failed);
    expect(summary.jobsUpserted).toBe(store.upsertCalls.flat().length);

    expect(summary.ok).toBe(3);
    expect(summary.failed).toBe(1);
    expect(summary.failures[0]).toMatchObject({ company: "Down1" });
    // Empty1 had one stale job and saw none this run.
    expect(summary.jobsMarkedMissing).toBe(1);
  });

  it("emits a run_complete log event carrying the same summary that is returned", async () => {
    const companies: RunnerCompany[] = [
      company({
        company: "Acme",
        companyId: "co-acme",
        ats: "lever",
        feed_url: "https://api.lever.co/v0/postings/acme?mode=json",
      }),
    ];
    const fetchJson: FetchJson = async () => ({ status: 200, json: leverFixture(["z1"]) });
    const store = new InMemoryJobStore();
    const events: RunEvent[] = [];
    let clock = 1_000_000;
    const deps: RunnerDeps = {
      fetchJson,
      now: () => clock++,
      log: (event) => events.push(event),
      store,
    };

    const summary = await runIngestion(companies, deps);

    const complete = events.find((e): e is Extract<RunEvent, { type: "run_complete" }> =>
      e.type === "run_complete",
    );
    expect(complete).toBeTruthy();
    expect(complete?.summary).toEqual(summary);

    // Per-company lifecycle events were also emitted.
    expect(events.some((e) => e.type === "company_start")).toBe(true);
    expect(events.some((e) => e.type === "company_ok")).toBe(true);
  });

  it("never performs a real network call — fetchJson is fully injected", async () => {
    const originalFetch = globalThis.fetch;
    let sawGlobalFetch = false;
    globalThis.fetch = (() => {
      sawGlobalFetch = true;
      throw new Error("runner must not call global fetch");
    }) as typeof fetch;

    try {
      const companies: RunnerCompany[] = [company()];
      const fetchJson: FetchJson = async () => ({
        status: 200,
        json: greenhouseFixture(["g1"]),
      });
      const store = new InMemoryJobStore();
      const deps = makeDeps(store, fetchJson);

      await runIngestion(companies, deps);
      expect(sawGlobalFetch).toBe(false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
