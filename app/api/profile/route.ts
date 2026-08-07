import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/profile — persists onboarding answers to the profiles row
 * (auth-bound). The deck ranks with these; CV facts are stored separately
 * by /api/cv. Written on onboarding completion (W2 founder feedback:
 * answers must actually feed matching).
 */

export const runtime = "nodejs";
export const maxDuration = 30;

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
  const b = (body ?? {}) as {
    roles?: unknown;
    levels?: unknown;
    workTypes?: unknown;
    locations?: unknown;
    alerts?: unknown;
  };

  const roles = Array.isArray(b.roles)
    ? b.roles
        .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
        .map((r) => r.trim().slice(0, 120))
        .slice(0, 5)
    : null;
  const levels = Array.isArray(b.levels)
    ? b.levels
        .filter((l): l is string => typeof l === "string" && l.trim().length > 0)
        .map((l) => l.trim().slice(0, 40))
        .slice(0, 3)
    : null;
  const alerts = typeof b.alerts === "string" && b.alerts.trim() ? b.alerts.trim().slice(0, 40) : null;
  const workTypes = Array.isArray(b.workTypes)
    ? b.workTypes.filter((w): w is string => typeof w === "string").slice(0, 3)
    : null;
  const locations = Array.isArray(b.locations)
    ? b.locations.filter((l): l is string => typeof l === "string").slice(0, 50)
    : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(roles !== null
        ? {
            role_target: roles[0] ?? null,
            role_targets: roles,
          }
        : {}),
      ...(levels !== null
        ? {
            // Primary level: "Open to two levels" wins when selected.
            level: levels.includes("Open to two levels")
              ? "Open to two levels"
              : levels[0] ?? null,
          }
        : {}),
      ...(alerts !== null ? { alerts } : {}),
      ...(workTypes !== null ? { work_types: workTypes } : {}),
      ...(locations !== null ? { locations } : {}),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "could not save profile" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
