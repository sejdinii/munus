/**
 * workers/ingestion/config/seed.test.ts
 *
 * Data-quality guards for the seed list, not adapter behavior tests (the
 * adapters already have their own suites). These exist because SEED_COMPANIES
 * is hand-transcribed data at ~175 rows — the kind of input where a typo'd
 * host, a copy-pasted duplicate, or a missing field is easy to miss by eye
 * and easy to catch by machine.
 */

import { describe, expect, it } from "vitest";
import { SEED_COMPANIES } from "./seed";
import type { AtsSource } from "../types";

const VALID_ATS: readonly AtsSource[] = [
  "greenhouse",
  "lever",
  "ashby",
  "workable",
  "smartrecruiters",
];

/** Hostnames each ATS's feed_url is allowed to resolve to, per CONTRACTS §2
 * rule #2 (Greenhouse + Lever both have a documented EU-hosted variant). */
const HOST_PATTERN: Record<AtsSource, RegExp> = {
  greenhouse: /^boards-api\.(eu\.)?greenhouse\.io$/,
  lever: /^api\.(eu\.)?lever\.co$/,
  ashby: /^api\.ashbyhq\.com$/,
  workable: /^apply\.workable\.com$/,
  smartrecruiters: /^api\.smartrecruiters\.com$/,
};

function hostnameOf(url: string): string {
  return new URL(url).hostname;
}

describe("SEED_COMPANIES — shape", () => {
  it("is non-empty and reasonably close to BACKLOG's ~174 running total", () => {
    // BACKLOG.md's own running total after Batch 5 is 174; this file keeps
    // 175 (Batch 4 Tranche 2 has 3 well-formed Greenhouse rows against the
    // founder's own arithmetic of 2 — see seed.ts header) and drops one
    // (Pollfish) whose own caveat says its slug wasn't independently
    // confirmed. An exact-length assertion means any future accidental
    // duplication or silent drop fails this test and forces a deliberate
    // review rather than passing quietly.
    expect(SEED_COMPANIES.length).toBe(175);
  });

  it.each(SEED_COMPANIES)("$company ($ats): has a non-empty company name", (entry) => {
    expect(entry.company.trim().length).toBeGreaterThan(0);
  });

  it.each(SEED_COMPANIES)("$company ($ats): has a valid AtsSource", (entry) => {
    expect(VALID_ATS).toContain(entry.ats);
  });

  it.each(SEED_COMPANIES)("$company ($ats): feed_url is https", (entry) => {
    expect(entry.feed_url.startsWith("https://")).toBe(true);
    // Must also be a parseable absolute URL, not just a string that happens
    // to start with "https://".
    expect(() => new URL(entry.feed_url)).not.toThrow();
  });

  it.each(SEED_COMPANIES)("$company ($ats): feed_url host matches its ats", (entry) => {
    const host = hostnameOf(entry.feed_url);
    expect(host).toMatch(HOST_PATTERN[entry.ats]);
  });

  it.each(SEED_COMPANIES)("$company ($ats): carries verifiedVia + verifiedAt", (entry) => {
    expect(["search", "http"]).toContain(entry.verifiedVia);
    expect(entry.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("SEED_COMPANIES — dedupe", () => {
  it("has no duplicate feed_urls", () => {
    const seen = new Map<string, string[]>();
    for (const entry of SEED_COMPANIES) {
      const companies = seen.get(entry.feed_url) ?? [];
      companies.push(entry.company);
      seen.set(entry.feed_url, companies);
    }

    const duplicates = [...seen.entries()].filter(([, companies]) => companies.length > 1);
    expect(duplicates).toEqual([]);
  });

  it("has no duplicate (company, ats) pairs", () => {
    const seen = new Map<string, number>();
    for (const entry of SEED_COMPANIES) {
      const key = `${entry.company.toLowerCase()}::${entry.ats}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }

    const duplicates = [...seen.entries()].filter(([, count]) => count > 1);
    expect(duplicates).toEqual([]);
  });
});

describe("SEED_COMPANIES — per-ATS distribution", () => {
  function countByAts(): Record<AtsSource, number> {
    const counts: Record<AtsSource, number> = {
      greenhouse: 0,
      lever: 0,
      ashby: 0,
      workable: 0,
      smartrecruiters: 0,
    };
    for (const entry of SEED_COMPANIES) {
      counts[entry.ats] += 1;
    }
    return counts;
  }

  it("represents all five ATS sources with a non-trivial count each", () => {
    const counts = countByAts();

    for (const ats of VALID_ATS) {
      expect(counts[ats]).toBeGreaterThan(0);
    }

    // Report the distribution in the test output for visibility — this is
    // the same shape BACKLOG's own per-batch breakdowns use, kept here as a
    // live, always-current cross-check against hand-tallied prose.
    // eslint-disable-next-line no-console
    console.log("SEED_COMPANIES per-ATS distribution:", counts, "total:", SEED_COMPANIES.length);

    expect(counts.greenhouse + counts.lever + counts.ashby + counts.workable + counts.smartrecruiters).toBe(
      SEED_COMPANIES.length,
    );
  });

  it("keeps SmartRecruiters and Workable above a minimum floor (the two thinnest categories per BACKLOG)", () => {
    // BACKLOG's own multi-batch narrative repeatedly flags SmartRecruiters
    // and Workable as the laggard categories the founder was actively
    // rebalancing toward. A floor here catches a future edit that silently
    // strips one of the thinner sources back down.
    const counts = countByAts();
    expect(counts.smartrecruiters).toBeGreaterThanOrEqual(10);
    expect(counts.workable).toBeGreaterThanOrEqual(20);
  });
});
