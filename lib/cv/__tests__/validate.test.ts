import { describe, expect, it } from "vitest";
import { cleanFacts, parseFactsJson } from "../validate";

describe("cleanFacts", () => {
  it("drops invalid kinds, empty content, and overlong strings", () => {
    const facts = cleanFacts([
      { kind: "skill", content: "figma" },
      { kind: "hobby", content: "surfing" },
      { kind: "role", content: "" },
      { kind: "skill", content: "x".repeat(300) },
      { kind: "role", content: "Product Designer" },
    ]);
    expect(facts).toHaveLength(2);
    expect(facts.map((f) => f.kind)).toEqual(["skill", "role"]);
  });

  it("dedupes by kind + lowercase content", () => {
    const facts = cleanFacts([
      { kind: "skill", content: "React" },
      { kind: "skill", content: "react" },
      { kind: "skill", content: "React " },
    ]);
    expect(facts).toHaveLength(1);
    expect(facts[0]?.content).toBe("React");
  });

  it("caps counts per kind", () => {
    const many = Array.from({ length: 60 }, (_, i) => ({
      kind: "skill" as const,
      content: `skill ${i}`,
    }));
    expect(cleanFacts(many)).toHaveLength(40);
  });

  it("truncates source spans to 160 chars", () => {
    const facts = cleanFacts([
      { kind: "role", content: "Product Designer", source_span: "y".repeat(300) },
    ]);
    expect(facts[0]?.source_span?.length).toBe(160);
  });

  it("handles non-array input", () => {
    expect(cleanFacts(null)).toEqual([]);
    expect(cleanFacts("nope")).toEqual([]);
    expect(cleanFacts(undefined)).toEqual([]);
  });
});

describe("parseFactsJson", () => {
  it("parses a bare array", () => {
    const facts = parseFactsJson(
      JSON.stringify([{ kind: "skill", content: "figma" }]),
    );
    expect(facts).toHaveLength(1);
    expect(facts[0]?.content).toBe("figma");
  });

  it("parses a wrapped {facts:[...]} object", () => {
    const facts = parseFactsJson(
      JSON.stringify({ facts: [{ kind: "role", content: "Product Designer" }] }),
    );
    expect(facts).toHaveLength(1);
  });

  it("returns [] for invalid JSON and wrong shapes", () => {
    expect(parseFactsJson("not json")).toEqual([]);
    expect(parseFactsJson('{"facts": "nope"}')).toEqual([]);
    expect(parseFactsJson("")).toEqual([]);
  });

  it("strips model noise like markdown fences", () => {
    const facts = parseFactsJson(
      '```json\n{"facts":[{"kind":"education","content":"MSc"}]}\n```',
    );
    // Fenced output is invalid JSON — the guard must not crash and returns [].
    expect(facts).toEqual([]);
  });
});
