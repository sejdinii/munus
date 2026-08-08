/* Server-side metering — CONTRACTS §3.2 and D9, made testable.

   D21 makes this load-bearing: payments are mocked, but the meter is NOT.
   It is the only thing standing between one curious account and an
   exhausted Groq free tier, so it must be real, deterministic, and
   enforced where the client cannot reach it (API routes; RLS grants the
   browser no write access to `usage`).

   The rules, verbatim from the plan:
     Free  · 20 swipes per WEEK (Monday reset)
            · the first tailored kit per SAVED job is always free
            · then 2 AI tries per job
     Plus  · unlimited within fair use: 500 swipes/day, 30 generations/day

   "Never metered by honesty": typing is always free, and the free first
   kit exists so nobody is ever charged to be accurate about themselves. */

export type Plan = "free" | "plus";

export const LIMITS = {
  free: {
    swipesPerWeek: 20,
    /** Additional AI tries per job AFTER the free first kit. */
    aiTriesPerJob: 2,
  },
  plus: {
    /** Fair use, set far above any human job hunt — it stops scripts. */
    swipesPerDay: 500,
    generationsPerDay: 30,
  },
} as const;

export type SwipeUsage = {
  plan: Plan;
  /** Swipes used in the current Monday-anchored week (free tier). */
  swipesThisWeek: number;
  /** Swipes used today (plus fair use). */
  swipesToday: number;
};

export type GenerationUsage = {
  plan: Plan;
  /** Generations already run for THIS job (free tier, per job). */
  generationsForJob: number;
  /** Generations run today across all jobs (plus fair use). */
  generationsToday: number;
};

export type Decision =
  | { allowed: true; remaining: number }
  | { allowed: false; reason: LimitReason; remaining: 0 };

export type LimitReason =
  | "free-weekly-swipes"
  | "plus-daily-swipes"
  | "free-job-generations"
  | "plus-daily-generations";

function allow(remaining: number): Decision {
  return { allowed: true, remaining: Math.max(0, remaining) };
}
function deny(reason: LimitReason): Decision {
  return { allowed: false, reason, remaining: 0 };
}

export function canSwipe(usage: SwipeUsage): Decision {
  if (usage.plan === "plus") {
    const left = LIMITS.plus.swipesPerDay - usage.swipesToday;
    return left > 0 ? allow(left) : deny("plus-daily-swipes");
  }
  const left = LIMITS.free.swipesPerWeek - usage.swipesThisWeek;
  return left > 0 ? allow(left) : deny("free-weekly-swipes");
}

/** The first kit on a saved job is free, then `aiTriesPerJob` more. */
export function canGenerate(usage: GenerationUsage): Decision {
  if (usage.plan === "plus") {
    const left = LIMITS.plus.generationsPerDay - usage.generationsToday;
    return left > 0 ? allow(left) : deny("plus-daily-generations");
  }
  const allowance = 1 + LIMITS.free.aiTriesPerJob;
  const left = allowance - usage.generationsForJob;
  return left > 0 ? allow(left) : deny("free-job-generations");
}

/** Monday 00:00 UTC anchoring the free weekly window. */
export function weekStart(at: Date): string {
  const d = new Date(
    Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()),
  );
  // getUTCDay: 0=Sun … 6=Sat. Shift so Monday is the first day.
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

export function dayKey(at: Date): string {
  return at.toISOString().slice(0, 10);
}

/** Copy for the paywall moment — honest about what is and isn't blocked. */
export function limitCopy(reason: LimitReason): {
  title: string;
  body: string;
} {
  switch (reason) {
    case "free-weekly-swipes":
      return {
        title: "You’re out of free swipes",
        body: "Your 20 free swipes reset Monday. Your favorites, documents, and applications stay fully available.",
      };
    case "free-job-generations":
      return {
        title: "You’ve used this job’s AI tries",
        body: "Free includes a tailored kit plus two more tries per job. Editing by hand is always free — and everything you’ve accepted is kept.",
      };
    case "plus-daily-swipes":
      return {
        title: "Daily fair-use limit reached",
        body: "Plus is unlimited within fair use (500 swipes a day). It resets tomorrow — this limit exists to stop scripts, not people.",
      };
    case "plus-daily-generations":
      return {
        title: "Daily generation limit reached",
        body: "Plus allows 30 generations a day. It resets tomorrow — this limit exists to stop scripts, not people.",
      };
  }
}
