import { hasGroq } from "@/lib/env";
import { groqExtractor } from "./groq";
import { heuristicExtractor } from "./heuristic";
import type { FactsExtractor } from "./types";

export type { ExtractedFact, FactsExtractor } from "./types";
export { CvFileError, MAX_CV_BYTES, extractCvText } from "./extract-text";

export const factsExtractor: FactsExtractor = hasGroq
  ? groqExtractor
  : heuristicExtractor;
