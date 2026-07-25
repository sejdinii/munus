"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

/* Bottom sheet for "Regenerate with guidance" — prototype .guide-sheet /
   .guide-scrim / .guide-card / .guide-grabber / .guide-chips / .guide-chip.
   Real dialog: role="dialog", aria-modal, first chip focused on open,
   Escape + scrim click both cancel.

   The prototype's .guide-card mount animation is a CSS @keyframes
   (sheetUp). Per spec, no global CSS may be touched from this slice, so the
   slide-up is done with a plain translate-y transition driven by an
   `entered` flag flipped one frame after mount — same enter-transition
   technique already used by components/ui/Toast.tsx in this codebase. */

export function ToneSheet({
  open,
  tones,
  selected,
  onSelect,
  onRegenerate,
  onCancel,
}: {
  open: boolean;
  tones: string[];
  selected: string | null;
  onSelect: (tone: string) => void;
  onRegenerate: () => void;
  onCancel: () => void;
}) {
  const [entered, setEntered] = useState(false);
  const firstChipRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    /* Remember the opener so focus returns to it on close (critic W3 #7). */
    triggerRef.current = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => setEntered(true));
    firstChipRef.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      triggerRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      /* Focus trap: Tab cycles within the sheet (critic W3 #7). */
      if (e.key === "Tab" && cardRef.current) {
        const focusables = Array.from(
          cardRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled])",
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const active = document.activeElement;
        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!cardRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-end">
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 bg-ink/35"
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tone-sheet-title"
        className={`relative w-full rounded-t-[26px] bg-paper px-5 pb-[26px] pt-3.5 shadow-[0_-12px_40px_rgba(24,20,22,0.18)] transition-transform duration-300 ease-out ${
          entered ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-3.5 h-1 w-[38px] rounded-[3px] bg-line" />
        <h3 id="tone-sheet-title" className="m-0 mb-1 text-[17px] tracking-[-0.03em]">
          Regenerate with guidance
        </h3>
        <p className="mb-3.5 text-[11px] text-muted">
          Pick a direction. Evidence-only mode stays on — wording changes,
          facts never do.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {tones.map((tone, i) => {
            const isSelected = tone === selected;
            return (
              <button
                key={tone}
                ref={i === 0 ? firstChipRef : undefined}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(tone)}
                className={`rounded-[18px] border px-3.5 py-2.5 text-xs font-bold ${
                  isSelected
                    ? "border-rose bg-rose-soft text-rose-ink"
                    : "border-line bg-paper text-ink"
                }`}
              >
                {tone}
              </button>
            );
          })}
        </div>
        <div className="grid gap-[9px]">
          <Button variant="primary" disabled={!selected} onClick={onRegenerate}>
            Regenerate
          </Button>
          <Button variant="plain" small onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
