import { describe, expect, it, vi } from "vitest";
import { groqTailorProvider } from "../groqProvider";
import type { Fact, TailorRequest } from "../types";

const FACTS: Fact[] = [
  { id: "f1", kind: "role", content: "Data scientist at LEORON", sourceSpan: "CV" },
  { id: "f2", kind: "skill", content: "Python, SQL", sourceSpan: "CV" },
  { id: "f3", kind: "outcome", content: "Ran 672 experiments", sourceSpan: "CV" },
];

const REQUEST: TailorRequest = {
  job: {
    id: "j1",
    title: "Senior Data Scientist",
    company: "Clera",
    location: "Berlin",
    about: "Python, machine learning, SQL",
    applyUrl: "https://example.com",
    monogram: "C",
    color: "#000",
    deck: "#000",
    pop: "#000",
    salary: "Not listed",
    type: "Full-time",
    source: "Company careers",
    fresh: "fresh",
    match: 56,
    reasons: ["a", "b"],
    concern: "",
  },
  facts: FACTS,
  tone: null,
};

function jsonResponse(suggestions: unknown) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content: JSON.stringify({ suggestions }) } }] }),
  } as Response;
}

describe("groqTailorProvider", () => {
  it("returns parsed suggestions citing known fact ids", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        { docKind: "cv", kind: "content", label: "Emphasize analytics", text: "Led analytics work", factIds: ["f3"] },
        { docKind: "letter", kind: "content", label: "Why this role", text: "Your Python and SQL fit", factIds: ["f2"] },
      ]),
    );
    const provider = groqTailorProvider("gsk-test", fetchMock);
    const result = await provider.tailor(REQUEST);
    expect(result.suggestions).toHaveLength(2);
    expect(result.suggestions[0]!.factIds).toEqual(["f3"]);
    expect(result.suggestions[1]!.evidenceLabel).toContain("your CV");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer gsk-test" }),
      }),
    );
  });

  it("drops suggestions citing unknown fact ids", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        { docKind: "cv", kind: "content", label: "Fake", text: "Invented experience", factIds: ["f1", "not-a-fact"] },
      ]),
    );
    const provider = groqTailorProvider("gsk-test", fetchMock);
    const result = await provider.tailor(REQUEST);
    expect(result.suggestions).toEqual([]);
  });

  it("returns an empty list on HTTP errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    const provider = groqTailorProvider("gsk-test", fetchMock);
    const result = await provider.tailor(REQUEST);
    expect(result.suggestions).toEqual([]);
  });

  it("maps short prompt ids (f1..fN) back to real fact ids", async () => {
    const uuidFacts: Fact[] = [
      { id: "3f1c0f0e-1111-4aaa-9bbb-000000000001", kind: "skill", content: "Python", sourceSpan: "CV" },
      { id: "3f1c0f0e-1111-4aaa-9bbb-000000000002", kind: "outcome", content: "Ran 672 experiments", sourceSpan: "CV" },
    ];
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        { docKind: "cv", kind: "content", label: "Lead with analytics", text: "Led the 672-experiment study", factIds: ["f2"] },
      ]),
    );
    const provider = groqTailorProvider("gsk-test", fetchMock);
    const result = await provider.tailor({ ...REQUEST, facts: uuidFacts });
    expect(result.suggestions[0]!.factIds).toEqual([uuidFacts[1]!.id]);
  });

  it("handles non-array suggestions shapes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ not: "an array" }),
    );
    const provider = groqTailorProvider("gsk-test", fetchMock);
    const result = await provider.tailor(REQUEST);
    expect(result.suggestions).toEqual([]);
  });
});
