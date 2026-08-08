import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * W5a — LLM cost meter. The admin's water meter: every server-side AI call
 * records one row (endpoint, model, tokens, cost). Users never see it; the
 * cap (per-endpoint daily limit) is the invisible guardrail.
 */

export const MODEL_RATES: Record<string, { promptPerM: number; completionPerM: number }> = {
  "openai/gpt-oss-120b": { promptPerM: 0.15, completionPerM: 0.6 },
};

/** USD per call, treated as EUR (parity, honest approximation). */
export function costOf(model: string, promptTokens: number, completionTokens: number): number {
  const rates = MODEL_RATES[model];
  if (!rates) return 0;
  return (
    (promptTokens / 1_000_000) * rates.promptPerM +
    (completionTokens / 1_000_000) * rates.completionPerM
  );
}

export type LlmUsageRecord = {
  profileId: string;
  endpoint: "cv-parse" | "reasons" | "tailor";
  model: string;
  promptTokens: number;
  completionTokens: number;
  costEur: number;
};

export async function recordUsage(
  supabase: SupabaseClient,
  record: LlmUsageRecord,
): Promise<void> {
  const { error } = await supabase.from("llm_usage").insert({
    profile_id: record.profileId,
    endpoint: record.endpoint,
    model: record.model,
    prompt_tokens: record.promptTokens,
    completion_tokens: record.completionTokens,
    cost_eur: Number(record.costEur.toFixed(4)),
  });
  if (error) {
    // Metering must never break the feature it meters.
    console.error("[meter] failed to record usage:", error);
  }
}

export async function countToday(
  supabase: SupabaseClient,
  profileId: string,
  endpoint: LlmUsageRecord["endpoint"],
  now: Date = new Date(),
): Promise<number> {
  const { count } = await supabase
    .from("llm_usage")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("endpoint", endpoint)
    .gte("created_at", now.toISOString().slice(0, 10));
  return count ?? 0;
}
