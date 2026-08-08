import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const [profile, cvMeta] = await Promise.all([
    store.getProfile(user.id),
    store.getCvMeta(user.id),
  ]);

  return (
    <OnboardingFlow
      initialAnswers={{
        roleTarget: profile?.roleTarget ?? null,
        location: profile?.locations[0] ?? null,
        level: profile?.level ?? null,
        salaryMin: profile?.salaryMin ?? null,
        alerts: profile?.alerts ?? null,
      }}
      initialCv={
        cvMeta ? { fileName: cvMeta.fileName, fileSize: cvMeta.fileSize } : null
      }
    />
  );
}
