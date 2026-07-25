import type { ReactNode } from "react";

/* Bordered document card — prototype .doc-preview / .doc-toolbar / .doc-page.
   The toolbar's right-side status is fully caller-styled (e.g. muted
   "Original" vs green "3 open suggestions") — this component only lays
   out the shell. */

export function DocPreview({
  title,
  status,
  children,
}: {
  title: string;
  status: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line px-[13px] py-[11px]">
        <strong className="text-xs">{title}</strong>
        {status}
      </div>
      <div className="min-h-[280px] px-[19px] py-[21px]">{children}</div>
    </div>
  );
}

/** Gray placeholder lines for un-generated document content — .doc-line,
 * last line short by default (.doc-line.short). */
export function DocLines({
  count = 3,
  lastShort = true,
  className = "",
}: {
  count?: number;
  lastShort?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`mt-[9px] h-[5px] rounded-[5px] bg-[#ded8da] ${
            lastShort && i === count - 1 ? "w-[62%]" : ""
          }`}
        />
      ))}
    </div>
  );
}
