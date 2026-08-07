import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cleanFacts } from "@/lib/cv/validate";
import type { CvFact } from "@/lib/cv/types";

export const runtime = "nodejs";

/**
 * POST /api/cv/facts — manual fallback (spec TASK-104: "extraction with
 * manual fallback"). The user adds facts by hand when parsing yields
 * nothing usable; every fact passes the same validator as LLM output.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { facts?: unknown }
    | null;
  const facts = cleanFacts(body?.facts);
  if (facts.length === 0) {
    return NextResponse.json({ error: "no valid facts" }, { status: 400 });
  }

  const rows = facts.map((fact) => ({
    profile_id: user.id,
    kind: fact.kind,
    content: fact.content,
    source_span: null,
  }));
  const { error } = await supabase.from("facts").insert(rows);
  if (error) {
    return NextResponse.json({ error: "could not save facts" }, { status: 500 });
  }

  const saved: CvFact[] = rows.map((row) => ({
    kind: row.kind,
    content: row.content,
  }));
  return NextResponse.json({ facts: saved });
}
