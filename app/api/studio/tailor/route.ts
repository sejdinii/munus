import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateKit } from "@/lib/studio/pipeline";
import { groqTailorProvider } from "@/lib/studio/groqProvider";
import { mockTailorProvider } from "@/lib/studio/mockProvider";
import type { Fact, TailorRequest } from "@/lib/studio/types";

/**
 * POST /api/studio/tailor — the ONLY sanctioned path for real tailoring.
 * Auth-bound: the evidence store is loaded server-side from the caller's
 * facts table (never from the client), the provider runs server-side
 * (Groq key never leaves the server), and the verifier gates the result
 * before it reaches the UI. Mock provider is the graceful fallback when
 * GROQ_API_KEY is absent — the response says which one ran.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const b = (body ?? {}) as { job?: unknown; tone?: unknown };

  const job = (b.job ?? {}) as Record<string, unknown>;
  if (typeof job.title !== "string" || typeof job.company !== "string") {
    return NextResponse.json({ error: "job required" }, { status: 400 });
  }

  const { data: factRows } = await supabase
    .from("facts")
    .select("id, kind, content")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  const facts: Fact[] = (factRows ?? []).map((row) => ({
    id: String(row.id),
    kind: row.kind as Fact["kind"],
    content: row.content as string,
    sourceSpan: "Your CV",
  }));
  if (facts.length === 0) {
    return NextResponse.json({ error: "no facts yet — upload your CV first" }, { status: 422 });
  }

  const tone = typeof b.tone === "string" && b.tone.trim() ? b.tone.trim().slice(0, 40) : null;

  const requestBody: TailorRequest = {
    job: {
      id: typeof job.id === "string" ? job.id : "job",
      title: String(job.title).slice(0, 160),
      company: String(job.company).slice(0, 120),
      location: typeof job.location === "string" ? job.location.slice(0, 160) : "",
      about: typeof job.about === "string" ? job.about.slice(0, 4000) : "",
      applyUrl: typeof job.applyUrl === "string" ? job.applyUrl : "",
      monogram: typeof job.monogram === "string" ? job.monogram : "?",
      color: "#dcd6ff",
      deck: "#efecff",
      pop: "#d6ff63",
      salary: typeof job.salary === "string" ? job.salary : "Not listed",
      type: "Full-time",
      source: "Company careers",
      fresh: "fresh",
      match: typeof job.match === "number" ? job.match : 0,
      reasons: Array.isArray(job.reasons)
        ? (job.reasons as string[]).slice(0, 2) as [string, string]
        : ["", ""],
      concern: typeof job.concern === "string" ? job.concern : "",
    },
    facts,
    tone,
  };

  const groqKey = process.env.GROQ_API_KEY;
  const provider = groqKey ? groqTailorProvider(groqKey) : mockTailorProvider;
  const result = await generateKit(provider, requestBody.job, facts, tone);

  return NextResponse.json({
    ...result,
    provider: groqKey ? "groq" : "mock",
    factCount: facts.length,
  });
}
