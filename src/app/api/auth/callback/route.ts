import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { store } from "@/lib/store";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=oauth-denied", request.url));
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=oauth-exchange", request.url));
  }

  // Returning users with a CV skip straight to their evidence, not Q1 of 6.
  let destination = "/onboarding";
  try {
    const userId = data.session?.user?.id;
    if (userId && (await store.getCvMeta(userId))) destination = "/profile/facts";
  } catch {
    // schema not applied yet or transient DB issue — onboarding is safe
  }
  return NextResponse.redirect(new URL(destination, request.url));
}
