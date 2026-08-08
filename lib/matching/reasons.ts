/**
 * LLM reason polish (W2, D33 cost control): the rule layer scores every job;
 * the model only rewrites REASONS for the top candidates, cached in
 * job_matches. A reason here is a short honest line — never invented facts.
 */

const REASON_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const REASON_MODEL = "openai/gpt-oss-120b";

import type { GroqUsage } from "@/lib/cv/facts-groq";

const SYSTEM_PROMPT = `You write the "why this job matches" lines for a job-matching app.
Given a candidate's proven facts (from their CV) and one job, return STRICT JSON:
{"reasons":["<line 1>","<line 2>"]}

Rules:
- 1-3 short lines (max 90 chars each), first-person-neutral, honest.
- ONLY use facts listed as proven. If nothing matches, return {"reasons":[]}.
- Never invent experience, skills, or numbers. No fluff, no bullet chars.`;

export interface ReasonInput {
  jobTitle: string;
  jobDescription: string;
  provenFacts: string[];
}

export async function polishReasons(
  input: ReasonInput,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
  onUsage?: (usage: GroqUsage) => void,
): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetchImpl(REASON_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: REASON_MODEL,
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Proven facts:\n${input.provenFacts.join("\n")}\n\nJob: ${input.jobTitle}\n${input.jobDescription.slice(0, 1500)}`,
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) return [];
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
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return [];
    }
    const reasons = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { reasons?: unknown } | null)?.reasons)
        ? (parsed as { reasons: unknown[] }).reasons
        : [];
    return reasons
      .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
      .map((r) => r.trim().slice(0, 90))
      .slice(0, 3);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
