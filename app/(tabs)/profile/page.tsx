"use client";

/* Profile — prototype renderProfile() (CONTRACTS §4). Replaces the wave-1
   placeholder. The mock store has no free-text name field (onboarding only
   captures role/location/level/salaryFloor/alerts, CONTRACTS §2 `profiles`
   is a future real table) so avatar initials and the name line are derived
   from the role answer instead of a person's name — see final report. */

import Link from "next/link";
import { LoadingState } from "@/components/states";
import { useToast } from "@/components/ui/Toast";
import { useMunusStore } from "@/lib/mock/store";
import { SettingRow } from "./SettingRow";

function initialsFromRole(role?: string): string {
  if (!role) return "?";
  const words = role.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters = words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "?";
}

export default function ProfilePage() {
  const { hydrated, swipesLeft, onboarding, reset } = useMunusStore();
  const { showToast } = useToast();

  if (!hydrated) return <LoadingState label="Loading profile" />;

  const prefFields = [
    onboarding.role,
    onboarding.location,
    onboarding.level,
    onboarding.salaryFloor,
    onboarding.alerts,
  ];
  const answered = prefFields.filter(Boolean).length;

  const handleReset = () => {
    reset();
    showToast("Demo data reset");
  };

  return (
    <section className="screen-in flex flex-1 flex-col">
      <div className="px-5 pb-[18px] pt-2.5">
        <h1 className="m-0 text-[34px] tracking-[-0.055em]">Profile</h1>
        <p className="mt-[5px] text-xs text-muted">
          The evidence and preferences behind your matches.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="border-b border-line pb-[22px] pt-1">
          <div className="grid size-[68px] place-items-center rounded-[23px] bg-[#251e21] text-[21px] font-extrabold text-white">
            {initialsFromRole(onboarding.role)}
          </div>
          <h2 className="mb-[3px] mt-3.5 text-[25px] tracking-[-0.04em]">
            {onboarding.completed ? onboarding.role || "Profile ready" : "No profile yet"}
          </h2>
          {onboarding.completed ? (
            <p className="m-0 text-[11px] text-muted">
              {[onboarding.role, onboarding.location].filter(Boolean).join(" · ") ||
                "Onboarding complete"}
            </p>
          ) : (
            <Link
              href="/onboarding"
              className="text-[11px] font-[650] text-rose-ink underline underline-offset-2"
            >
              Complete onboarding to build your evidence store →
            </Link>
          )}
        </div>

        <SettingRow label="Plan" meta={`Free · ${swipesLeft} swipes left ›`} href="/plans" />
        <SettingRow
          label="Career profile"
          meta={onboarding.cvUploaded ? "CV added ›" : "Add your CV ›"}
          href="/onboarding"
        />
        <SettingRow
          label="Search preferences"
          meta={answered > 0 ? `${answered} of 5 answered ›` : "Not started ›"}
          href="/onboarding"
        />
        <SettingRow label="Privacy and automation" meta="Review first ›" />
        <SettingRow
          label="I got hired 🎉"
          meta="Pause everything ›"
          tone="hired"
          onClick={() =>
            showToast("Congratulations! Search paused — reactivate anytime 🎉")
          }
        />

        <div className="pt-7">
          <button
            type="button"
            onClick={handleReset}
            className="text-[12px] font-[650] text-muted underline underline-offset-2"
          >
            Reset demo data
          </button>
          <p className="mt-1.5 text-[10px] text-muted">
            Demo only — clears this browser&rsquo;s local mock data. No real
            account or payment exists yet.
          </p>
        </div>
      </div>
    </section>
  );
}
