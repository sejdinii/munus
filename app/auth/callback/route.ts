import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveAuthCallback } from "@/lib/auth/callback";

/**
 * OAuth redirect target. Exchanges the provider code for a session,
 * then sends the user back to where they were (default: onboarding).
 * Never fabricates a session: any failure lands on the error query.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const result = await resolveAuthCallback(url, async (code) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return { error };
  });

  return NextResponse.redirect(result.redirect);
}
