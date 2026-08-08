"use client";

/* First-run coach — prototype .coach-overlay/.coach-card, shown once until
   dismissed (persisted via store.coached). */

import { Button } from "@/components/ui/Button";

const rows: Array<[string, React.ReactNode]> = [
  ["→", <span key="r"><strong>Swipe right</strong> to save a role to Favorites.</span>],
  ["←", <span key="l"><strong>Swipe left</strong> to pass. Undo is always one tap away.</span>],
  ["★", <span key="s"><strong>Star</strong> a role to save it and jump straight into tailoring.</span>],
];

export function CoachOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="absolute inset-0 z-[8] grid place-items-center rounded-[28px] bg-ink/45 backdrop-blur-[3px]">
      <div
        role="dialog"
        aria-label="Three ways to decide"
        className="w-[84%] rounded-[22px] border border-line bg-paper px-5 py-[22px] shadow-[0_18px_50px_rgba(24,20,22,0.25)]"
      >
        <h3 className="m-0 mb-3.5 text-[17px] tracking-[-0.03em]">
          Three ways to decide
        </h3>
        {rows.map(([icon, text]) => (
          <div
            key={String(icon)}
            className="mb-[11px] grid grid-cols-[34px_1fr] items-center gap-[11px] text-xs leading-[1.35]"
          >
            <span className="grid size-[34px] place-items-center rounded-xl bg-rose-soft text-[15px] font-extrabold text-rose-ink">
              {icon}
            </span>
            {text}
          </div>
        ))}
        <Button variant="primary" className="mt-1.5 w-full" onClick={onDismiss}>
          Got it
        </Button>
      </div>
    </div>
  );
}
