// LLM extractor (Groq · llama-3.3-70b). The verifier principle applies from
// day one: any fact whose sourceSpan can't be found in the CV text is dropped
// and logged — "AI may reframe, never invent" is enforced, not aspirational.

import { env } from "@/lib/env";
import type { FactKind } from "@/lib/types";
import type { ExtractedFact, FactsExtractor } from "./types";
import { heuristicExtractor } from "./heuristic";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MAX_INPUT_CHARS = 24_000;

const SYSTEM_PROMPT = `You extract structured career facts from a CV. Rules:
- Output ONLY facts stated in the text. Never infer, embellish, or generalize.
- Each fact: kind ("role" | "skill" | "outcome" | "education"), content (concise,
  one claim), source_span (a VERBATIM quote from the CV, max 140 chars, that
  evidences the fact).
- roles: job title + employer + dates when present.
- skills: tools, methods, domains — one skill per fact.
- outcomes: concrete achievements, ideally with numbers.
- education: degrees, institutions, certifications.
Respond as JSON: {"facts": [{"kind": "...", "content": "...", "source_span": "..."}]}`;

const KINDS: FactKind[] = ["role", "skill", "outcome", "education"];

export const groqExtractor: FactsExtractor = {
  async extract(cvText: string): Promise<ExtractedFact[]> {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: cvText.slice(0, MAX_INPUT_CHARS) },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`groq extract failed (${response.status}); using heuristic parser`);
      return heuristicExtractor.extract(cvText);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    let parsed: { facts?: Array<Record<string, unknown>> };
    try {
      parsed = JSON.parse(payload.choices?.[0]?.message?.content ?? "{}");
    } catch {
      console.error("groq extract returned unparseable JSON; using heuristic parser");
      return heuristicExtractor.extract(cvText);
    }

    const haystack = cvText.toLowerCase().replace(/\s+/g, " ");
    const verified: ExtractedFact[] = [];
    let dropped = 0;

    for (const raw of parsed.facts ?? []) {
      const kind = raw.kind as FactKind;
      const content = typeof raw.content === "string" ? raw.content.trim() : "";
      const sourceSpan =
        typeof raw.source_span === "string" ? raw.source_span.trim() : "";
      if (!KINDS.includes(kind) || !content) continue;

      // Blocking verifier gate: the quoted evidence must exist in the CV.
      const needle = sourceSpan.toLowerCase().replace(/\s+/g, " ");
      if (!needle || !haystack.includes(needle)) {
        dropped++;
        continue;
      }
      verified.push({ kind, content, sourceSpan });
    }

    if (dropped > 0) {
      console.warn(`facts verifier dropped ${dropped} unevidenced claim(s)`);
    }
    // An LLM run that verifies nothing is worse than the deterministic floor.
    return verified.length > 0 ? verified : heuristicExtractor.extract(cvText);
  },
};
