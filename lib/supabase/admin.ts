import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

/**
 * Service-role client — ONLY for admin operations that the session client
 * cannot do (deleting the auth user during GDPR wipe). Never used for
 * reads or writes of user data outside that path.
 */

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("admin client misconfigured: missing URL or service-role key");
  }
  return createSupabaseAdmin(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
