"use client";

/* "Did you apply?" return-confirm (Handshake pattern, plan §1.5) — shown
   when the user comes back after opening the official listing. Real dialog
   semantics: focus on open, trap, Escape = not yet. */

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

export function ConfirmReturnDialog({
  company,
  onConfirm,
  onNotYet,
}: {
  company: string;
  onConfirm: () => void;
  onNotYet: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    yesRef.current?.focus();
    /* Lock background scroll while modal (critic W4 #11). */
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onNotYet();
        return;
      }
      if (e.key === "Tab" && cardRef.current) {
        const focusables = Array.from(
          cardRef.current.querySelectorAll<HTMLElement>("button:not([disabled])"),
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!cardRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [onNotYet]);

  return (
    <div className="absolute inset-0 z-30 grid place-items-center px-6">
      <div aria-hidden className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]" />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-return-title"
        className="relative w-full rounded-[22px] border border-line bg-paper px-5 py-[22px] shadow-[0_18px_50px_rgba(24,20,22,0.25)]"
      >
        <h3
          id="confirm-return-title"
          className="m-0 mb-1.5 text-[17px] tracking-[-0.03em]"
        >
          Did you apply at {company}?
        </h3>
        <p className="mb-4 text-[12px] leading-[1.4] text-muted">
          If you submitted on the official page, we’ll file your receipt.
          If not, no rush — everything stays ready.
        </p>
        <div className="grid gap-[9px]">
          <Button ref={yesRef} variant="primary" onClick={onConfirm}>
            Yes, I applied
          </Button>
          <Button variant="plain" className="min-h-11" onClick={onNotYet}>
            Not yet
          </Button>
        </div>
      </div>
    </div>
  );
}
