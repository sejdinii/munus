"use client";

/* Registers the offline-shell service worker (public/sw.js). Production
   only: in dev the worker would fight HMR and cache stale chunks.
   Registration is deliberately fire-and-forget — a failed registration
   means the app simply stays online-only, which is not an error state
   worth surfacing. NO install prompt lives here: prompt placement is a
   QW5 decision (after the first win, never before — QUALITY_BAR §4). */

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* online-only fallback; nothing to tell the user */
    });
  }, []);
  return null;
}
