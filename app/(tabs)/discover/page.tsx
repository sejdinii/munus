"use client";

/* Discover — ORCHESTRATOR-OWNED (CONTRACTS §6). The real swipe deck lands in
   the next wave; until then this screen shows the honest caught-up / limit
   states so the shell demos truthfully instead of faking a deck. */

import Link from "next/link";
import { EmptyState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/Button";
import { useMunusStore } from "@/lib/mock/store";

export default function DiscoverPage() {
  const { hydrated, swipesLeft } = useMunusStore();

  if (!hydrated) return <LoadingState label="Preparing your deck" />;

  if (swipesLeft <= 0) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <div className="px-5 pb-[18px] pt-2.5">
          <h1 className="m-0 text-[34px] tracking-[-0.055em]">Fresh roles</h1>
        </div>
        <EmptyState
          symbol="✋"
          title="You’re out of free swipes"
          body="Your 20 free swipes reset Monday. Your favorites, documents, and applications stay fully available — or go unlimited now."
        >
          <Link href="/plans">
            <Button variant="primary" className="w-full">
              See plans
            </Button>
          </Link>
          <Link href="/favorites">
            <Button variant="plain" className="w-full">
              Open favorites
            </Button>
          </Link>
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="screen-in flex flex-1 flex-col">
      <div className="px-5 pb-[18px] pt-2.5">
        <h1 className="m-0 text-[34px] tracking-[-0.055em]">Fresh roles</h1>
        <p className="mt-[5px] text-xs text-muted">
          The swipe deck arrives in the next build wave.
        </p>
      </div>
      <EmptyState
        symbol="⌁"
        title="Deck under construction"
        body="Real, fresh jobs with evidence-based fit reasons will appear here once the matching engine is wired up."
      />
    </section>
  );
}
