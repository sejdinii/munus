import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/usage — the meter. Owner-only (ADMIN_EMAIL). Summaries by
 * endpoint + top users, newest rows. Users never see this.
 */

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const owner = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!owner || user.email !== owner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: total } = await supabase
    .from("llm_usage")
    .select("cost_eur, prompt_tokens, completion_tokens");
  const rows = total ?? [];

  const byEndpoint = new Map<string, { calls: number; costEur: number }>();
  for (const row of rows) {
    const r = row as unknown as { endpoint: string; cost_eur: number };
    const entry = byEndpoint.get(r.endpoint) ?? { calls: 0, costEur: 0 };
    entry.calls += 1;
    entry.costEur += Number(r.cost_eur);
    byEndpoint.set(r.endpoint, entry);
  }

  const { data: recent } = await supabase
    .from("llm_usage")
    .select("endpoint, model, prompt_tokens, completion_tokens, cost_eur, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: topUsers } = await supabase
    .from("llm_usage")
    .select("profile_id, cost_eur");

  const perUser = new Map<string, number>();
  for (const row of topUsers ?? []) {
    const r = row as { profile_id: string; cost_eur: number };
    perUser.set(r.profile_id, (perUser.get(r.profile_id) ?? 0) + Number(r.cost_eur));
  }
  const topUsersList = [...perUser.entries()]
    .map(([profileId, costEur]) => ({ profileId, costEur: Number(costEur.toFixed(4)) }))
    .sort((a, b) => b.costEur - a.costEur)
    .slice(0, 10);

  return NextResponse.json({
    owner: user.email,
    totals: {
      calls: rows.length,
      costEur: Number(rows.reduce((s, r) => s + Number((r as { cost_eur: number }).cost_eur), 0).toFixed(4)),
      promptTokens: rows.reduce((s, r) => s + Number((r as { prompt_tokens: number }).prompt_tokens), 0),
      completionTokens: rows.reduce((s, r) => s + Number((r as { completion_tokens: number }).completion_tokens), 0),
    },
    byEndpoint: [...byEndpoint.entries()].map(([endpoint, v]) => ({ endpoint, ...v })),
    recent: recent ?? [],
    topUsers: topUsersList,
  });
}
