"use client";

/* Swipe physics ported 1:1 from the prototype's attachSwipe():
   - drag: translate(dx, dy*0.28) rotate(dx/18deg)
   - stamp opacity ramps over 75px of horizontal drag
   - release beyond ±90px commits (fling to ±520px, 40px drop, ±18deg),
     otherwise springs back
   - drags starting on buttons/links are ignored so taps keep working */

import { useCallback, useEffect, useRef, useState } from "react";

export type SwipeDirection = "save" | "pass";

type SwipeState = {
  dx: number;
  dy: number;
  dragging: boolean;
  leaving: SwipeDirection | null;
};

const COMMIT_PX = 90;
/* Flick: a fast short swipe commits too (BACKLOG W2 design intel —
   react-tinder-card/rn-swiper-list pattern: position OR velocity). */
const FLICK_VELOCITY_PX_MS = 0.6;
const FLICK_MIN_PX = 30;
const STAMP_RAMP_PX = 75;
const FLING_PX = 520;

export function useSwipe(onCommit: (direction: SwipeDirection) => void) {
  const [state, setState] = useState<SwipeState>({
    dx: 0,
    dy: 0,
    dragging: false,
    leaving: null,
  });
  const start = useRef<{ x: number; y: number } | null>(null);
  const committed = useRef(false);
  const commitTimer = useRef<number | undefined>(undefined);
  const lastMove = useRef<{ x: number; t: number } | null>(null);
  const velocity = useRef(0);

  /* If the card unmounts before the delayed commit fires (e.g. a button
     decided the deck first), the stale commit must never run. */
  useEffect(() => () => window.clearTimeout(commitTimer.current), []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    start.current = { x: e.clientX, y: e.clientY };
    committed.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setState((s) => ({ ...s, dragging: true }));
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!start.current || committed.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const now = performance.now();
    if (lastMove.current) {
      const dt = now - lastMove.current.t;
      if (dt > 0) velocity.current = (e.clientX - lastMove.current.x) / dt;
    }
    lastMove.current = { x: e.clientX, t: now };
    setState({ dx, dy, dragging: true, leaving: null });
  }, []);

  const end = useCallback(() => {
    if (!start.current || committed.current) return;
    const vx = velocity.current;
    velocity.current = 0;
    lastMove.current = null;
    setState((s) => {
      const flick =
        Math.abs(vx) > FLICK_VELOCITY_PX_MS &&
        Math.abs(s.dx) > FLICK_MIN_PX &&
        Math.sign(vx) === Math.sign(s.dx);
      if (Math.abs(s.dx) > COMMIT_PX || flick) {
        const direction: SwipeDirection = s.dx > 0 ? "save" : "pass";
        committed.current = true;
        commitTimer.current = window.setTimeout(() => onCommit(direction), 180);
        return { ...s, dragging: false, leaving: direction };
      }
      return { dx: 0, dy: 0, dragging: false, leaving: null };
    });
    start.current = null;
  }, [onCommit]);

  const flingOut = state.leaving
    ? {
        transform: `translate(${state.leaving === "save" ? FLING_PX : -FLING_PX}px, 40px) rotate(${state.leaving === "save" ? 18 : -18}deg)`,
        opacity: 0,
      }
    : null;

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
    dragging: state.dragging,
    leaving: state.leaving,
    style:
      flingOut ??
      (state.dragging && (state.dx !== 0 || state.dy !== 0)
        ? {
            transform: `translate(${state.dx}px, ${state.dy * 0.28}px) rotate(${state.dx / 18}deg)`,
          }
        : undefined),
    saveStampOpacity: state.leaving === "save" ? 1 : Math.max(0, Math.min(1, state.dx / STAMP_RAMP_PX)),
    passStampOpacity: state.leaving === "pass" ? 1 : Math.max(0, Math.min(1, -state.dx / STAMP_RAMP_PX)),
  };
}
