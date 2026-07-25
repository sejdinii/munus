import { describe, expect, it } from "vitest";
import { fetchGreenhouseJobs } from "./greenhouse";
import type { CompanyFeed, FetchJson } from "../types";
import jobsFixture from "../fixtures/greenhouse-jobs.json";
import emptyFixture from "../fixtures/greenhouse-empty.json";
import notFoundFixture from "../fixtures/greenhouse-404.json";

const feed: CompanyFeed = {
  company: "Northstar",
  ats: "greenhouse",
  feed_url: "https://boards-api.greenhouse.io/v1/boards/northstar/jobs?content=true",
};

describe("greenhouse adapter", () => {
  it("parses a populated fixture into normalized jobs", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: jobsFixture });
    const result = await fetchGreenhouseJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.source).toBe("greenhouse");
    expect(result.host).toBe("boards-api.greenhouse.io");
    expect(result.jobs).toHaveLength(4);
    for (const j of result.jobs) {
      expect(j.source).toBe("greenhouse");
    }

    const backend = result.jobs.find((j) => j.external_id === "4102931");
    expect(backend?.title).toBe("Senior Backend Engineer");
    expect(backend?.location).toBe("Berlin, Germany");
    expect(backend?.remote).toBe(false);
    expect(backend?.salary_min).toBe(65000);
    expect(backend?.salary_max).toBe(80000);
    expect(backend?.currency).toBe("EUR");
    expect(backend?.apply_url).toBe("https://boards.greenhouse.io/northstar/jobs/4102931");
    expect(backend?.description).not.toMatch(/<[^>]+>/); // HTML stripped

    const marketing = result.jobs.find((j) => j.external_id === "4102932");
    expect(marketing?.remote).toBe(true); // "Remote - Europe" location
    expect(marketing?.salary_min).toBeNull();
    expect(marketing?.salary_max).toBeNull();
    expect(marketing?.currency).toBeNull();

    const support = result.jobs.find((j) => j.external_id === "4102933");
    expect(support?.salary_min).toBe(82000);
    expect(support?.salary_max).toBe(96000);
    expect(support?.currency).toBe("GBP");

    const dataEng = result.jobs.find((j) => j.external_id === "4102934");
    expect(dataEng?.remote).toBe(true); // "Remote - US"
    expect(dataEng?.salary_min).toBe(150000);
    expect(dataEng?.salary_max).toBe(180000);
    expect(dataEng?.currency).toBe("USD");
  });

  it("treats a 200 with an empty jobs array as healthy, not an error (D13 #3)", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: emptyFixture });
    const result = await fetchGreenhouseJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.jobs).toEqual([]);
  });

  it("falls back to the EU host on a 404 from the primary host (D13 #2)", async () => {
    const seenUrls: string[] = [];
    let calls = 0;
    const fetchJson: FetchJson = async (url) => {
      seenUrls.push(url);
      calls += 1;
      if (calls === 1) return { status: 404, json: notFoundFixture };
      return { status: 200, json: jobsFixture };
    };

    const result = await fetchGreenhouseJobs(feed, fetchJson);

    expect(calls).toBe(2);
    expect(seenUrls[0]).toContain("boards-api.greenhouse.io");
    expect(seenUrls[1]).toContain("boards-api.eu.greenhouse.io");
    expect(result.healthy).toBe(true);
    expect(result.host).toBe("boards-api.eu.greenhouse.io");
    expect(result.feedUrl).toContain("boards-api.eu.greenhouse.io");
    expect(result.jobs).toHaveLength(4);
  });

  it("reports unhealthy with a recorded error when both hosts 404", async () => {
    const fetchJson: FetchJson = async () => ({ status: 404, json: notFoundFixture });
    const result = await fetchGreenhouseJobs(feed, fetchJson);

    expect(result.healthy).toBe(false);
    expect(result.jobs).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it("reports unhealthy on an unexpected status without retrying", async () => {
    let calls = 0;
    const fetchJson: FetchJson = async () => {
      calls += 1;
      return { status: 500, json: null };
    };

    const result = await fetchGreenhouseJobs(feed, fetchJson);

    expect(calls).toBe(1);
    expect(result.healthy).toBe(false);
    expect(result.error).toContain("500");
  });

  it("never performs a real network call — fetchJson is fully injected", async () => {
    let sawGlobalFetchOverride = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => {
      sawGlobalFetchOverride = true;
      throw new Error("adapter must not call global fetch");
    }) as typeof fetch;

    try {
      const fetchJson: FetchJson = async () => ({ status: 200, json: emptyFixture });
      await fetchGreenhouseJobs(feed, fetchJson);
      expect(sawGlobalFetchOverride).toBe(false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
