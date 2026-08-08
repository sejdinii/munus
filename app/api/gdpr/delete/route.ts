import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteAccount } from "@/lib/gdpr";

/**
 * POST /api/gdpr/delete — Art. 17: erase the account and every row.
 * Wipes storage files, the profile (facts + llm_usage cascade), then the
 * auth user via the service-role admin client. Idempotent: a second call
 * just 401s because the user no longer exists.
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

  try {
    await deleteAccount(supabase, supabase.storage, user.id);
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      // Profile data is already gone; the stale auth row is a cleanup item.
      console.error("[gdpr] deleteUser failed after data wipe:", error.message);
      return NextResponse.json({ ok: true, warning: "data erased; auth row cleanup pending" });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "delete failed" },
      { status: 500 },
    );
  }
}
