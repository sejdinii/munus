import { describe, expect, it } from "vitest";
import {
  companyIdFor,
  dualAtsCompanyIds,
  runnerCompanies,
} from "./identity";
import { SEED_COMPANIES } from "./seed";
import type { SeedCompany } from "./seed";

function seed(company: string, ats: SeedCompany["ats"], url: string): SeedCompany {
  return {
    company,
    ats,
    feed_url: url,
    verifiedVia: "search",
    verifiedAt: "2026-07-26",
  };
}

describe("company identity (runner bridge)", () => {
  it("is stable and slug-like", () => {
    expect(companyIdFor("Trade Republic")).toBe("trade-republic");
    expect(companyIdFor("N26")).toBe("n26");
    expect(companyIdFor("Alice & Bob")).toBe("alice-bob");
  });

  it("strips accents so the same company never splits in two", () => {
    expect(companyIdFor("Doctolib")).toBe(companyIdFor("Doctolib"));
    expect(companyIdFor("Björn Borg")).toBe("bjorn-borg");
  });

  it("gives a dual-ATS company ONE id across both rows (rule #4)", () => {
    const rows = [
      seed("Back Market", "lever", "https://api.lever.co/v0/postings/backmarket?mode=json"),
      seed("Back Market", "ashby", "https://api.ashbyhq.com/posting-api/job-board/backmarket"),
    ];
    const [a, b] = runnerCompanies(rows);
    expect(a?.companyId).toBe(b?.companyId);
    expect(dualAtsCompanyIds(rows)).toEqual(["back-market"]);
  });

  it("does not merge genuinely different companies", () => {
    expect(companyIdFor("Cleo AI")).not.toBe(companyIdFor("Cleo"));
  });

  it("every real seed row gets a non-empty id", () => {
    const mapped = runnerCompanies();
    expect(mapped).toHaveLength(SEED_COMPANIES.length);
    expect(mapped.every((c) => c.companyId.length > 0)).toBe(true);
  });

  it("no two DIFFERENT companies collide on one id", () => {
    const byId = new Map<string, Set<string>>();
    for (const c of runnerCompanies()) {
      const names = byId.get(c.companyId) ?? new Set<string>();
      names.add(c.company);
      byId.set(c.companyId, names);
    }
    const collisions = [...byId.entries()].filter(([, n]) => n.size > 1);
    expect(collisions).toEqual([]);
  });
});

/* Type-level integration guard: the config's output must satisfy the
   runner's input contract. If either side drifts, this fails to compile
   rather than failing mysteriously at 3am against real feeds. */
import type { RunnerCompany } from "../runner/types";

describe("config → runner contract", () => {
  it("runnerCompanies() output is assignable to RunnerCompany[]", () => {
    const asRunnerInput: RunnerCompany[] = runnerCompanies();
    expect(asRunnerInput.length).toBe(SEED_COMPANIES.length);
  });
});
