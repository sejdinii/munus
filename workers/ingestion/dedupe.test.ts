import { describe, expect, it } from "vitest";
import { dedupeJobs, resolveCompanySource } from "./dedupe";
import type { IngestionResult, NormalizedJob } from "./types";

function job(overrides: Partial<NormalizedJob>): NormalizedJob {
  return {
    source: "greenhouse",
    external_id: "1",
    title: "Engineer",
    location: "Berlin",
    remote: false,
    salary_min: null,
    salary_max: null,
    currency: null,
    description: "",
    apply_url: "https://example.com/1",
    posted_at: "2026-07-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("dedupeJobs — key is (source, external_id)", () => {
  it("collapses repeats of the same key, keeping the freshest posted_at", () => {
    const stale = job({ external_id: "42", posted_at: "2026-07-18T00:00:00.000Z" });
    const fresh = job({ external_id: "42", posted_at: "2026-07-21T00:00:00.000Z" });

    const result = dedupeJobs([stale, fresh]);

    expect(result).toHaveLength(1);
    expect(result[0]?.posted_at).toBe("2026-07-21T00:00:00.000Z");
  });

  it("leaves distinct (source, external_id) combinations untouched", () => {
    const a = job({ source: "greenhouse", external_id: "1" });
    const b = job({ source: "lever", external_id: "1" }); // same external_id, different source
    const c = job({ source: "greenhouse", external_id: "2" });

    expect(dedupeJobs([a, b, c])).toHaveLength(3);
  });

  it("returns an empty list for empty input", () => {
    expect(dedupeJobs([])).toEqual([]);
  });
});

function ingestionResult(overrides: Partial<IngestionResult>): IngestionResult {
  return {
    company: "Ledger",
    source: "greenhouse",
    host: "boards-api.greenhouse.io",
    feedUrl: "https://boards-api.greenhouse.io/v1/boards/ledger/jobs?content=true",
    jobs: [],
    healthy: true,
    ...overrides,
  };
}

describe("resolveCompanySource — dual-ATS migration tolerance (D13 #4)", () => {
  it("prefers the source with more postings", () => {
    const greenhouseSide = ingestionResult({
      source: "greenhouse",
      jobs: [job({ source: "greenhouse", external_id: "1" }), job({ source: "greenhouse", external_id: "2" })],
    });
    const leverSide = ingestionResult({
      source: "lever",
      host: "api.lever.co",
      feedUrl: "https://api.lever.co/v0/postings/ledger?mode=json",
      jobs: [
        job({ source: "lever", external_id: "a" }),
        job({ source: "lever", external_id: "b" }),
        job({ source: "lever", external_id: "c" }),
      ],
    });

    const winner = resolveCompanySource([greenhouseSide, leverSide]);

    expect(winner.source).toBe("lever");
    expect(winner.jobs).toHaveLength(3);
  });

  it("breaks a tie in posting count by freshness", () => {
    const olderBoard = ingestionResult({
      source: "greenhouse",
      jobs: [job({ posted_at: "2026-07-10T00:00:00.000Z" })],
    });
    const newerBoard = ingestionResult({
      source: "lever",
      jobs: [job({ source: "lever", posted_at: "2026-07-22T00:00:00.000Z" })],
    });

    const winner = resolveCompanySource([olderBoard, newerBoard]);

    expect(winner.source).toBe("lever");
  });

  it("throws on an empty result list rather than silently picking nothing", () => {
    expect(() => resolveCompanySource([])).toThrow();
  });
});
