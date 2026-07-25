"use client";

/* Discover — the swipe deck (ORCHESTRATOR-OWNED, CONTRACTS §6). Prototype
   renderDiscover() under the pink theme: flat #f4f0f1 backdrop, no deck-tint
   gradient, no card-top blob. Data is the mock catalog until W1/W2 real
   feeds arrive — the header says so honestly.

   Temporary deviation (recorded in FEATURES gaps): the prototype's star
   fast-track opens the studio; the studio ships next wave, so star saves
   and toasts instead of navigating. */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, LoadingState } from "@/components/states";
import { LinkButton } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { jobs, type Job } from "@/lib/mock/jobs";
import { useMunusStore } from "@/lib/mock/store";
import { BehindCard, TopCard } from "@/components/deck/SwipeCard";
import { DeckActions } from "@/components/deck/DeckActions";
import { CoachOverlay } from "@/components/deck/CoachOverlay";
import type { SwipeDirection } from "@/components/deck/useSwipe";

export default function DiscoverPage() {
  const store = useMunusStore();
  const router = useRouter();
  const { showToast } = useToast();
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const deck: Job[] = jobs.filter(
    (j) =>
      !store.dismissed.includes(j.id) &&
      !store.favorites.includes(j.id) &&
      !store.applications.some((a) => a.jobId === j.id),
  );
  const top = deck[0];
  const behind = deck[1];
  const decidedCount = jobs.length - deck.length;

  const decide = useCallback(
    (direction: SwipeDirection) => {
      if (!top) return;
      setRestoredId(null);
      store.decide(top.id, direction);
      showToast(direction === "save" ? "Saved to Favorites" : "Passed", {
        label: "Undo",
        onPress: () => {
          const last = store.undo();
          if (last) setRestoredId(last.jobId);
        },
      });
    },
    [top, store, showToast],
  );

  if (!store.hydrated) return <LoadingState label="Preparing your deck" />;

  if (store.swipesLeft <= 0) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <div className="px-5 pb-2 pt-2.5">
          <h1 className="m-0 text-2xl tracking-[-0.04em]">Fresh roles</h1>
        </div>
        <EmptyState
          symbol="✋"
          title="You’re out of free swipes"
          body="Your 20 free swipes reset Monday. Your favorites, documents, and applications stay fully available — or go unlimited now."
        >
          <LinkButton href="/plans" variant="primary" className="w-full">
            See plans
          </LinkButton>
          <LinkButton href="/favorites" variant="plain" className="w-full">
            Open favorites
          </LinkButton>
        </EmptyState>
      </section>
    );
  }

  if (!top) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <div className="px-5 pb-2 pt-2.5">
          <h1 className="m-0 text-2xl tracking-[-0.04em]">Fresh roles</h1>
        </div>
        <EmptyState
          symbol="⌁"
          title="You are caught up"
          body="You’ve been through every sample role. Real, fresh jobs arrive when the live feeds switch on. Undo a decision or revisit your favorites."
        >
          <LinkButton href="/favorites" variant="primary" className="w-full">
            Open favorites
          </LinkButton>
          {store.decisions.length > 0 ? (
            <button
              type="button"
              className="min-h-[52px] rounded-[15px] border border-transparent px-[18px] font-[710]"
              onClick={() => {
                const last = store.undo();
                if (last) setRestoredId(last.jobId);
              }}
            >
              Undo last decision
            </button>
          ) : null}
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="screen-in flex flex-1 flex-col bg-[#f4f0f1]">
      <div className="flex min-h-[54px] items-center justify-between px-5 pb-1 pt-[5px]">
        <div>
          <h1 className="m-0 text-2xl tracking-[-0.04em]">Fresh roles</h1>
          <p className="m-0 mt-0.5 text-[11px] text-muted">
            {deck.length} sample roles · live feeds arrive with W1
          </p>
        </div>
      </div>
      <div
        className="flex gap-1 px-5 pb-2"
        aria-label={`${decidedCount} of ${jobs.length} roles decided`}
      >
        {jobs.map((j, i) => (
          <i
            key={j.id}
            className={`h-[3px] w-3.5 rounded-[2px] ${
              i < decidedCount ? "bg-rose" : "bg-line"
            }`}
          />
        ))}
      </div>
      <div className="relative mx-3.5 mt-1 min-h-0 flex-1">
        {behind ? (
          <BehindCard job={behind} />
        ) : (
          <div className="absolute inset-x-2 bottom-1.5 top-3 rounded-[27px] border border-line bg-[#e9e5e6]" />
        )}
        <TopCard
          key={top.id}
          job={top}
          restored={restoredId === top.id}
          onDecide={decide}
        />
        {!store.coached ? <CoachOverlay onDismiss={store.setCoached} /> : null}
      </div>
      <DeckActions
        canUndo={store.decisions.length > 0}
        onUndo={() => {
          const last = store.undo();
          if (last) setRestoredId(last.jobId);
        }}
        onPass={() => decide("pass")}
        onStar={() => {
          setRestoredId(null);
          store.decide(top.id, "star");
          showToast("Starred — the studio arrives next wave", {
            label: "Undo",
            onPress: () => {
              const last = store.undo();
              if (last) setRestoredId(last.jobId);
            },
          });
        }}
        onSave={() => decide("save")}
        onInfo={() => router.push(`/jobs/${top.id}`)}
      />
      <p className="m-0 pb-1 text-center text-[9px] text-muted">
        Swipe is optional — every action has a button.
      </p>
    </section>
  );
}
