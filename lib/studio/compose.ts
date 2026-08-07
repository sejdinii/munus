/* Composes export documents from the evidence store + verified, accepted
   suggestions — nothing else. The PDF can only contain facts and
   suggestions that survived the verifier AND were explicitly accepted
   (CONTRACTS §3.1: the user approves every change).

   Suggestion kinds matter here (critic W3 #4): content-kind text may enter
   a document; instruction-kind suggestions are editing ACTIONS (today:
   reorder) and must never be exported as prose. Facts superseded by an
   accepted content suggestion are suppressed from the base sections so the
   CV doesn't say the same thing twice (critic W3 #12). */

import type { Job } from "@/lib/mock/jobs";
import type { CvDocument, LetterDocument } from "@/lib/pdf/types";
import type { Fact, Suggestion } from "./types";

const PLACEHOLDER_NAME = "Your Name";

export function composeCvDocument(
  facts: Fact[],
  accepted: Suggestion[],
  headline: string | undefined,
  meta?: CvMeta,
): CvDocument {
  const acceptedCv = accepted.filter((s) => s.docKind === "cv");
  const contentCv = acceptedCv.filter((s) => s.kind === "content");
  const instructions = acceptedCv.filter((s) => s.kind === "instruction");

  /* Facts whose content an accepted suggestion supersedes stay out of the
     base sections — the tailored highlight replaces them. */
  const supersededIds = new Set(contentCv.flatMap((s) => s.factIds));

  let experience = facts
    .filter(
      (f) =>
        (f.kind === "role" || f.kind === "outcome") && !supersededIds.has(f.id),
    )
    .map((f) => f.content);
  let skills = facts
    .filter((f) => f.kind === "skill" && !supersededIds.has(f.id))
    .map((f) => f.content);
  const education = facts
    .filter((f) => f.kind === "education")
    .map((f) => f.content);

  /* The one instruction the mock provider issues: move the design-system
     bullet to the top of Experience. Applied as an ORDERING change. */
  if (instructions.some((s) => s.id === "cv-reorder-systems")) {
    const systemsFact = facts.find((f) => f.id === "fact-skill-systems");
    if (systemsFact && !supersededIds.has(systemsFact.id)) {
      skills = skills.filter((content) => content !== systemsFact.content);
      experience = [systemsFact.content, ...experience];
    }
  }

  /* Section order mirrors the source CV convention (founder: exported CV
     ignored the input): Profile → Education → Skills → Experience. The
     tailored highlights lead only when the user accepted changes. */
  const profile = facts.filter((f) => f.kind === "profile").map((f) => f.content);
  const contact = facts.filter((f) => f.kind === "contact").map((f) => f.content);

  const sections: CvDocument["sections"] = [];
  if (contentCv.length > 0) {
    sections.push({
      heading: "Tailored highlights",
      bullets: contentCv.map((s) => s.text),
    });
  }
  if (profile.length) sections.push({ heading: "Profile", bullets: profile });
  if (education.length) sections.push({ heading: "Education", bullets: education });
  if (skills.length) sections.push({ heading: "Skills", bullets: skills });
  if (experience.length) sections.push({ heading: "Experience", bullets: experience });

  return {
    name: meta?.name ?? PLACEHOLDER_NAME,
    headline: headline ?? "Product designer",
    contact: meta?.contact ?? contact,
    sections,
  };
}

export type CvMeta = {
  /** Real name from the authenticated identity (Google profile). */
  name?: string;
  /** Header lines that didn't come from the CV facts (e.g. location). */
  contact?: string[];
};

/** Fixed letter frame — app templates, not provider output (critic W3 #3). */
export function letterGreeting(job: Job): string {
  return `Hello ${job.company} team,`;
}
export const LETTER_CLOSING =
  "I would welcome the opportunity to discuss the work.";

export function composeLetterDocument(
  job: Job,
  accepted: Suggestion[],
  name?: string,
): LetterDocument {
  const body = accepted
    .filter((s) => s.docKind === "letter" && s.kind === "content")
    .map((s) => s.text);

  return {
    recipientCompany: job.company,
    paragraphs: [letterGreeting(job), ...body, LETTER_CLOSING],
    signoffName: name ?? PLACEHOLDER_NAME,
  };
}
