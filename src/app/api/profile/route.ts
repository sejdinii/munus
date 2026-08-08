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
  // The server is the trust boundary — never rely on client-side validation.
  const text = (value: unknown, maxLength = 80) =>
    typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength
      ? value.trim()
      : "";
  const roleTarget = text(body?.roleTarget);
  const location = text(body?.location);
  const level = text(body?.level);
  const alerts = text(body?.alerts);
  const salaryMin =
    typeof body?.salaryMin === "number" &&
    Number.isFinite(body.salaryMin) &&
    body.salaryMin >= 1000 &&
    body.salaryMin <= 2_000_000
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
