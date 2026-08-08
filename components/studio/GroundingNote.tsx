import type { ReactNode } from "react";

/* Green evidence-mode note — prototype .grounding-note. The checkmark is
   fixed chrome; the copy is entirely the caller's responsibility so this
   component never asserts what the AI can or cannot do (CONTRACTS §3.1:
   evidence-only, never invent). */

export function GroundingNote({ children }: { children: ReactNode }) {
  return (
    <div className="mb-[18px] grid grid-cols-[22px_1fr] gap-[9px] rounded-[14px] bg-[#eef8f3] p-3 text-[10px] leading-[1.4] text-[#22563d]">
      <span aria-hidden="true">✓</span>
      <span>{children}</span>
    </div>
  );
}
