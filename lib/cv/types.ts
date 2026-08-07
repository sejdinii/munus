/** Shared CV→facts types (TASK-104). Mirrors the `facts` table contract:
 *  fact_kind enum (role|skill|outcome|education) + content + source_span. */
export const FACT_KINDS = ["role", "skill", "outcome", "education"] as const;
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
