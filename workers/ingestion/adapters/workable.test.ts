import { describe, expect, it } from "vitest";
import { fetchWorkableJobs, WORKABLE_SOURCE } from "./workable";
import type { CompanyFeed, FetchJson } from "../types";
import jobsFixture from "../fixtures/workable-jobs.json";
import emptyFixture from "../fixtures/workable-empty.json";

const feed: CompanyFeed = {
  company: "Loomery",
  ats: WORKABLE_SOURCE,
  feed_url: "https://apply.workable.com/api/v1/widget/accounts/loomery",
};

describe("workable adapter", () => {
  it("parses a populated fixture into normalized jobs", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: jobsFixture });
    const result = await fetchWorkableJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.source).toBe(WORKABLE_SOURCE);
    expect(result.host).toBe("apply.workable.com");
    expect(result.jobs).toHaveLength(3);
    for (const j of result.jobs) {
      expect(j.source).toBe(WORKABLE_SOURCE);
    }

    const backend = result.jobs.find((j) => j.external_id === "A1B2C3D4");
    expect(backend?.title).toBe("Backend Engineer");
    expect(backend?.location).toBe("Berlin, Germany");
    expect(backend?.remote).toBe(false);
    expect(backend?.salary_min).toBe(68000);
    expect(backend?.salary_max).toBe(82000);
    expect(backend?.currency).toBe("EUR");
    expect(backend?.apply_url).toBe("https://apply.workable.com/loomery/j/A1B2C3D4/"); // legacy scheme

    const support = result.jobs.find((j) => j.external_id === "E5F6A7B8");
    expect(support?.location).toBe("Lisbon, Portugal");
    expect(support?.remote).toBe(true); // via locations[].remote
    expect(support?.salary_min).toBeNull();
    expect(support?.salary_max).toBeNull();
    expect(support?.currency).toBeNull();
    // FOUNDER RISK: hash-ID URL scheme, no account slug in the path at all —
    // parsing must not depend on (or attempt to derive) the URL's shape.
    expect(support?.apply_url).toBe("https://apply.workable.com/j/9C7D2E11FA/");

    const ae = result.jobs.find((j) => j.external_id === "C9D0E1F2");
    expect(ae?.location).toBe("London, United Kingdom");
    expect(ae?.remote).toBe(false);
    expect(ae?.salary_min).toBe(90000);
    expect(ae?.salary_max).toBe(110000);
    expect(ae?.currency).toBe("GBP");
    expect(ae?.apply_url).toBe("https://apply.workable.com/loomery/j/C9D0E1F2/"); // legacy scheme
  });

  it("treats a 200 with an empty jobs array as healthy, not an error (D13 #3)", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: emptyFixture });
    const result = await fetchWorkableJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.jobs).toEqual([]);
  });

  it("reports unhealthy on a malformed response (missing jobs array)", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: { name: "Loomery Widget" } });
    const result = await fetchWorkableJobs(feed, fetchJson);

    expect(result.healthy).toBe(false);
    expect(result.jobs).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it("reports unhealthy on an unexpected status without retrying (no EU-host quirk here)", async () => {
    let calls = 0;
    const fetchJson: FetchJson = async () => {
      calls += 1;
      return { status: 404, json: { error: "Account not found" } };
    };

    const result = await fetchWorkableJobs(feed, fetchJson);

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
      const result = await fetchWorkableJobs(feed, fetchJson);
      expect(result.healthy).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
