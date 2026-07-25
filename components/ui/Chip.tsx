import type { ReactNode } from "react";

/** meta-chip from the prototype: quiet pill for location/salary/type. */
export function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[8px] bg-quiet px-2 py-1.5 text-[10px] font-[650]">
      {children}
    </span>
  );
}

type ReadyTone = "default" | "ok" | "top";

const readyTone: Record<ReadyTone, string> = {
  default: "bg-quiet text-muted",
  ok: "bg-[#eaf7f0] text-green",
  top: "bg-rose-soft text-rose-ink",
};

/** ready-chip from the prototype: per-job readiness status in Favorites. */
export function ReadyChip({
  tone = "default",
  children,
}: {
  tone?: ReadyTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[7px] px-[7px] py-1 text-[9px] font-[750] ${readyTone[tone]}`}
    >
      {children}
    </span>
  );
}
