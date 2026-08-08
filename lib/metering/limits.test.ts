import { describe, expect, it } from "vitest";
import {
  canGenerate,
  canSwipe,
  dayKey,
  LIMITS,
  limitCopy,
  weekStart,
  type LimitReason,
} from "./limits";

describe("swipe metering (D9)", () => {
  it("free tier allows exactly 20 swipes per week", () => {
    expect(canSwipe({ plan: "free", swipesThisWeek: 19, swipesToday: 0 })).toEqual({
      allowed: true,
      remaining: 1,
    });
    const blocked = canSwipe({ plan: "free", swipesThisWeek: 20, swipesToday: 0 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.allowed === false && blocked.reason).toBe("free-weekly-swipes");
  });

  it("free tier is metered weekly, not daily — a heavy day is fine", () => {
    expect(
      canSwipe({ plan: "free", swipesThisWeek: 5, swipesToday: 5 }).allowed,
    ).toBe(true);
  });

  it("plus is metered by daily fair use, not the weekly free cap", () => {
    expect(
      canSwipe({ plan: "plus", swipesThisWeek: 9_999, swipesToday: 10 }).allowed,
    ).toBe(true);
    const blocked = canSwipe({
      plan: "plus",
      swipesThisWeek: 0,
      swipesToday: LIMITS.plus.swipesPerDay,
    });
    expect(blocked.allowed === false && blocked.reason).toBe("plus-daily-swipes");
  });
});

describe("generation metering — the free first kit is never charged", () => {
  it("free: first kit plus two more tries = 3 generations per job", () => {
    for (let used = 0; used < 3; used++) {
      expect(
        canGenerate({ plan: "free", generationsForJob: used, generationsToday: 0 })
          .allowed,
      ).toBe(true);
    }
    const blocked = canGenerate({
      plan: "free",
      generationsForJob: 3,
      generationsToday: 0,
    });
    expect(blocked.allowed === false && blocked.reason).toBe(
      "free-job-generations",
    );
  });

  it("free generations are per JOB — a spent job never blocks a fresh one", () => {
    expect(
      canGenerate({ plan: "free", generationsForJob: 0, generationsToday: 50 })
        .allowed,
    ).toBe(true);
  });

  it("plus is capped daily across all jobs", () => {
    const blocked = canGenerate({
      plan: "plus",
      generationsForJob: 0,
      generationsToday: LIMITS.plus.generationsPerDay,
    });
    expect(blocked.allowed === false && blocked.reason).toBe(
      "plus-daily-generations",
    );
  });
});

describe("week/day keys", () => {
  it("anchors the free week to Monday UTC", () => {
    // 2026-07-26 is a Sunday; its week began Monday the 20th.
    expect(weekStart(new Date("2026-07-26T23:00:00Z"))).toBe("2026-07-20");
    expect(weekStart(new Date("2026-07-20T00:00:00Z"))).toBe("2026-07-20");
    // Monday the 27th starts a new window — this is the reset users are told about.
    expect(weekStart(new Date("2026-07-27T00:00:00Z"))).toBe("2026-07-27");
  });

  it("day keys are UTC calendar days", () => {
    expect(dayKey(new Date("2026-07-26T23:59:59Z"))).toBe("2026-07-26");
  });
});

describe("paywall copy stays honest", () => {
  const reasons: LimitReason[] = [
    "free-weekly-swipes",
    "free-job-generations",
    "plus-daily-swipes",
    "plus-daily-generations",
  ];

  it("every reason has copy and none claims data is lost or withheld", () => {
    for (const reason of reasons) {
      const copy = limitCopy(reason);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.body.length).toBeGreaterThan(0);
      expect(copy.body.toLowerCase()).not.toContain("deleted");
    }
  });

  it("fair-use copy says the limit targets scripts, not people", () => {
    expect(limitCopy("plus-daily-swipes").body).toContain("stop scripts");
    expect(limitCopy("plus-daily-generations").body).toContain("stop scripts");
  });

  it("the AI-tries limit promises manual editing stays free", () => {
    expect(limitCopy("free-job-generations").body).toContain("always free");
  });
});
