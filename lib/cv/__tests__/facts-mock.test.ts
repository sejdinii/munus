import { describe, expect, it } from "vitest";
import { extractFactsMock } from "../facts-mock";

const FIXTURE_CV = `Enes Sejdini
Product Designer — Berlin

SUMMARY
Product designer with 6 years of experience building design systems and running usability testing. 

EXPERIENCE
2021–2024  Senior Product Designer, Nordwind GmbH (Berlin)
- Built a design system used by 12 product teams, cutting design time by 30%.
- Led usability testing with 40+ users across three products.
- Increased activation by 18% through onboarding redesign.
- Collaborated with engineers on React + TypeScript implementation.

2020–2021  UX/UI Designer, Studio K

EDUCATION
MSc Data Science, Lancaster University Leipzig (2024–2026)
Bachelor's degree in Computer Science, University of Hamburg (2019)

SKILLS
Figma, prototyping, React, TypeScript, SQL, A/B testing, Agile, Jira
`;

describe("extractFactsMock", () => {
  it("extracts the headline role from the CV", () => {
    const facts = extractFactsMock(FIXTURE_CV);
    const roles = facts.filter((f) => f.kind === "role").map((f) => f.content);
    expect(roles).toContain("Product Designer — Berlin");
    // Role lines keep their year prefixes — that is the evidence trail.
    expect(roles.some((r) => r.includes("Senior Product Designer, Nordwind"))).toBe(true);
    expect(roles.some((r) => r.includes("UX/UI Designer, Studio K"))).toBe(true);
  });

  it("extracts skills from the dictionary, deduplicated", () => {
    const facts = extractFactsMock(FIXTURE_CV);
    const skills = facts.filter((f) => f.kind === "skill").map((f) => f.content);
    expect(skills).toContain("react");
    expect(skills).toContain("typescript");
    expect(skills).toContain("figma");
    expect(skills).toContain("prototyping");
    expect(skills).toContain("sql");
    expect(skills).toContain("a/b testing");
    expect(skills).toContain("agile");
    expect(skills).toContain("design systems");
    expect(skills).toContain("usability testing");
    // No duplicates even though "React" and "react" both appear.
    expect(new Set(skills.map((s) => s.toLowerCase())).size).toBe(skills.length);
  });

  it("extracts education entries", () => {
    const facts = extractFactsMock(FIXTURE_CV);
    const education = facts
      .filter((f) => f.kind === "education")
      .map((f) => f.content);
    expect(education.some((e) => e.includes("MSc Data Science"))).toBe(true);
    expect(education.some((e) => e.includes("Bachelor"))).toBe(true);
  });

  it("extracts bullet outcomes with metrics", () => {
    const facts = extractFactsMock(FIXTURE_CV);
    const outcomes = facts.filter((f) => f.kind === "outcome");
    expect(outcomes.length).toBeGreaterThanOrEqual(2);
    expect(outcomes.some((o) => o.content.includes("30%"))).toBe(true);
    expect(outcomes.some((o) => o.content.includes("18%"))).toBe(true);
    expect(outcomes.every((o) => o.source_span)).toBe(true);
  });

  it("keeps source spans on every fact", () => {
    for (const fact of extractFactsMock(FIXTURE_CV)) {
      expect(fact.source_span?.length).toBeGreaterThan(0);
    }
  });

  it("returns no facts for garbage input", () => {
    expect(extractFactsMock("lorem ipsum dolor sit amet")).toHaveLength(0);
    expect(extractFactsMock("")).toHaveLength(0);
  });
});
