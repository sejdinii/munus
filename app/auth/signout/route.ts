import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST-only sign-out (CSRF-safe; no links trigger it). */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", requestUrlOrigin()), { status: 303 });
}

function requestUrlOrigin(): string {
  // The origin isn't derivable from the POST body; fall back to the
  // configured app URL, then localhost for local dev.
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
