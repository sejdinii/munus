/** Shared CV→facts types (TASK-104). Mirrors the `facts` table contract:
 *  fact_kind enum (role|skill|outcome|education|profile|contact) + content
 *  + source_span. profile = the CV's summary paragraph; contact = one fact
 *  per contact detail (email/phone/links) — added 2026-08-07 so the export
 *  mirrors the original CV (founder: exported CV ignored the input). */
export const FACT_KINDS = [
  "role",
  "skill",
  "outcome",
  "education",
  "profile",
  "contact",
] as const;
export type FactKind = (typeof FACT_KINDS)[number];

export interface CvFact {
  kind: FactKind;
  content: string;
  /** The excerpt of the CV the fact came from (evidence trail). */
  source_span?: string;
}

export interface CvParseResult {
  documentId: string | null;
  fileName: string;
  facts: CvFact[];
  /** "mock" when GROQ_API_KEY is absent — the pipeline runs, the brain is stubbed. */
  provider: "mock" | "groq";
}

export const isFactKind = (value: unknown): value is FactKind =>
  typeof value === "string" && (FACT_KINDS as readonly string[]).includes(value);
