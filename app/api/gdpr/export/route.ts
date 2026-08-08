import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { collectExport } from "@/lib/gdpr";

/**
 * POST /api/gdpr/export — Art. 15/20: the user's own data, as JSON.
 * Auth-bound; the caller only ever sees THEIR rows.
 */

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const exportData = await collectExport(
    supabase,
    supabase.storage,
    user.id,
    user.email ?? undefined,
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
  );
  return NextResponse.json(exportData);
}
