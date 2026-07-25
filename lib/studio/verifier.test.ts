import { describe, expect, it, vi } from "vitest";
import { mockFacts } from "./facts";
import { verify } from "./verifier";
import { generateKit } from "./pipeline";
import { mockTailorProvider } from "./mockProvider";
import { jobs } from "../mock/jobs";
import type { Suggestion, TailorProvider, TailorResult } from "./types";

const validSuggestion: Suggestion = {
  id: "s1",
  docKind: "cv",
  kind: "content",
  label: "Emphasize",
  text: "Grounded claim",
  factIds: ["fact-outcome-workflow"],
  evidenceLabel: "✓ From project",
};

function result(suggestions: Suggestion[]): TailorResult {
  return { suggestions };
}

describe("verifier — the blocking gate (CONTRACTS §3.1)", () => {
  it("passes suggestions whose fact ids all resolve", () => {
    const v = verify(result([validSuggestion]), mockFacts);
    expect(v.suggestions).toHaveLength(1);
    expect(v.dropped).toHaveLength(0);
  });

  it("drops suggestions citing no evidence at all", () => {
    const v = verify(
      result([{ ...validSuggestion, id: "s2", factIds: [] }]),
      mockFacts,
    );
    expect(v.suggestions).toHaveLength(0);
    expect(v.dropped[0]?.reason).toBe("no-evidence-cited");
  });

  it("drops suggestions citing unknown fact ids — invented evidence", () => {
    const v = verify(
      result([{ ...validSuggestion, id: "s3", factIds: ["fact-invented"] }]),
      mockFacts,
    );
    expect(v.suggestions).toHaveLength(0);
    expect(v.dropped[0]?.reason).toBe("unknown-fact-id");
  });

  it("one bad citation poisons the whole suggestion (all-or-nothing)", () => {
    const v = verify(
      result([
        {
          ...validSuggestion,
          id: "s4",
          factIds: ["fact-outcome-workflow", "fact-invented"],
        },
      ]),
      mockFacts,
    );
    expect(v.suggestions).toHaveLength(0);
    expect(v.dropped[0]?.reason).toBe("unknown-fact-id");
  });

  it("logs every drop (the zero-escapes audit trail)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    verify(result([{ ...validSuggestion, id: "s5", factIds: [] }]), mockFacts);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("pipeline — the gate cannot be skipped", () => {
  it("filters a lying provider before the UI ever sees it", async () => {
    const lyingProvider: TailorProvider = {
      name: "liar",
      async tailor() {
        return result([
          validSuggestion,
          {
            ...validSuggestion,
            id: "invented",
            text: "I ran a hedge fund",
            factIds: ["fact-hedge-fund"],
          },
        ]);
      },
    };
    const job = jobs[0]!;
    const v = await generateKit(lyingProvider, job, mockFacts, null);
    expect(v.suggestions.map((s) => s.id)).toEqual(["s1"]);
    expect(v.dropped).toHaveLength(1);
  });

  it("mock provider output is fully verifiable end-to-end (no drops)", async () => {
    const job = jobs.find((j) => j.id === "loomery")!;
    const v = await generateKit(mockTailorProvider, job, mockFacts, null);
    expect(v.suggestions.length).toBeGreaterThanOrEqual(4);
    expect(v.dropped).toHaveLength(0);
  }, 10000);

  it("there is NO unverified free-text channel in the result (W3 #3)", async () => {
    const job = jobs[0]!;
    const v = await generateKit(mockTailorProvider, job, mockFacts, null);
    expect(Object.keys(v).sort()).toEqual(["dropped", "suggestions"]);
  }, 10000);

  it("Shorter tone never mangles interpolated job titles (W3 #2)", async () => {
    const growth = jobs.find((j) => j.title.includes(","))!;
    const v = await generateKit(mockTailorProvider, growth, mockFacts, "Shorter");
    for (const s of v.suggestions) {
      expect(s.text).not.toMatch(/\.\./);
      if (s.id === "letter-intro") expect(s.text).toContain(growth.title);
    }
  }, 10000);

  it("tone regeneration stays grounded (same fact ids, different words)", async () => {
    const job = jobs.find((j) => j.id === "northstar")!;
    const neutral = await generateKit(mockTailorProvider, job, mockFacts, null);
    const warmer = await generateKit(mockTailorProvider, job, mockFacts, "Warmer");
    expect(warmer.dropped).toHaveLength(0);
    expect(warmer.suggestions.map((s) => s.factIds)).toEqual(
      neutral.suggestions.map((s) => s.factIds),
    );
    expect(warmer.suggestions[0]?.text).not.toEqual(
      neutral.suggestions[0]?.text,
    );
  }, 10000);
});
