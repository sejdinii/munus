import { NextRequest, NextResponse } from "next/server";
import { devAuthAllowed, hasSupabase } from "@/lib/env";
import { DEV_SESSION_COOKIE, DEV_USER } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { store } from "@/lib/store";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  if (provider !== "google" && provider !== "apple") {
    return NextResponse.redirect(new URL("/sign-in?error=unknown-provider", request.url));
  }

  if (!hasSupabase) {
    // Keyless dev mode — but never silently on a production deploy.
    if (!devAuthAllowed) {
      return NextResponse.redirect(new URL("/sign-in?error=no-auth-config", request.url));
    }
    let destination = "/onboarding";
    try {
      if (await store.getCvMeta(DEV_USER.id)) destination = "/profile/facts";
    } catch {
      // fall through to onboarding
    }
    const response = NextResponse.redirect(new URL(destination, request.url));
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
