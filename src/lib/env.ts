// Single place that decides which adapter backs each external service
// (CONTRACTS.md §3). UI and route code never read these env vars directly.

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
};

/** Real Supabase project configured → real auth/db/storage adapters. */
export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/** Groq key configured → LLM facts extraction; otherwise heuristic parser. */
export const hasGroq = Boolean(env.groqApiKey);
