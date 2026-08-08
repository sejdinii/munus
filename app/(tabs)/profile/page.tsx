"use client";

/* Profile — prototype renderProfile() (CONTRACTS §4). Replaces the wave-1
   placeholder. The mock store has no free-text name field (onboarding only
   captures role/location/level/salaryFloor/alerts, CONTRACTS §2 `profiles`
   is a future real table) so avatar initials and the name line are derived
   from the role answer instead of a person's name — see final report. */

import Link from "next/link";
import { useState } from "react";
import { LoadingState } from "@/components/states";
import { useToast } from "@/components/ui/Toast";
import { useMunusStore } from "@/lib/mock/store";
import { useSession } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/client";
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
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useSession();
  const isOwner = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (!hydrated) return <LoadingState label="Loading profile" />;

  const prefFields = [
    ...(onboarding.roles ?? []),
    ...(onboarding.levels ?? []),
    ...(onboarding.workTypes ?? []),
    ...(onboarding.locations ?? []),
    onboarding.alerts,
  ];
  const answered = prefFields.filter(Boolean).length;

  const handleReset = () => {
    reset();
    showToast("Demo data reset");
  };

  /* W5a — GDPR export: every row about this user, as a JSON download. */
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/gdpr/export", { method: "POST" });
      if (!response.ok) throw new Error("export failed");
      const payload = await response.json();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `munus-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Your data export is downloading");
    } catch {
      showToast("Export failed — try again");
    } finally {
      setExporting(false);
    }
  };

  /* W5a — GDPR delete: wipe every row + the auth user, then sign out. */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch("/api/gdpr/delete", { method: "POST" });
      if (!response.ok) throw new Error("delete failed");
      showToast("Account deleted — everything erased");
      reset();
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      setDeleting(false);
      setDeleteOpen(false);
      showToast("Delete failed — try again");
    }
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
            {initialsFromRole((onboarding.roles ?? [])[0])}
          </div>
          <h2 className="mb-[3px] mt-3.5 text-[25px] tracking-[-0.04em]">
            {onboarding.completed
              ? (onboarding.roles ?? [])[0] || "Profile ready"
              : "No profile yet"}
          </h2>
          {onboarding.completed ? (
            <p className="m-0 text-[11px] text-muted">
              {[...(onboarding.workTypes ?? []), ...(onboarding.locations ?? []), ...(onboarding.levels ?? [])]
                .filter(Boolean)
                .join(" · ") || "Onboarding complete"}
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
          href="/profile/career"
        />
        <SettingRow
          label="Search preferences"
          meta={answered > 0 ? `${answered} of 5 answered ›` : "Not started ›"}
          href="/onboarding"
        />
        <SettingRow label="Privacy and automation" meta="Review first ›" />
        <SettingRow label="Privacy policy" meta="Draft ›" href="/privacy" />
        <SettingRow label="Terms of service" meta="Draft ›" href="/terms" />

        {/* W5a — GDPR: your data, your call (Art. 15/17). */}
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="m-0 mb-1.5 text-[11px] font-[760] uppercase tracking-[0.1em] text-rose-ink">
            Your data
          </h3>
          <p className="mb-3 text-[11px] text-muted">
            Everything munus holds about you — export it anytime, or erase
            it all. This is your right under EU law.
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex min-h-11 w-full items-center justify-between rounded-lg px-1 text-left text-[13px] font-[650] disabled:opacity-50"
          >
            Export my data
            <span className="text-[11px] font-[650] text-rose-ink">
              {exporting ? "Packaging…" : "JSON ›"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex min-h-11 w-full items-center justify-between rounded-lg px-1 text-left text-[13px] font-[650] text-rose-ink"
          >
            Delete my account
            <span className="text-[11px]">Erases everything ›</span>
          </button>
        </div>

        {isOwner ? (
          <SettingRow label="AI cost meter" meta="Operator ›" href="/admin" />
        ) : null}

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

      {/* W5a — delete confirm: a destructive act gets a real dialog. */}
      {deleteOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-5">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="m-0 text-[20px] tracking-[-0.03em]">Delete everything?</h3>
            <p className="mt-2 text-xs text-muted">
              Your profile, CV facts, favorites and AI usage will be erased
              from munus. This cannot be undone.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
                className="min-h-11 rounded-xl bg-quiet text-[13px] font-[700] disabled:opacity-50"
              >
                Keep my account
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="min-h-11 rounded-xl bg-rose-ink text-[13px] font-[700] text-white disabled:opacity-50"
              >
                {deleting ? "Erasing…" : "Delete everything"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
