import { describe, expect, it } from "vitest";
import { ASHBY_SOURCE, fetchAshbyJobs } from "./ashby";
import type { CompanyFeed, FetchJson } from "../types";
import jobsFixture from "../fixtures/ashby-jobs.json";
import emptyFixture from "../fixtures/ashby-empty.json";

const feed: CompanyFeed = {
  company: "Northwind",
  ats: ASHBY_SOURCE,
  feed_url: "https://api.ashbyhq.com/posting-api/job-board/northwind",
};

describe("ashby adapter", () => {
  it("parses a populated fixture into normalized jobs", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: jobsFixture });
    const result = await fetchAshbyJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.source).toBe(ASHBY_SOURCE);
    expect(result.host).toBe("api.ashbyhq.com");
    expect(result.jobs).toHaveLength(3);
    for (const j of result.jobs) {
      expect(j.source).toBe(ASHBY_SOURCE);
    }

    const frontend = result.jobs.find((j) => j.external_id === "9f8b3c1a-0001");
    expect(frontend?.title).toBe("Senior Frontend Engineer");
    expect(frontend?.location).toBe("Amsterdam, Netherlands");
    expect(frontend?.remote).toBe(false);
    expect(frontend?.salary_min).toBe(70000);
    expect(frontend?.salary_max).toBe(85000);
    expect(frontend?.currency).toBe("EUR");
    expect(frontend?.apply_url).toBe("https://jobs.ashbyhq.com/northwind/9f8b3c1a-0001"); // jobUrl wins
    expect(frontend?.description).not.toMatch(/<[^>]+>/);

    const marketing = result.jobs.find((j) => j.external_id === "9f8b3c1a-0002");
    // isRemote is false, but secondaryLocations includes "Remote - US" — the
    // OR-with-detectRemote path must still flip this to true.
    expect(marketing?.remote).toBe(true);
    expect(marketing?.salary_min).toBeNull();
    expect(marketing?.salary_max).toBeNull();
    expect(marketing?.currency).toBeNull();

    const sre = result.jobs.find((j) => j.external_id === "9f8b3c1a-0003");
    expect(sre?.remote).toBe(true); // isRemote: true
    // This fixture entry has no jobUrl at all — must fall back to applyUrl.
    expect(sre?.apply_url).toBe("https://jobs.ashbyhq.com/northwind/9f8b3c1a-0003/application");
    expect(sre?.salary_min).toBe(145000);
    expect(sre?.salary_max).toBe(170000);
    expect(sre?.currency).toBe("USD");
  });

  it("treats a 200 with an empty jobs array as healthy, not an error (D13 #3)", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: emptyFixture });
    const result = await fetchAshbyJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.jobs).toEqual([]);
  });

  it("reports unhealthy on a malformed response (missing jobs array)", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: { error: "not found" } });
    const result = await fetchAshbyJobs(feed, fetchJson);

    expect(result.healthy).toBe(false);
    expect(result.jobs).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it("reports unhealthy on an unexpected status without retrying (no EU-host quirk here)", async () => {
    let calls = 0;
    const fetchJson: FetchJson = async () => {
      calls += 1;
      return { status: 404, json: { message: "not found" } };
    };

    const result = await fetchAshbyJobs(feed, fetchJson);

    expect(calls).toBe(1);
    expect(result.healthy).toBe(false);
    expect(result.error).toContain("404");
  });

  it("never performs a real network call — fetchJson is fully injected", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => {
      throw new Error("adapter must not call global fetch");
    }) as typeof fetch;

    try {
      const fetchJson: FetchJson = async () => ({ status: 200, json: emptyFixture });
      const result = await fetchAshbyJobs(feed, fetchJson);
      expect(result.healthy).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
