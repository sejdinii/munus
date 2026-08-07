import { FACT_KINDS, isFactKind, type CvFact } from "./types";

/**
 * Cleans + validates LLM-shaped fact output. The model can return junk,
 * duplicates, overlong strings, or wrong kinds — this is the guard that
 * keeps the `facts` table honest (and keeps the prompt cheap to write).
 */

const MAX_FACTS = { role: 10, skill: 40, outcome: 15, education: 10 } as const;
const MAX_CONTENT = 280;
const MAX_SOURCE = 160;

export function cleanFacts(raw: unknown): CvFact[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const counts: Record<string, number> = {};
  const facts: CvFact[] = [];

  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;
    const kind = record.kind;
    const content = typeof record.content === "string" ? record.content.trim() : "";
    if (!isFactKind(kind) || content.length < 2 || content.length > MAX_CONTENT) {
      continue;
    }
    const key = `${kind}:${content.toLowerCase()}`;
    if (seen.has(key)) continue;
    const count = counts[kind] ?? 0;
    if (count >= MAX_FACTS[kind]) continue;

    const source = typeof record.source_span === "string"
      ? record.source_span.trim().slice(0, MAX_SOURCE)
      : undefined;

    seen.add(key);
    counts[kind] = count + 1;
    facts.push({ kind, content, source_span: source || undefined });
  }

  return facts;
}

/** Strict parser for the model's JSON response — returns [] on any failure
 *  so callers can degrade to the manual fallback without crashing. */
export function parseFactsJson(text: string): CvFact[] {
  try {
    const parsed = JSON.parse(text);
    const facts =
      Array.isArray(parsed) ? parsed
      : Array.isArray(parsed?.facts) ? parsed.facts
      : null;
    return facts ? cleanFacts(facts) : [];
  } catch {
    return [];
  }
}

export { FACT_KINDS };
