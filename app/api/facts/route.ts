import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Fact } from "@/lib/studio/types";

/**
 * GET /api/facts — the caller's real CV evidence store (auth-bound),
 * shaped for the studio pipeline. Falls back to an empty list, never 500s.
 */

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("facts")
    .select("id, kind, content")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "could not load facts" }, { status: 500 });
  }

  const facts: Fact[] = (data ?? []).map((row) => ({
    id: String(row.id),
    kind: row.kind as Fact["kind"],
    content: row.content as string,
    sourceSpan: "Your CV",
  }));

  return NextResponse.json({ facts });
}
