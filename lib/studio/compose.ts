/* Composes export documents from the evidence store + verified, accepted
   suggestions — nothing else. The PDF can only contain facts and
   suggestions that survived the verifier AND were explicitly accepted
   (CONTRACTS §3.1: the user approves every change). */

import type { Job } from "@/lib/mock/jobs";
import type { CvDocument, LetterDocument } from "@/lib/pdf/types";
import type { Fact, Suggestion, VerifiedResult } from "./types";

const PLACEHOLDER_NAME = "Your Name";

export function composeCvDocument(
  facts: Fact[],
  accepted: Suggestion[],
  headline: string | undefined,
): CvDocument {
  const acceptedCv = accepted.filter((s) => s.docKind === "cv");
  const experience = facts
    .filter((f) => f.kind === "role" || f.kind === "outcome")
    .map((f) => f.content);
  const skills = facts.filter((f) => f.kind === "skill").map((f) => f.content);
  const education = facts
    .filter((f) => f.kind === "education")
    .map((f) => f.content);

  const sections: CvDocument["sections"] = [];
  if (acceptedCv.length > 0) {
    sections.push({
      heading: "Tailored highlights",
      bullets: acceptedCv.map((s) => s.text),
    });
  }
  if (experience.length) sections.push({ heading: "Experience", bullets: experience });
  if (skills.length) sections.push({ heading: "Skills", bullets: skills });
  if (education.length) sections.push({ heading: "Education", bullets: education });

  return {
    name: PLACEHOLDER_NAME,
    headline: headline ?? "Product designer",
    sections,
  };
}

export function composeLetterDocument(
  job: Job,
  kit: VerifiedResult,
  accepted: Suggestion[],
): LetterDocument {
  const acceptedLetter = accepted.filter((s) => s.docKind === "letter");
  const [greeting, ...rest] = kit.letterParagraphs;
  const closing = rest.pop();
  const paragraphs = [
    greeting ?? `Hello ${job.company} team,`,
    ...rest,
    ...acceptedLetter.map((s) => s.text),
    closing ?? "I would welcome the opportunity to discuss the work.",
  ].filter((p): p is string => Boolean(p));

  return {
    recipientCompany: job.company,
    paragraphs,
    signoffName: PLACEHOLDER_NAME,
  };
}
