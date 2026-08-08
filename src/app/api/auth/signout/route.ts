import { NextRequest, NextResponse } from "next/server";
import { hasSupabase } from "@/lib/env";
import { DEV_SESSION_COOKIE } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export async function POST(request: NextRequest) {
  if (hasSupabase) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(DEV_SESSION_COOKIE);
  return response;
}
