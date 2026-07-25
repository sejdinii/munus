"use client";

/* Discover — the swipe deck (ORCHESTRATOR-OWNED, CONTRACTS §6). Prototype
   renderDiscover() under the pink theme: flat #f4f0f1 backdrop, no deck-tint
   gradient, no card-top blob. Data is the mock catalog until W1/W2 real
   feeds arrive — the header says so honestly.

   Temporary deviation (recorded in FEATURES gaps): the prototype's star
   fast-track opens the studio; the studio ships next wave, so star saves
   and toasts instead of navigating. */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
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
  /* One decision per top card: swipe-commit fires after a 180ms animation
     window during which the action buttons are still live (critic W2 #3). */
  const decidingRef = useRef<string | null>(null);

  /* Clear the BACK stamp by timeout so reduced-motion users (static stamp,
     no fade-out animation) aren't left with it forever (critic W2 #6). */
  useEffect(() => {
    if (!restoredId) return;
    const t = window.setTimeout(() => setRestoredId(null), 1400);
    return () => window.clearTimeout(t);
  }, [restoredId]);

  const deck: Job[] = jobs.filter(
    (j) =>
      !store.dismissed.includes(j.id) &&
      !store.favorites.includes(j.id) &&
      !store.applications.some((a) => a.jobId === j.id),
  );
  const top = deck[0];
  const behind = deck[1];
  /* Current top at call time — delayed swipe commits carry a stale top in
     their closure; deciding must be refused unless the card is STILL the
     top of the deck (critic W2 #3, second pass). */
  const topIdRef = useRef<string | null>(null);
  topIdRef.current = top?.id ?? null;
  const lastDecision = store.decisions[store.decisions.length - 1];
  const canUndo = Boolean(lastDecision && lastDecision.type !== "unsave");

  const runUndo = () => {
    const last = store.undo();
    if (last) {
      decidingRef.current = null;
      setRestoredId(last.jobId);
    }
  };

  const decide = useCallback(
    (direction: SwipeDirection, jobId?: string) => {
      const id = jobId ?? topIdRef.current;
      if (!id || topIdRef.current !== id || decidingRef.current === id) return;
      decidingRef.current = id;
      setRestoredId(null);
      store.decide(id, direction);
      showToast(direction === "save" ? "Saved to Favorites" : "Passed", {
        label: "Undo",
        onPress: () => {
          const last = store.undo();
          if (last) {
            decidingRef.current = null;
            setRestoredId(last.jobId);
          }
        },
      });
    },
    [store, showToast],
  );

  /* New top card = new decision allowed. */
  useEffect(() => {
    if (top && decidingRef.current !== top.id) decidingRef.current = null;
  }, [top]);

  if (!store.hydrated) return <LoadingState label="Preparing your deck" />;

  if (store.storageError && store.decisions.length === 0) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <div className="px-5 pb-2 pt-2.5">
          <h1 className="m-0 text-2xl tracking-[-0.04em]">Fresh roles</h1>
        </div>
        <ErrorState body="We could not load your saved progress — it may be corrupted. Your deck starts fresh; favorites and applications from this browser could not be recovered.">
          <Button
            variant="dark"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </ErrorState>
      </section>
    );
  }

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
          {canUndo ? (
            <button
              type="button"
              className="min-h-[52px] rounded-[15px] border border-transparent px-[18px] font-[710]"
              onClick={runUndo}
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
            {deck.length} sample roles · live listings coming soon
          </p>
        </div>
      </div>
      <div
        className="relative mx-3.5 mt-1 min-h-0 flex-1"
        inert={!store.coached ? true : undefined}
      >
        {behind ? (
          <BehindCard job={behind} />
        ) : (
          <div className="absolute inset-x-2 bottom-1.5 top-3 rounded-[27px] border border-line bg-[#e9e5e6]" />
        )}
        <TopCard
          key={top.id}
          job={top}
          restored={restoredId === top.id}
          onDecide={(direction) => decide(direction, top.id)}
        />
      </div>
      {!store.coached ? (
        <div className="absolute inset-x-3.5 bottom-[150px] top-[60px] z-[8]">
          <CoachOverlay onDismiss={store.setCoached} />
        </div>
      ) : null}
      <DeckActions
        canUndo={canUndo}
        disabledAll={!store.coached}
        onUndo={runUndo}
        onPass={() => decide("pass")}
        onStar={() => {
          if (decidingRef.current === top.id) return;
          decidingRef.current = top.id;
          setRestoredId(null);
          store.decide(top.id, "star");
          showToast("Starred — the studio arrives next wave", {
            label: "Undo",
            onPress: () => {
              const last = store.undo();
              if (last) {
                decidingRef.current = null;
                setRestoredId(last.jobId);
              }
            },
          });
        }}
        onSave={() => decide("save")}
        onInfo={() => router.push(`/jobs/${top.id}`)}
      />
    </section>
  );
}
