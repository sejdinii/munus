"use client";

/* Single favorites row — monogram tile, readiness chip, match/verified line,
   disabled "Tailor application" CTA (studio route is a later wave), and a
   chevron-triggered overflow menu for unsave (no swipe gesture here). */

import { useState } from "react";
import { ReadyChip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Job } from "@/lib/mock/jobs";
import { useMunusStore, type StudioState } from "@/lib/mock/store";

function readinessChip(studio: StudioState | undefined) {
  const ready = Boolean(studio?.generated) && (studio?.accepted.length ?? 0) >= 2;
  if (ready) return <ReadyChip tone="ok">✓ Tailored &amp; ready</ReadyChip>;
  if (studio?.generated) return <ReadyChip tone="top">Review suggestions</ReadyChip>;
  return <ReadyChip>Not tailored yet</ReadyChip>;
}

export function FavoriteRow({ job }: { job: Job }) {
  const { studio, unsave } = useMunusStore();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="grid grid-cols-[58px_1fr_auto] items-center gap-[13px] border-t border-line py-4 first:border-t-0">
      <div
        className="grid size-[58px] place-items-center rounded-[17px] text-[22px] font-[850] tracking-[-0.06em]"
        style={{ background: job.color }}
        aria-hidden
      >
        {job.monogram}
      </div>
      <div>
        <h3 className="m-0 mb-1 text-[15px] tracking-[-0.025em]">{job.title}</h3>
        <p className="m-0 text-[11px] leading-[1.35] text-muted">
          {job.company} · {job.location}
        </p>
        <p className="m-0 mt-1.5">{readinessChip(studio[job.id])}</p>
      </div>
      <div className="relative self-start">
        <button
          type="button"
          aria-label={`Options for ${job.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="grid size-7 place-items-center rounded-full text-xl text-muted hover:bg-quiet"
        >
          ›
        </button>
        {menuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setMenuOpen(false)}
            />
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1 min-w-[190px] rounded-2xl border border-line bg-paper p-1 shadow-[0_20px_50px_rgba(32,32,38,0.18)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  unsave(job.id);
                  showToast(`Removed “${job.title}” from favorites`);
                }}
                className="w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-[650] text-red hover:bg-quiet"
              >
                Remove from favorites
              </button>
            </div>
          </>
        ) : null}
      </div>
      <div className="col-start-2 col-span-2 -mt-[3px] flex items-center justify-between">
        <span className="text-[10px] font-[750] text-green">
          {job.match}% fit · verified {job.fresh.toLowerCase()}
        </span>
        <Button
          variant="dark"
          small
          disabled
          title="Application studio arrives in the next wave"
        >
          Tailor application
        </Button>
      </div>
    </article>
  );
}
