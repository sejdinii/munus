import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * W5a — GDPR export + delete. Every table that holds user data is covered:
 * profiles, facts, llm_usage, and CV files in storage. Delete is cascade-
 * safe by FK design (facts/llm_usage reference profiles with on delete
 * cascade); storage files are removed explicitly, then the auth user.
 */

export type GdprExport = {
  exportedAt: string;
  user: { id: string; email: string | undefined; name: string | undefined };
  profile: Record<string, unknown> | null;
  facts: Array<{ kind: string; content: string; sourceSpan: string | null; createdAt: string }>;
  llmUsage: Array<{ endpoint: string; model: string; promptTokens: number; completionTokens: number; costEur: number; createdAt: string }>;
  files: Array<{ name: string; kind: string; size: number | null }>;
};

export async function collectExport(
  db: SupabaseClient,
  storage: SupabaseClient["storage"],
  userId: string,
  email: string | undefined,
  name: string | undefined,
): Promise<GdprExport> {
  const { data: profileRows } = await db
    .from("profiles")
    .select("*")
    .eq("id", userId);
  const { data: factRows } = await db
    .from("facts")
    .select("kind, content, source_span, created_at")
    .eq("profile_id", userId)
    .order("created_at", { ascending: true });
  const { data: usageRows } = await db
    .from("llm_usage")
    .select("endpoint, model, prompt_tokens, completion_tokens, cost_eur, created_at")
    .eq("profile_id", userId)
    .order("created_at", { ascending: true });
  const { data: cvFiles } = await storage.from("cv-uploads").list("");

  return {
    exportedAt: new Date().toISOString(),
    user: { id: userId, email, name },
    profile: profileRows?.[0] ?? null,
    facts: (factRows ?? []).map((f) => ({
      kind: String((f as { kind: unknown }).kind ?? ""),
      content: String((f as { content: unknown }).content ?? ""),
      sourceSpan: (f as { source_span: unknown }).source_span == null ? null : String((f as { source_span: unknown }).source_span),
      createdAt: String((f as { created_at: unknown }).created_at ?? ""),
    })),
    llmUsage: (usageRows ?? []).map((u) => ({
      endpoint: String((u as { endpoint: unknown }).endpoint ?? ""),
      model: String((u as { model: unknown }).model ?? ""),
      promptTokens: Number((u as { prompt_tokens: unknown }).prompt_tokens ?? 0),
      completionTokens: Number((u as { completion_tokens: unknown }).completion_tokens ?? 0),
      costEur: Number((u as { cost_eur: unknown }).cost_eur ?? 0),
      createdAt: String((u as { created_at: unknown }).created_at ?? ""),
    })),
    files: (cvFiles ?? [])
      .filter((f) => (f as { name: string }).name)
      .map((f) => ({
        name: (f as { name: string }).name,
        kind: String((f as { kind?: string }).kind ?? "file"),
        size: (f as { metadata?: { size?: number } }).metadata?.size ?? null,
      })),
  };
}

export async function deleteAccount(db: SupabaseClient, storage: SupabaseClient["storage"], userId: string): Promise<void> {
  const { data: cvFiles } = await storage.from("cv-uploads").list("");
  const names = (cvFiles ?? []).map((f) => (f as { name: string }).name).filter(Boolean);
  if (names.length > 0) {
    const { error: removeError } = await storage.from("cv-uploads").remove(names);
    if (removeError) throw new Error("failed to remove CV files");
  }
  // facts + llm_usage cascade via profiles FK.
  const { error } = await db.from("profiles").delete().eq("id", userId);
  if (error) throw new Error("failed to delete profile");
}
