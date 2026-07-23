import type { ReactNode } from "react";

/* Shared shell for the legal stub pages (privacy, terms). These are DRAFT
   placeholders per FEATURES.md — real legal review lands in W5 (CONTRACTS
   §5 lists app/(marketing)/{privacy,terms} as implementer-owned, standard
   patterns). No lorem ipsum: every section gets one honest sentence about
   what will actually live there. */

export function DraftBanner() {
  return (
    <div className="mb-5 rounded-[14px] border border-[#e7cfa0] bg-[#fff6e6] px-3.5 py-3 text-[11px] leading-[1.4] text-amber">
      <strong className="font-[720]">Draft</strong> — legal review lands in
      W5. Nothing on this page is final or legally binding yet.
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line py-4 first:pt-0 last:border-b-0">
      <h2 className="m-0 mb-1.5 text-[15px] tracking-[-0.02em]">{title}</h2>
      <p className="m-0 text-[12px] leading-[1.5] text-muted">{children}</p>
    </section>
  );
}
