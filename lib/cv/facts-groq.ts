import { parseFactsJson } from "./validate";
import type { CvFact } from "./types";

/**
 * Groq-backed extraction (D33: gpt-oss-120b is the MVP workhorse —
 * $0.15/$0.60 per 1M tokens, 131k ctx). Pure fetch, no SDK needed.
 */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b"; // Groq model id (D33 workhorse)

const SYSTEM_PROMPT = `You extract structured facts from a job-seeker's CV.
Return STRICT JSON only, no markdown, shaped as:
{"facts":[{"kind":"role|skill|outcome|education|profile|contact","content":"<fact text>","source_span":"<short verbatim excerpt from the CV>"}]}

Rules:
- kind=role: the professional roles the person has held or targets (max 10).
- kind=skill: concrete skills/tools/technologies (max 40, keep canonical casing, dedupe).
- kind=outcome: achievements with measurable impact (max 15; prefer ones with numbers).
- kind=education: degrees, institutions, certifications (max 10).
- kind=profile: the CV's summary/profile paragraph, verbatim-ish (max 1, up to 600 chars).
- kind=contact: contact details, one fact per item — email, phone, website, LinkedIn, GitHub, location (max 8). Content like "Email: name@example.com".
- content: 2-280 chars (profile up to 600), plain text, no bullets, no quotes.
- source_span: 10-160 chars, verbatim from the CV.
- If the CV text is unreadable or empty, return {"facts":[]}.`;

export type GroqUsage = { promptTokens: number; completionTokens: number } | null;

export async function extractFactsGroq(
  text: string,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
  onUsage?: (usage: GroqUsage) => void,
): Promise<CvFact[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetchImpl(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        /* W5b fix: 2000 was truncating full-CV fact JSON mid-response; the
           truncated JSON then failed parsing and silently fell back to the
           contact-only mock extractor (user saw "only name and email").
           gpt-oss-120b supports long outputs; 4096 leaves ample room. */
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Extract facts from this CV:\n\n${text.slice(0, 24_000)}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Groq API ${response.status}: ${await response.text().catch(() => "")}`);
    }
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return [];
    onUsage?.({
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
    });
    return parseFactsJson(content);
  } finally {
    clearTimeout(timer);
  }
}
