/* Studio pipeline contracts — CONTRACTS.md §3.1 (evidence-only AI) made
   concrete. Every suggestion must cite fact ids from the evidence store;
   the verifier (verifier.ts) is the blocking gate between any provider and
   the UI. Real Groq provider lands when GROQ_API_KEY exists; the mock
   provider implements the same interface. */

import type { Job } from "@/lib/mock/jobs";

/** CONTRACTS §2 `facts` table: the evidence store extracted from the CV. */
export type FactKind = "role" | "skill" | "outcome" | "education";

export type Fact = {
  id: string;
  kind: FactKind;
  content: string;
  /** Where in the CV this came from — powers evidence chips. */
  sourceSpan: string;
};

export type DocKind = "cv" | "letter";

export type Suggestion = {
  id: string;
  docKind: DocKind;
  /** content = text that appears in a document; instruction = an editing
      action (e.g. reorder) that must never be exported as document text
      (critic W3 #4). */
  kind: "content" | "instruction";
  /** Uppercase chip label, e.g. "Emphasize for this role". */
  label: string;
  text: string;
  /** Evidence citations — MUST resolve against the facts store. */
  factIds: string[];
  /** Human-readable evidence chip, e.g. '✓ From "Workflow launch" project'. */
  evidenceLabel: string;
};

/* Providers return ONLY suggestions. There is deliberately no free-text
   channel: the letter's greeting/closing are fixed app templates, and every
   substantive paragraph is a verifier-gated letter suggestion
   (critic W3 #3 — §3.1 hole closed). */
export type TailorResult = {
  suggestions: Suggestion[];
};

export type TailorRequest = {
  job: Job;
  facts: Fact[];
  tone: string | null;
};

export interface TailorProvider {
  readonly name: string;
  tailor(request: TailorRequest): Promise<TailorResult>;
}

export type VerifierDrop = {
  suggestion: Suggestion;
  reason: "no-evidence-cited" | "unknown-fact-id";
};

export type VerifiedResult = {
  suggestions: Suggestion[];
  dropped: VerifierDrop[];
};
