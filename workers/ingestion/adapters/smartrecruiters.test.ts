import { describe, expect, it } from "vitest";
import {
  fetchSmartRecruitersJobs,
  SMARTRECRUITERS_NEEDS_DETAIL_FETCH,
  SMARTRECRUITERS_SOURCE,
} from "./smartrecruiters";
import type { CompanyFeed, FetchJson } from "../types";
import postingsFixture from "../fixtures/smartrecruiters-postings.json";
import emptyFixture from "../fixtures/smartrecruiters-empty.json";

const feed: CompanyFeed = {
  company: "Northstar",
  ats: SMARTRECRUITERS_SOURCE,
  feed_url: "https://api.smartrecruiters.com/v1/companies/Northstar/postings",
};

describe("smartrecruiters adapter", () => {
  it("documents that the list endpoint needs a follow-up detail fetch", () => {
    expect(SMARTRECRUITERS_NEEDS_DETAIL_FETCH).toBe(true);
  });

  it("parses a populated fixture into normalized jobs, honestly (no description on the list endpoint)", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: postingsFixture });
    const result = await fetchSmartRecruitersJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.source).toBe(SMARTRECRUITERS_SOURCE);
    expect(result.host).toBe("api.smartrecruiters.com");
    expect(result.jobs).toHaveLength(3);

    for (const j of result.jobs) {
      expect(j.source).toBe(SMARTRECRUITERS_SOURCE);
      // The list endpoint never carries a description — this adapter must
      // never fabricate one, and must never guess a salary from text it
      // doesn't have (CONTRACTS §3 invariant 4 spirit).
      expect(j.description).toBe("");
      expect(j.salary_min).toBeNull();
      expect(j.salary_max).toBeNull();
      expect(j.currency).toBeNull();
    }

    const marketing = result.jobs.find((j) => j.external_id === "743991001");
    expect(marketing?.title).toBe("Field Marketing Manager");
    expect(marketing?.location).toBe("Paris, France");
    expect(marketing?.remote).toBe(false);
    expect(marketing?.apply_url).toBe(
      "https://api.smartrecruiters.com/v1/companies/Northstar/postings/743991001",
    );

    const csm = result.jobs.find((j) => j.external_id === "743991002");
    expect(csm?.location).toBe(""); // empty city/country in this fixture entry
    expect(csm?.remote).toBe(true); // location.remote flag

    const designer = result.jobs.find((j) => j.external_id === "743991003");
    expect(designer?.location).toBe("New York, United States");
    expect(designer?.remote).toBe(false);
  });

  it("treats a 200 with an empty content array as healthy, not an error (D13 #3)", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: emptyFixture });
    const result = await fetchSmartRecruitersJobs(feed, fetchJson);

    expect(result.healthy).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.jobs).toEqual([]);
  });

  it("reports unhealthy on a malformed response (missing content array)", async () => {
    const fetchJson: FetchJson = async () => ({ status: 200, json: { totalFound: 0 } });
    const result = await fetchSmartRecruitersJobs(feed, fetchJson);

    expect(result.healthy).toBe(false);
    expect(result.jobs).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it("reports unhealthy on an unexpected status without retrying (no EU-host quirk here)", async () => {
    let calls = 0;
    const fetchJson: FetchJson = async () => {
      calls += 1;
      return { status: 500, json: null };
    };

    const result = await fetchSmartRecruitersJobs(feed, fetchJson);

    expect(calls).toBe(1);
    expect(result.healthy).toBe(false);
    expect(result.error).toContain("500");
  });

  it("never performs a real network call — fetchJson is fully injected", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => {
      throw new Error("adapter must not call global fetch");
    }) as typeof fetch;

    try {
      const fetchJson: FetchJson = async () => ({ status: 200, json: emptyFixture });
      const result = await fetchSmartRecruitersJobs(feed, fetchJson);
      expect(result.healthy).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
