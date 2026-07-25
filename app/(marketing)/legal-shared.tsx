"use client";

import type { ReactNode } from "react";

/* Shared shell for the real legal pages (privacy, terms) — Wave 5 slice C
   (FEATURES D21: real accounts hold real CVs, so the law half of W5 is not
   deferred). These are the team's own honest draft of what Munus actually
   does per CONTRACTS §2 data shapes and §3 invariants; they are NOT lorem,
   NOT generic SaaS boilerplate, and NOT yet reviewed by a solicitor — the
   DraftBanner below says so on every page and must stay until a lawyer signs
   off (see FEATURES DECISIONS LOG when that happens). */

export function DraftBanner() {
  return (
    <div className="mb-5 rounded-[14px] border border-[#e7cfa0] bg-[#fff6e6] px-3.5 py-3 text-[11px] leading-[1.45] text-amber">
      <strong className="font-[720]">Working draft, not legal advice.</strong>{" "}
      This page was written in-house by the Munus team to describe honestly
      what the product collects and does — it has{" "}
      <strong className="font-[720]">not</strong> been reviewed by a
      solicitor. A qualified lawyer must review and sign off before this
      policy is relied on for a public launch.
    </div>
  );
}

export function LastUpdated({ date }: { date: string }) {
  return (
    <p className="m-0 mb-4 text-[11px] font-[650] text-muted">
      Last updated: {date}
    </p>
  );
}

export type TocItem = { id: string; label: string };

/** Scannable table of contents. Smooth-scrolls the inner scroll container
 * (the page body scrolls, not `window` — see page.tsx) rather than relying
 * only on native hash-jump, which some browsers don't apply to nested
 * overflow containers. */
export function LegalTOC({ items }: { items: TocItem[] }) {
  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    el.focus({ preventScroll: true });
  };

  return (
    <nav
      aria-label="Table of contents"
      className="mb-5 rounded-[14px] border border-line bg-paper px-3.5 py-3"
    >
      <p className="m-0 mb-2 text-[10px] font-[720] uppercase tracking-[0.06em] text-muted">
        On this page
      </p>
      <ol className="m-0 grid list-none gap-[7px] p-0">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className="text-[12px] font-[650] text-rose-ink underline-offset-2 hover:underline"
            >
              {i + 1}. {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      className="scroll-mt-3 border-b border-line py-4 outline-none first:pt-0 last:border-b-0"
    >
      <h2 className="m-0 mb-1.5 text-[15px] tracking-[-0.02em]">{title}</h2>
      <div className="grid gap-2 text-[12px] leading-[1.55] text-muted [&_a]:text-rose-ink [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-0.5 [&_ol]:m-0 [&_ol]:grid [&_ol]:list-decimal [&_ol]:gap-1.5 [&_ol]:pl-4 [&_strong]:font-[650] [&_strong]:text-ink [&_ul]:m-0 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5 [&_ul]:pl-4">
        {children}
      </div>
    </section>
  );
}

/** High-emphasis callout for the invariants that most need to survive a
 * skim: redirect-apply, evidence-only, never-to-employers. Rose, not amber —
 * amber is reserved for the draft-status warning. */
export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[12px] bg-rose-soft px-3 py-2.5 text-[12px] font-[650] leading-[1.5] text-rose-ink">
      {children}
    </div>
  );
}

/** Marks a fact the founder must supply before launch (contact address,
 * registration number, governing law, etc.) — never invented, always
 * visually distinct so it can't be mistaken for a real value. */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[6px] bg-quiet px-1.5 py-[3px] font-mono text-[11px] text-ink">
      [{children}]
    </span>
  );
}
