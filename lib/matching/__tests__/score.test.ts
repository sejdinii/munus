import { describe, expect, it } from "vitest";
import { normalizeRole, scoreJob, type MatchFact, type MatchJob, type MatchProfile } from "../score";

const PROFILE: MatchProfile = {
  role_target: "Data Scientist",
  level: "Mid-level",
  locations: ["Berlin"],
  workTypes: ["Remote", "Hybrid", "On-site"],
  salary_min: 60000,
};

const FACTS: MatchFact[] = [
  { kind: "role", content: "Data Scientist" },
  { kind: "role", content: "Machine Learning Engineer" },
  { kind: "skill", content: "Python" },
  { kind: "skill", content: "Machine Learning" },
  { kind: "skill", content: "SQL" },
  { kind: "skill", content: "XGBoost" },
  { kind: "education", content: "MSc Data Science" },
];

function job(overrides: Partial<MatchJob> = {}): MatchJob {
  return {
    id: "j1",
    title: "Data Scientist",
    location: "Berlin",
    remote: false,
    salary_min: 65000,
    salary_max: 85000,
    currency: "€",
    description: "Python, machine learning, SQL, XGBoost, A/B testing",
    verified_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("normalizeRole", () => {
  it("drops seniority words and punctuation", () => {
    expect(normalizeRole("Senior Product Designer (UX)")).toEqual(
      new Set(["product", "designer", "ux"]),
    );
  });
});

describe("scoreJob", () => {
  it("gives a strong match for a perfect fit", () => {
    const result = scoreJob(PROFILE, FACTS, job());
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.reasons.some((r) => r.includes("target role"))).toBe(true);
    expect(result.reasons.some((r) => r.includes("skills"))).toBe(true);
    expect(result.concern).toBeUndefined();
  });

  it("flags a salary below the floor as a concern but still scores", () => {
    const result = scoreJob(PROFILE, FACTS, job({ salary_min: 45000 }));
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.concern).toMatch(/below your/);
  });

  it("flags an out-of-area on-site job", () => {
    const result = scoreJob(PROFILE, FACTS, job({ location: "London", remote: false }));
    expect(result.reasons.some((r) => r.includes("outside your selected areas"))).toBe(true);
  });

  it("rewards remote jobs when the profile wants remote", () => {
    const result = scoreJob(PROFILE, FACTS, job({ location: "Paris", remote: true }));
    expect(result.reasons.some((r) => r.includes("Remote"))).toBe(true);
  });

  it("is honest about non-matching roles", () => {
    const result = scoreJob(PROFILE, FACTS, job({ title: "Accountant", description: "" }));
    expect(result.score).toBeLessThan(60);
    expect(result.reasons.some((r) => r.includes("target role"))).toBe(false);
  });

  it("never estimates an unlisted salary", () => {
    const result = scoreJob(PROFILE, FACTS, job({ salary_min: null, salary_max: null }));
    expect(result.reasons.some((r) => r.includes("floor"))).toBe(false);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it("caps the score at 100", () => {
    const result = scoreJob(PROFILE, FACTS, job());
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("handles a profile with no preferences neutrally", () => {
    const bare: MatchProfile = { locations: [], workTypes: [], salary_min: null };
    const result = scoreJob(bare, [], job());
    expect(Number.isFinite(result.score)).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("scores remote postings neutrally when the user excluded remote work", () => {
    const onsiteOnly: MatchProfile = { locations: [], workTypes: ["On-site"], salary_min: null };
    const result = scoreJob(onsiteOnly, [], job({ remote: true, location: "Remote" }));
    expect(result.reasons.some((r) => r.includes("didn't select remote"))).toBe(true);
    expect(result.score).toBeLessThan(60);
  });
});
