import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { store, type OnboardingAnswers } from "@/lib/store";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Partial<
    Record<keyof OnboardingAnswers, unknown>
  > | null;
  const roleTarget = typeof body?.roleTarget === "string" ? body.roleTarget.trim() : "";
  const location = typeof body?.location === "string" ? body.location.trim() : "";
  const level = typeof body?.level === "string" ? body.level.trim() : "";
  const alerts = typeof body?.alerts === "string" ? body.alerts.trim() : "";
  const salaryMin =
    typeof body?.salaryMin === "number" && Number.isFinite(body.salaryMin)
      ? Math.round(body.salaryMin)
      : null;

  if (!roleTarget || !location || !level || !alerts) {
    return NextResponse.json(
      { error: "Answer every question before finishing." },
      { status: 400 },
    );
  }

  try {
    const profile = await store.saveOnboarding(user.id, user.email, user.name, {
      roleTarget,
      location,
      level,
      salaryMin,
      currency: "EUR",
      alerts,
    });
    return NextResponse.json({ ok: true, profileId: profile.id });
  } catch (error) {
    console.error("profile save failed:", error);
    return NextResponse.json(
      { error: "We couldn't save your profile. Please try again." },
      { status: 500 },
    );
  }
}
