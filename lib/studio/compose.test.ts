import { describe, expect, it } from "vitest";
import {
  composeCvDocument,
  composeLetterDocument,
  LETTER_CLOSING,
  letterGreeting,
} from "./compose";
import { mockFacts } from "./facts";
import { jobs } from "../mock/jobs";
import type { Suggestion } from "./types";

const cvContent: Suggestion = {
  id: "cv-1",
  docKind: "cv",
  kind: "content",
  label: "Emphasize",
  text: "Accepted CV line",
  factIds: ["fact-outcome-workflow"],
  evidenceLabel: "✓",
};
const cvInstruction: Suggestion = {
  id: "cv-reorder-systems",
  docKind: "cv",
  kind: "instruction",
  label: "Reorder",
  text: "Move the design-system bullet to the top of Experience.",
  factIds: ["fact-skill-systems"],
  evidenceLabel: "✓",
};
const letterContent: Suggestion = {
  ...cvContent,
  id: "letter-1",
  docKind: "letter",
  text: "Accepted letter paragraph",
};

describe("compose — export contains only evidence + accepted content", () => {
  it("instruction-kind suggestions NEVER export as document text (W3 #4)", () => {
    const doc = composeCvDocument(mockFacts, [cvInstruction], undefined);
    const allText = doc.sections.flatMap((s) => s.bullets).join(" ");
    expect(allText).not.toContain("Move the design-system bullet");
  });

  it("accepted reorder instruction moves the systems fact to the top of Experience", () => {
    const doc = composeCvDocument(mockFacts, [cvInstruction], undefined);
    const experience = doc.sections.find((s) => s.heading === "Experience");
    const skills = doc.sections.find((s) => s.heading === "Skills");
    expect(experience?.bullets[0]).toContain("design system");
    expect(skills?.bullets.join(" ") ?? "").not.toContain(
      "multi-brand design system",
    );
  });

  it("facts superseded by an accepted highlight are suppressed (W3 #12)", () => {
    const doc = composeCvDocument(mockFacts, [cvContent], undefined);
    const experience = doc.sections.find((s) => s.heading === "Experience");
    expect(experience?.bullets.join(" ") ?? "").not.toContain(
      "Led discovery and end-to-end design for a new workflow product",
    );
    expect(doc.sections[0]?.bullets).toContain("Accepted CV line");
  });

  it("letter is fixed frame + accepted letter content only (W3 #3)", () => {
    const job = jobs[0]!;
    const withAccept = composeLetterDocument(job, [letterContent, cvContent]);
    expect(withAccept.paragraphs).toEqual([
      letterGreeting(job),
      "Accepted letter paragraph",
      LETTER_CLOSING,
    ]);
    const withoutAccept = composeLetterDocument(job, []);
    expect(withoutAccept.paragraphs).toEqual([
      letterGreeting(job),
      LETTER_CLOSING,
    ]);
  });

  it("CV base sections come verbatim from the facts store", () => {
    const doc = composeCvDocument(mockFacts, [], undefined);
    for (const bullet of doc.sections.flatMap((s) => s.bullets)) {
      expect(mockFacts.some((f) => f.content === bullet)).toBe(true);
    }
  });
});
