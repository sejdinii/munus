import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreJob, type MatchFact, type MatchJob, type MatchProfile } from "@/lib/matching/score";
import { polishReasons } from "@/lib/matching/reasons";
import { recordUsage, costOf } from "@/lib/llm/meter";

/**
 * W2 deck API — GET /api/deck
 * Auth-bound: loads the caller's profile + CV facts, scores the open job
 * pool with the rule layer, returns the top 30 with reasons. LLM reason
 * polish for the top 8 on cache miss (job_matches), rule reasons otherwise.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const TOP_N = 30;
const LLM_POLISH_N = 8;
const PAGE = 1000;

interface DeckJobRow {
  id: string;
  title: string;
  location: string | null;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  description: string | null;
  apply_url: string;
  verified_at: string | null;
  companies: { name: string } | { name: string }[] | null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 1. Profile + facts (the user's evidence).
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role_target, role_targets, level, locations, work_types, salary_min")
    .eq("id", user.id)
    .single();
  const { data: factRows } = await supabase
    .from("facts")
    .select("kind, content")
    .eq("profile_id", user.id);
  const profile: MatchProfile = {
    role_target: profileRow?.role_target ?? null,
    role_targets: profileRow?.role_targets ?? [],
    level: profileRow?.level ?? null,
    locations: profileRow?.locations ?? [],
    workTypes: profileRow?.work_types ?? ["Remote", "Hybrid", "On-site"],
    salary_min: profileRow?.salary_min ?? null,
  };
  const facts: MatchFact[] = (factRows ?? []).map((f) => ({
    kind: f.kind as MatchFact["kind"],
    content: f.content as string,
  }));

  // 2. Fetch the open job pool (paginated — PostgREST caps at 1000).
  const jobs: DeckJobRow[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, location, remote, salary_min, salary_max, currency, description, apply_url, verified_at, companies(name)",
      )
      .eq("open", true)
      .order("verified_at", { ascending: false })
      .range(offset, offset + PAGE - 1);
    if (error) {
      return NextResponse.json({ error: "could not load jobs" }, { status: 500 });
    }
    jobs.push(...(data as DeckJobRow[]));
    if ((data ?? []).length < PAGE) break;
  }

  // 3. Score + rank.
  const scored = jobs
    .map((job) => ({ job, ...scoreJob(profile, facts, job as unknown as MatchJob) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);

  // 4. LLM reason polish for the top few on cache miss (cost-controlled).
  const topIds = scored.slice(0, LLM_POLISH_N).map((s) => s.job.id);
  const { data: cached } = await supabase
    .from("job_matches")
    .select("job_id, reasons")
    .eq("profile_id", user.id)
    .in("job_id", topIds);
  const cachedByJob = new Map(
    (cached ?? []).map((c) => [c.job_id as string, c.reasons as string[]]),
  );

  const groqKey = process.env.GROQ_API_KEY;
  /* W5b perf fix: the polish loop was sequential — 8 Groq calls × 2-6s =
     16-48s per deck request, so users on a fresh profile stared at an
     empty deck ("no jobs!") while it ground. Run the uncached polish
     calls in parallel; cost is identical, latency drops to ~seconds. */
  /* Apply cached reasons first (the parallel pass below only handles
     uncached entries). */
  for (const entry of scored.slice(0, LLM_POLISH_N)) {
    const llm = cachedByJob.get(entry.job.id);
    if (llm && llm.length > 0) entry.reasons = llm;
  }
  const polishTasks = scored
    .slice(0, LLM_POLISH_N)
    .filter((entry) => !cachedByJob.has(entry.job.id) && groqKey)
    .map(async (entry) => {
      try {
        const llm = await polishReasons(
          {
            jobTitle: entry.job.title,
            jobDescription: entry.job.description ?? "",
            provenFacts: facts.slice(0, 30).map((f) => `${f.kind}: ${f.content}`),
          },
          groqKey!,
          undefined,
          (usage) => {
            if (!usage) return;
            void recordUsage(supabase, {
              profileId: user.id,
              endpoint: "reasons",
              model: "openai/gpt-oss-120b",
              promptTokens: usage.promptTokens,
              completionTokens: usage.completionTokens,
              costEur: costOf("openai/gpt-oss-120b", usage.promptTokens, usage.completionTokens),
            });
          },
        );
        if (llm.length > 0) {
          entry.reasons = llm;
          await supabase.from("job_matches").upsert(
            {
              profile_id: user.id,
              job_id: entry.job.id,
              score: entry.score,
              reasons: llm,
              concern: entry.concern ?? null,
            },
            { onConflict: "profile_id,job_id" },
          );
        }
      } catch {
        /* keep the rule-based reasons on polish failure */
      }
    });
  await Promise.all(polishTasks);

  // 5. Respond (company name + reasons pre-joined).
  const deck = scored.map((entry) => {
    const company = Array.isArray(entry.job.companies)
      ? entry.job.companies[0]?.name
      : entry.job.companies?.name ?? "Unknown";
    return {
      id: entry.job.id,
      title: entry.job.title,
      company,
      location: entry.job.location,
      remote: entry.job.remote,
      salary_min: entry.job.salary_min,
      salary_max: entry.job.salary_max,
      currency: entry.job.currency,
      apply_url: entry.job.apply_url,
      description: entry.job.description,
      verified_at: entry.job.verified_at,
      score: entry.score,
      reasons: entry.reasons,
      concern: entry.concern ?? null,
    };
  });

  return NextResponse.json({ jobs: deck, generatedAt: new Date().toISOString() });
}
