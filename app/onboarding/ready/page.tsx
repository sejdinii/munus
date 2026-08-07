"use client";

/* Onboarding ready — prototype's renderReady() screen, reached only after
   the 6-question flow sets onboarding.completed. Direct/deep-linked visits
   before completion get the empty-state nudge back into the flow instead of
   showing fabricated match data. No network call happens on this screen, so
   there is no distinct error path (see wave report). */

import { EmptyState, LoadingState } from "@/components/states";
import { LinkButton } from "@/components/ui/Button";
import { useMunusStore } from "@/lib/mock/store";
import { Wordmark } from "@/components/ui/Wordmark";

export default function OnboardingReadyPage() {
  const { hydrated, onboarding } = useMunusStore();

  if (!hydrated) return <LoadingState label="Preparing your profile" />;

  if (!onboarding.completed) {
    return (
      <section className="screen-in flex flex-1 flex-col bg-paper">
        <EmptyState
          symbol="✎"
          title="Let's finish your profile"
          body="Answer the 6 quick questions first so we can build your matches."
        >
          <LinkButton href="/onboarding" variant="primary" className="w-full">
            Continue setup
          </LinkButton>
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="screen-in flex flex-1 flex-col justify-between bg-paper px-6 pb-7 pt-[42px]">
      <div>
        <Wordmark />
        <div className="relative mt-[34px] h-[230px]">
          <div className="absolute left-1/2 top-[30px] h-[165px] w-[230px] -translate-x-1/2 -rotate-[10deg] rounded-[25px] border border-line bg-rose shadow-[0_16px_40px_rgba(32,32,38,0.1)]" />
          <div className="absolute left-1/2 top-[18px] h-[165px] w-[230px] -translate-x-1/2 rotate-[8deg] rounded-[25px] border border-line bg-sky shadow-[0_16px_40px_rgba(32,32,38,0.1)]" />
          {/* Honest art: a checkmark, not an invented match score — no real
              matching exists until the deck ships (critic finding #1). */}
          <div className="absolute left-1/2 top-[5px] flex h-[165px] w-[230px] -translate-x-1/2 flex-col items-center justify-center rounded-[25px] border border-line bg-paper shadow-[0_16px_40px_rgba(32,32,38,0.1)]">
            <strong className="text-[50px] leading-none tracking-[-0.06em] text-rose">
              ✓
            </strong>
            <span className="text-[10px] text-muted">profile saved</span>
          </div>
        </div>
      </div>
      <div>
        <p className="m-0 mb-2 text-[11px] font-[760] uppercase tracking-[0.1em] text-rose-ink">
          Profile ready
        </p>
        <h1 className="m-0 text-[38px] leading-[1.02] tracking-[-0.055em]">
          Your evidence store is set.
        </h1>
        <p className="mb-7 mt-3 text-sm leading-[1.45] text-muted">
          Your profile is live against 8,000+ real jobs from 150 companies —
          ranked for you and refreshed daily. Swipe through your matches now.
        </p>
        <LinkButton href="/discover" variant="primary" className="w-full">
          Start swiping
        </LinkButton>
      </div>
    </section>
  );
}
