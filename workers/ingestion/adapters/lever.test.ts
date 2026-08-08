import { describe, expect, it } from "vitest";
import { fetchLeverJobs } from "./lever";
import type { CompanyFeed, FetchJson } from "../types";
import postingsFixture from "../fixtures/lever-jobs.json";

const feed: CompanyFeed = {
  company: "Loomery",
  ats: "lever",
  feed_url: "https://api.lever.co/v0/postings/loomery?mode=json",
};

describe("lever adapter", () => {
  it("parses a populated fixture into normalized jobs", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: postingsFixture });
    const result = await fetchLeverJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.source).toBe("lever");
    expect(result.host).toBe("api.lever.co");
    expect(result.jobs).toHaveLength(3);
    for (const j of result.jobs) {
      expect(j.source).toBe("lever");
    }

    const payments = result.jobs.find((j) => j.external_id === "a1b2c3d4-0001");
    expect(payments?.title).toBe("Software Engineer, Payments");
    expect(payments?.remote).toBe(true); // "Remote - Europe"
    expect(payments?.salary_min).toBe(70000);
    expect(payments?.salary_max).toBe(90000);
    expect(payments?.currency).toBe("EUR");
    expect(payments?.apply_url).toBe("https://jobs.lever.co/loomery/a1b2c3d4-0001");
    expect(payments?.posted_at).toBe(new Date(1784548800000).toISOString());

    const ae = result.jobs.find((j) => j.external_id === "a1b2c3d4-0002");
    expect(ae?.remote).toBe(false); // "Dublin, Ireland"
    expect(ae?.salary_min).toBeNull();
    expect(ae?.salary_max).toBeNull();
    expect(ae?.currency).toBeNull();

    const sre = result.jobs.find((j) => j.external_id === "a1b2c3d4-0003");
    expect(sre?.remote).toBe(true); // "Remote - US"
    expect(sre?.salary_min).toBe(135000);
    expect(sre?.salary_max).toBe(160000);
    expect(sre?.currency).toBe("USD");
  });

  it("treats a 200 with an empty postings array as healthy, not an error", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: [] });
    const result = await fetchLeverJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.jobs).toEqual([]);
  });

  it("has no EU-host fallback — a 404 is reported unhealthy directly", async () => {
    let calls = 0;
    const fetchJson: FetchJson = async () => {
      calls += 1;
      return { status: 404, json: { message: "Company not found" } };
    };

    const result = await fetchLeverJobs(feed, fetchJson);

    expect(calls).toBe(1);
    expect(result.healthy).toBe(false);
    expect(result.jobs).toEqual([]);
    expect(result.error).toContain("404");
  });

  it("reports unhealthy on a malformed (non-array) response", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: { not: "an array" } });
    const result = await fetchLeverJobs(feed, fetchJson);

    expect(result.healthy).toBe(false);
    expect(result.jobs).toEqual([]);
  });

  it("never performs a real network call — fetchJson is fully injected", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => {
      throw new Error("adapter must not call global fetch");
    }) as typeof fetch;

    try {
      const fetchJson: FetchJson = async () => ({ status: 200, json: [] });
      const result = await fetchLeverJobs(feed, fetchJson);
      expect(result.healthy).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
