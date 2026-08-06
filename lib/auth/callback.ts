/**
 * Pure auth-callback logic — injectable so the route stays a thin shell
 * and the redirect contract is unit-testable without Next.js.
 */

export type AuthExchange = (code: string) => Promise<{ error: { message: string } | null }>;

export const AUTH_CALLBACK_AFTER = "/onboarding";

/**
 * Resolve the destination after an OAuth code exchange.
 * - code missing            → error redirect (never fabricate a session)
 * - exchange failed         → error redirect with the provider message
 * - exchange succeeded      → safe `next` (defaults to onboarding)
 */
export async function resolveAuthCallback(
  url: URL,
  exchange: AuthExchange,
): Promise<{ ok: boolean; redirect: string; reason?: string }> {
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? AUTH_CALLBACK_AFTER;
  // Browsers normalize a leading backslash to a slash: "/\evil.example"
  // becomes "//evil.example" (host confusion) — reject it like "//".
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
      ? next
      : AUTH_CALLBACK_AFTER;

  if (!code) {
    return { ok: false, redirect: `${url.origin}${AUTH_CALLBACK_AFTER}?auth=error`, reason: "missing code" };
  }

  const { error } = await exchange(code);
  if (error) {
    return { ok: false, redirect: `${url.origin}${AUTH_CALLBACK_AFTER}?auth=error`, reason: error.message };
  }

  return { ok: true, redirect: `${url.origin}${safeNext}` };
}
