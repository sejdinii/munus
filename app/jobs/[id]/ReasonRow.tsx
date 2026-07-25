import type { ReactNode } from "react";

/* reason-row from the prototype (renderDetail): a check row for each fit
   reason, an amber "!" row for the concern. Local to this slice — not a
   shared component, the layout is specific to the job-detail fit section. */
export function ReasonRow({
  tone,
  children,
}: {
  tone: "ok" | "concern";
  children: ReactNode;
}) {
  return (
    <div className="mt-3 grid grid-cols-[24px_1fr] gap-2.5 text-xs leading-[1.38]">
      <span
        aria-hidden
        className={`grid size-[22px] place-items-center rounded-full text-[11px] font-extrabold ${
          tone === "ok" ? "bg-[#eaf7f0] text-green" : "bg-[#fff3e4] text-amber"
        }`}
      >
        {tone === "ok" ? "✓" : "!"}
      </span>
      <div>{children}</div>
    </div>
  );
}
