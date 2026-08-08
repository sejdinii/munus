/**
 * Real Groq tailor provider (W3-live, D17: openai/gpt-oss-120b). Same
 * TailorProvider interface as the mock — the verifier gates everything
 * regardless of which provider ran. Strict JSON output, facts-constrained:
 * suggestions may ONLY cite fact ids handed in the request; anything else
 * is dropped by the verifier (zero escapes is a launch KPI).
 */

import type {
  Fact,
  Suggestion,
  TailorProvider,
  TailorRequest,
  TailorResult,
} from "./types";
import type { GroqUsage } from "@/lib/cv/facts-groq";

const TAILOR_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const TAILOR_MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are the tailoring engine of a job app. Given a candidate's PROVEN facts (from their CV) and one job, produce suggestions for a tailored CV and cover letter.

Return STRICT JSON:
{"suggestions":[{"docKind":"cv"|"letter","kind":"content"|"instruction","label":"<SHORT UPPERCASE CHIP>","text":"<text>","factIds":["<fact id>",...]}]}

Rules:
- 4-8 suggestions total, split sensibly between cv and letter.
- "content" suggestions are document text (max 160 chars). "instruction" suggestions are editing actions (e.g. "Reorder experience to lead with analytics work") and must have label "Emphasize for this role".
- Every suggestion MUST cite at least one fact id from the provided list, and ONLY those ids. Never invent facts, numbers, or companies.
- Every content suggestion must be a faithful rephrasing of its cited facts — no additions.
- Labels are short uppercase chips (max 24 chars).`;

export function groqTailorProvider(
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
  onUsage?: (usage: GroqUsage) => void,
): TailorProvider {
  return {
    name: "groq",
    tailor(request: TailorRequest): Promise<TailorResult> {
      return callGroq(request, apiKey, fetchImpl, onUsage);
    },
  };
}

async function callGroq(
  request: TailorRequest,
  apiKey: string,
  fetchImpl: typeof fetch,
  onUsage?: (usage: GroqUsage) => void,
): Promise<TailorResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetchImpl(TAILOR_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: TAILOR_MODEL,
        temperature: 0.3,
        max_tokens: 1500,
        /* NOTE: no response_format here — gpt-oss-120b's json_object mode
           400s (json_validate_failed) on this prompt length; the STRICT
           JSON instruction + tolerant parser below + the verifier gate are
           the safety net instead. */
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildPrompt(request),
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) return { suggestions: [] };
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return { suggestions: [] };
    onUsage?.({
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
    });
    return { suggestions: parseSuggestions(content, request.facts) };
  } catch {
    return { suggestions: [] };
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt(request: TailorRequest): string {
  /* Short ids (f1..fN) in the prompt: models reliably cite simple tokens;
     long UUIDs get mis-copied and the whole suggestion gets dropped by
     the verifier. parseSuggestions maps them back to real ids. */
  const facts = request.facts
    .map((f, i) => `- f${i + 1} [${f.kind}] ${f.content}`)
    .join("\n");
  const toneLine = request.tone ? `\nTone: ${request.tone}` : "";
  return `JOB\nTitle: ${request.job.title}\nCompany: ${request.job.company}\nLocation: ${request.job.location}\n\nJOB DESCRIPTION (excerpt):\n${(request.job.about ?? "").slice(0, 1200)}\n\nPROVEN FACTS (cite ids like f1, f2 — use ONLY these):\n${facts}${toneLine}`;
}

function parseSuggestions(content: string, facts: Fact[]): Suggestion[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Tolerant extraction: find the outermost {...} block (the model may
    // wrap the JSON in prose or fence markers without json_object mode).
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end <= start) return [];
    try {
      parsed = JSON.parse(content.slice(start, end + 1));
    } catch {
      return [];
    }
  }
  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { suggestions?: unknown } | null)?.suggestions)
      ? (parsed as { suggestions: unknown[] }).suggestions
      : [];

  // Prompt ids are f1..fN; map them back to the real fact ids.
  const shortToReal = new Map(facts.map((f, i) => [`f${i + 1}`, f.id]));
  const knownIds = new Set(facts.map((f) => f.id));
  const byId = new Map(facts.map((f) => [f.id, f]));

  const suggestions: Suggestion[] = [];
  for (const raw of list) {
    if (typeof raw !== "object" || raw === null) continue;
    const item = raw as Record<string, unknown>;
    const docKind = item.docKind === "letter" ? "letter" : "cv";
    const kind = item.kind === "instruction" ? "instruction" : "content";
    const label = typeof item.label === "string" ? item.label.trim().slice(0, 24) : "";
    const text = typeof item.text === "string" ? item.text.trim().slice(0, 220) : "";
    const factIds = Array.isArray(item.factIds)
      ? item.factIds.map((id) =>
          typeof id === "string" ? (shortToReal.get(id) ?? id) : "",
        )
      : [];
    if (!label || !text || factIds.length === 0) continue;
    // ANY unknown id drops the whole suggestion (verifier semantics).
    if (!factIds.every((id) => knownIds.has(id))) continue;
    const known = factIds;

    const cited = known.map((id) => byId.get(id)!);
    const evidenceLabel =
      kind === "instruction"
        ? "From your CV"
        : `✓ From your CV · ${cited[0]!.kind}`;

    suggestions.push({
      id: `sug-${suggestions.length + 1}`,
      docKind,
      kind,
      label: label.toUpperCase(),
      text,
      factIds: known,
      evidenceLabel,
    });
  }
  return suggestions;
}
