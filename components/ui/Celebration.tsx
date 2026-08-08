"use client";

/* One restrained confetti burst for real wins (QUALITY_BAR §3 #11:
   "Confirmed applied" is the win screen — job hunting is grim, wins get
   marked). Rules:
   - CSS-only pieces on design-token colors; no library.
   - Fires once per `burst` increment, ~1s, then unmounts fully.
   - prefers-reduced-motion: renders NOTHING — the receipt's green
     done-state is the static celebration; a frozen confetti field is
     not a "reduced" animation, it's visual noise.
   - aria-hidden + pointer-events-none: purely decorative, never in the
     way, invisible to screen readers (the status change announces
     itself through the timeline copy).
   Trajectories are index-derived (golden angle), not random — renders
   only post-interaction so SSR never sees it, but determinism keeps
   snapshots and repeat bursts stable. */

import { useEffect, useState } from "react";

const COLORS = [
  "var(--rose)",
  "var(--sky)",
  "var(--tangerine)",
  "var(--butter)",
  "var(--green)",
];

const PIECES = Array.from({ length: 18 }, (_, i) => {
  const angle = i * 137.5 * (Math.PI / 180); // golden angle spread
  const dist = 80 + (i % 5) * 26;
  return {
    dx: Math.round(Math.cos(angle) * dist * 1.15),
    /* Slight downward bias so the burst falls like confetti, not a ring. */
    dy: Math.round(Math.sin(angle) * dist * 0.75 + 120),
    rot: `${((i * 97) % 260) - 130}deg`,
    delay: `${(i % 6) * 28}ms`,
    color: COLORS[i % COLORS.length],
    w: 6 + (i % 3) * 2,
    h: 9 + ((i + 1) % 3) * 3,
  };
});

export function Celebration({ burst }: { burst: number }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (burst <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setActive(true);
    const t = window.setTimeout(() => setActive(false), 1300);
    return () => window.clearTimeout(t);
  }, [burst]);

  if (!active) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      {PIECES.map((p, i) => (
        <span
          key={`${burst}-${i}`}
          className="confetti-piece"
          style={{
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            ["--rot" as string]: p.rot,
            animationDelay: p.delay,
            background: p.color,
            width: p.w,
            height: p.h,
          }}
        />
      ))}
    </div>
  );
}

/* Cross-navigation handoff: preflight confirms, then routes to the
   receipt — the win moment must survive that jump. Preflight arms the
   flag; the receipt consumes it exactly once on mount. sessionStorage so
   a refresh or revisit never re-celebrates a stale win. */
const KEY = "munus:celebrate";

export function armCelebration(jobId: string) {
  try {
    sessionStorage.setItem(KEY, jobId);
  } catch {
    /* storage unavailable → the confirm still works, just quietly */
  }
}

export function consumeCelebration(jobId: string): boolean {
  try {
    if (sessionStorage.getItem(KEY) !== jobId) return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
