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
  return (
    <div
      role="tablist"
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
