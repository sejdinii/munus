import { describe, expect, it } from "vitest";
import { composeCvDocument, composeLetterDocument } from "./compose";
import { mockFacts } from "./facts";
import { jobs } from "../mock/jobs";
import type { Suggestion, VerifiedResult } from "./types";

const cvSuggestion: Suggestion = {
  id: "cv-1",
  docKind: "cv",
  label: "Emphasize",
  text: "Accepted CV line",
  factIds: ["fact-outcome-workflow"],
  evidenceLabel: "✓",
};
const letterSuggestion: Suggestion = {
  ...cvSuggestion,
  id: "letter-1",
  docKind: "letter",
  text: "Accepted letter paragraph",
};

describe("compose — export contains only evidence + accepted changes", () => {
  it("CV includes tailored highlights only when accepted", () => {
    const withAccept = composeCvDocument(mockFacts, [cvSuggestion], "Designer");
    expect(withAccept.sections[0]?.heading).toBe("Tailored highlights");
    const withoutAccept = composeCvDocument(mockFacts, [], "Designer");
    expect(withoutAccept.sections[0]?.heading).toBe("Experience");
  });

  it("CV sections come verbatim from the facts store", () => {
    const doc = composeCvDocument(mockFacts, [], undefined);
    const allBullets = doc.sections.flatMap((s) => s.bullets);
    for (const bullet of allBullets) {
      expect(mockFacts.some((f) => f.content === bullet)).toBe(true);
    }
  });

  it("letter interleaves accepted paragraphs before the closing line", () => {
    const kit: VerifiedResult = {
      suggestions: [],
      letterParagraphs: ["Hello team,", "Body.", "Closing."],
      dropped: [],
    };
    const doc = composeLetterDocument(jobs[0]!, kit, [letterSuggestion]);
    expect(doc.paragraphs).toEqual([
      "Hello team,",
      "Body.",
      "Accepted letter paragraph",
      "Closing.",
    ]);
  });

  it("letter-kind acceptance never leaks into the CV and vice versa", () => {
    const cv = composeCvDocument(mockFacts, [letterSuggestion], undefined);
    expect(cv.sections[0]?.heading).toBe("Experience");
    const kit: VerifiedResult = {
      suggestions: [],
      letterParagraphs: ["Hi,", "Bye."],
      dropped: [],
    };
    const letter = composeLetterDocument(jobs[0]!, kit, [cvSuggestion]);
    expect(letter.paragraphs).toEqual(["Hi,", "Bye."]);
  });
});
