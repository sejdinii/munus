import { NextRequest, NextResponse } from "next/server";
import { hasSupabase } from "@/lib/env";
import { DEV_SESSION_COOKIE, DEV_USER } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  if (provider !== "google" && provider !== "apple") {
    return NextResponse.redirect(new URL("/sign-in?error=unknown-provider", request.url));
  }

  if (!hasSupabase) {
    // Keyless dev mode: create the local dev session, same downstream flow.
    const response = NextResponse.redirect(new URL("/onboarding", request.url));
    response.cookies.set(DEV_SESSION_COOKIE, DEV_USER.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: new URL("/api/auth/callback", request.url).toString() },
  });
  if (error || !data.url) {
    return NextResponse.redirect(new URL("/sign-in?error=oauth-start", request.url));
  }
  return NextResponse.redirect(data.url);
}
