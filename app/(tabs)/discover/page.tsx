"use client";

/* Discover — the swipe deck (ORCHESTRATOR-OWNED, CONTRACTS §6). Prototype
   renderDiscover() under the pink theme: flat #f4f0f1 backdrop, no deck-tint
   gradient, no card-top blob. Data is the mock catalog until W1/W2 real
   feeds arrive — the header says so honestly.

   Star fast-track opens the studio (prototype behavior, restored in W3). */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Job } from "@/lib/mock/jobs";
import { useMunusStore } from "@/lib/mock/store";
import { useSession } from "@/lib/supabase/session";
import { LogInButton } from "@/components/auth/LogInButton";
import { BehindCard, TopCard } from "@/components/deck/SwipeCard";
import { DeckActions } from "@/components/deck/DeckActions";
import { CoachOverlay } from "@/components/deck/CoachOverlay";
import type { SwipeDirection } from "@/components/deck/useSwipe";

/** Real deck row from /api/deck (W2). */
interface RealDeckJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  apply_url: string;
  description: string | null;
  verified_at: string | null;
  score: number;
  reasons: string[];
  concern: string | null;
}

const CARD_PALETTE = [
  { color: "#dcd6ff", deck: "#efecff", pop: "#d6ff63" },
  { color: "#bfe9ff", deck: "#e9f7ff", pop: "#ff8b5c" },
  { color: "#ffd9c8", deck: "#fff0e8", pop: "#8ee5c9" },
  { color: "#c9f2d9", deck: "#e9faef", pop: "#ff9ecb" },
  { color: "#ffe6a8", deck: "#fff4d9", pop: "#a8c8ff" },
];

function paletteFor(company: string) {
  let hash = 0;
  for (const ch of company) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return CARD_PALETTE[hash % CARD_PALETTE.length]!;
}

function formatSalary(min: number | null, max: number | null, currency: string | null): string {
  const cur = currency ?? "€";
  // 0 from a feed means "not listed" — never display 0k.
  const lo = min != null && min > 0 ? min : null;
  const hi = max != null && max > 0 ? max : null;
  // Values below 1000 are hourly/daily rates — show them raw, never "0k".
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
  if (lo != null && hi != null) return `${cur}${fmt(lo)}–${fmt(hi)}`;
  if (lo != null) return `${cur}${fmt(lo)}+`;
  if (hi != null) return `up to ${cur}${fmt(hi)}`;
  return "Not listed";
}

function freshLabel(verifiedAt: string | null): string {
  if (!verifiedAt) return "fresh";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(verifiedAt).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

function toJobShape(job: RealDeckJob): Job {
  const palette = paletteFor(job.company);
  return {
    id: job.id,
    applyUrl: job.apply_url,
    company: job.company,
    monogram: job.company.trim().charAt(0).toUpperCase() || "?",
    color: palette.color,
    deck: palette.deck,
    pop: palette.pop,
    title: job.title,
    location: job.remote ? `Remote · ${job.location ?? "Europe"}` : (job.location ?? "Location not listed"),
    salary: formatSalary(job.salary_min, job.salary_max, job.currency),
    type: "Full-time",
    source: "Company careers",
    fresh: freshLabel(job.verified_at),
    match: job.score,
    reasons: (job.reasons.length >= 2 ? job.reasons : [...job.reasons, "Verified listing from the company's board"]).slice(0, 2) as [string, string],
    concern: job.concern ?? "",
    // FULL job specification, verbatim from the company's feed (founder
    // feedback: the swipe cards must reflect the full spec). HTML stripped,
    // whitespace preserved; never truncated.
    about: (job.description ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  };
}

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

  const { status } = useSession();
  /* W2: when signed in with a real backend, the deck comes from /api/deck
     (ranked real jobs). W5b: mock preview removed — signed-out visitors
     get a sign-in prompt, never the sample catalog. */
  const [realDeck, setRealDeck] = useState<Job[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const loadDeck = useCallback(async () => {
    if (status !== "signedIn") return;
    setLoadFailed(false);
    try {
      const r = await fetch("/api/deck");
      if (!r.ok) throw new Error("deck" + r.status);
      const payload = (await r.json()) as { jobs?: RealDeckJob[] };
      const rows = payload?.jobs ?? [];
      if (rows.length > 0) {
        const mapped = rows.map(toJobShape);
        setRealDeck(mapped);
        /* Real jobs must open in the studio (their ids aren't in the
           mock catalog) — cache them in the store for lookup. */
        store.setDeckCache(mapped);
      } else {
        setLoadFailed(true);
      }
    } catch {
      /* network/API failure: keep the mock catalog visible but surface
         an honest retry path instead of pretending nothing happened. */
      setLoadFailed(true);
    }
  }, [status]);
  useEffect(() => {
    if (status !== "signedIn") return;
    void loadDeck();
  }, [status, loadDeck]);

  /* W5b founder direction: the mock catalog is gone — the deck is real
     jobs only. Signed-out visitors see a sign-in prompt, never samples. */
  const source = realDeck ?? [];
  const deck: Job[] = source.filter(
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

  /* W5b founder direction: no guest mock deck — signed-out visitors get a
     sign-in prompt. The deck is real listings, account-only. */
  if (status !== "signedIn") {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <div className="px-5 pb-2 pt-2.5">
          <h1 className="m-0 text-2xl tracking-[-0.04em]">Fresh roles</h1>
        </div>
        <EmptyState
          symbol="🔒"
          title="Sign in to see live listings"
          body="Your ranked deck of real company postings is tied to your account — there's no guest preview."
        >
          <LogInButton />
        </EmptyState>
      </section>
    );
  }

  /* W5b: while the ranked deck is being prepared (LLM polish takes a few
     seconds), show an honest loading screen — never "no jobs". */
  if (!realDeck && !loadFailed) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <div className="px-5 pb-2 pt-2.5">
          <h1 className="m-0 text-2xl tracking-[-0.04em]">Fresh roles</h1>
        </div>
        <LoadingState label="Ranking your matches — a few seconds" />
      </section>
    );
  }

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
          body={
            realDeck
              ? "You've swiped through every ranked role. Fresh listings arrive with the next daily refresh — undo a decision or revisit your favorites."
              : loadFailed
                ? "Live listings couldn't be loaded right now — hit Try again below."
                : "No ranked roles yet — fresh listings arrive with the next daily refresh."
          }
        >
          <LinkButton href="/favorites" variant="primary" className="w-full">
            Open favorites
          </LinkButton>
          {loadFailed ? (
            <Button onClick={() => void loadDeck()} variant="primary" className="w-full">
              Try again
            </Button>
          ) : null}
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
            {realDeck
              ? `${deck.length} ranked roles · refreshed daily from company feeds`
              : loadFailed
                ? `Live listings unavailable right now`
                : `Loading live listings…`}
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
          showToast("Starred — opening the studio");
          router.push(`/studio/${top.id}`);
        }}
        onSave={() => decide("save")}
        onInfo={() => router.push(`/jobs/${top.id}`)}
      />
    </section>
  );
}
