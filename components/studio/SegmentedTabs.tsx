"use client";

/* CV / Cover letter two-segment control — prototype .segmented, active tab
   gets paper background + shadow. Generic over the tab value so the caller
   supplies both the values and labels (no copy hardcoded here). */

export type SegmentedTab<T extends string> = { value: T; label: string };

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  className = "",
}: {
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  /* Arrow keys move between tabs per the tablist pattern (critic W3 #15);
     roving selection keeps it simple for a two-tab control. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = tabs.findIndex((t) => t.value === value);
    const next =
      e.key === "ArrowRight"
        ? tabs[(idx + 1) % tabs.length]
        : tabs[(idx - 1 + tabs.length) % tabs.length];
    if (next) onChange(next.value);
  };

  return (
    <div
      role="tablist"
      onKeyDown={onKeyDown}
      className={`grid grid-cols-2 rounded-[11px] bg-quiet p-[3px] ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={`h-[34px] rounded-[9px] border-0 text-[11px] font-bold ${
              active
                ? "bg-paper text-ink shadow-[0_2px_7px_rgba(31,32,38,0.08)]"
                : "bg-transparent text-muted"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
