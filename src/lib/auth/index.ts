// Auth adapter seam (CONTRACTS.md §3): Supabase when configured, a local dev
// session otherwise. Screens and routes import ONLY from this module.

import { cookies } from "next/headers";
import { devAuthAllowed, hasSupabase } from "@/lib/env";
import { createSupabaseServerClient } from "./supabase-server";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  provider: "google" | "apple" | "dev";
};

export const DEV_SESSION_COOKIE = "munus_dev_session";

// Fixed dev identity — a stable uuid so dev-store rows behave like real rows.
export const DEV_USER: SessionUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "dev@munus.local",
  name: "Dev User",
  provider: "dev",
};

export async function getSessionUser(): Promise<SessionUser | null> {
  if (hasSupabase) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const { user } = data;
    return {
      id: user.id,
      email: user.email ?? "",
      name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      provider: user.app_metadata?.provider === "apple" ? "apple" : "google",
    };
  }
  // Read cookies BEFORE the dev-auth guard: cookies() is what marks these
  // routes dynamic. Guarding first lets the build statically prerender
  // session pages as their signed-out redirect (devAuthAllowed is false at
  // build time), which then ships to every real user.
  const jar = await cookies();
  if (!devAuthAllowed) return null;
  return jar.get(DEV_SESSION_COOKIE)?.value === DEV_USER.id ? DEV_USER : null;
}
