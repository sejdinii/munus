import type { FactKind } from "@/lib/types";

export type ExtractedFact = {
  kind: FactKind;
  content: string;
  /** Verbatim snippet from the CV that evidences this fact. */
  sourceSpan?: string;
};

export interface FactsExtractor {
  extract(cvText: string): Promise<ExtractedFact[]>;
}
