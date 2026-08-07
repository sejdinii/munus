import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkListingReachable } from "@/lib/apply/check";

/**
 * POST /api/apply/status — server-side "still open" check (W4-live).
 * HEADs the employer's apply URL so ATS CORS policies can't block the
 * check from the browser. Auth-bound. Never blocks the application —
 * it only reports, honestly.
 */

export const runtime = "nodejs";
export const maxDuration = 15;

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
  const url = typeof (body as { url?: unknown } | null)?.url === "string"
    ? (body as { url: string }).url.slice(0, 2000)
    : "";
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const result = await checkListingReachable(url);
  return NextResponse.json(result);
}
