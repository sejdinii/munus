"use client";

import type { ReactNode } from "react";

/* AI suggestion block — prototype .suggestion / .suggestion-label /
   .evidence / .change-actions. Rose left border, uppercase label, body
   text, an evidence chip, and the Accept / Keep original action pair. */

/** Green "✓ From ..." evidence source chip — prototype .evidence. */
export function EvidenceChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-white px-1.5 py-1 text-[8px] font-bold text-green">
      {children}
    </span>
  );
}

/* .change-actions button is a 30px-tall visual pill, but a 30px hit target
   fails the 44px minimum. The outer <button> carries invisible padding to
   reach 44px and a matching negative margin so it doesn't widen the row's
   footprint; the inner <span> carries all the visible 30px chrome. */
function ActionButton({
  onClick,
  accepted = false,
  children,
}: {
  onClick: () => void;
  accepted?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-my-[7px] flex min-h-11 items-center rounded-[8px]"
    >
      <span
        className={`flex h-[30px] items-center rounded-[8px] border px-2.5 text-[9px] font-bold ${
          accepted
            ? "border-green bg-[#eaf7f0] text-green"
            : "border-line bg-white text-ink"
        }`}
      >
        {children}
      </span>
    </button>
  );
}

export function SuggestionCard({
  label,
  text,
  evidence,
  accepted,
  onAccept,
  onKeepOriginal,
}: {
  label: string;
  text: string;
  evidence: string;
  accepted: boolean;
  onAccept: () => void;
  onKeepOriginal: () => void;
}) {
  return (
    <div className="mt-4 border-l-[3px] border-rose bg-rose-soft p-[11px]">
      <span className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-rose-ink">
        {label}
      </span>
      <p className="my-1.5 text-[11px] leading-[1.4] text-[#443a3f]">{text}</p>
      <EvidenceChip>{evidence}</EvidenceChip>
      <div className="mt-2.5 flex gap-[7px]">
        <ActionButton onClick={onAccept} accepted={accepted}>
          {accepted ? "✓ Accepted" : "Accept"}
        </ActionButton>
        <ActionButton onClick={onKeepOriginal}>Keep original</ActionButton>
      </div>
    </div>
  );
}
