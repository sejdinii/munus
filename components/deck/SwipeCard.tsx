"use client";

/* The deck card — prototype jobCardHTML() under the pink theme (card-top
   decorative blob hidden, SAVE stamp rose-outline). The top card gets swipe
   handlers; behind cards render statically scaled back. */

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Job } from "@/lib/mock/jobs";
import { useSwipe, type SwipeDirection } from "./useSwipe";

function CardInner({ job, restored }: { job: Job; restored?: boolean }) {
  return (
    <>
      <div
        className="relative flex min-h-[165px] flex-col justify-between overflow-hidden p-[19px]"
        style={{ background: job.color }}
      >
        <div className="flex items-center justify-between gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-[20px] border border-ink/10 bg-white/65 px-[9px] py-1.5 text-[10px] font-bold backdrop-blur-sm">
            <i className="size-1.5 rounded-full bg-green" aria-hidden />
            {job.source}
          </span>
          <span className="text-[10px] font-[650]">{job.fresh}</span>
        </div>
        <span className="text-[65px] font-[850] leading-[0.8] tracking-[-0.08em] opacity-90">
          {job.monogram}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-[19px] pb-[17px] pt-5">
        <p className="m-0 mb-[5px] text-xs font-[650] text-muted">{job.company}</p>
        <h2 className="m-0 text-[29px] leading-[1.04] tracking-[-0.05em]">
          {job.title}
        </h2>
        <div className="mt-3 flex flex-wrap gap-[7px]">
          <span className="rounded-[8px] bg-quiet px-2 py-1.5 text-[10px] font-[650]">
            {job.location}
          </span>
          <span className="rounded-[8px] bg-quiet px-2 py-1.5 text-[10px] font-[650]">
            {job.salary}
          </span>
        </div>
        <div className="mt-4 border-t border-line pt-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <strong className="text-xs">Why it fits</strong>
            <span className="text-xs font-extrabold text-green">
              {job.match}% match
            </span>
          </div>
          {job.reasons.map((reason) => (
            <div
              key={reason}
              className="mt-[7px] grid grid-cols-[18px_1fr] gap-[7px] text-[11px] leading-[1.3]"
            >
              <b className="text-green">✓</b>
              <span>{reason}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto grid grid-cols-[18px_1fr] gap-[7px] rounded-[10px] bg-[#fff7ec] p-2.5 text-[10px] leading-[1.35] text-[#70471a]">
          <b>!</b>
          <span>{job.concern}</span>
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="mt-[11px] w-full p-1 text-center text-[11px] font-[750] text-ink underline underline-offset-[3px]"
        >
          Read full job profile
        </Link>
      </div>
      {restored ? (
        <span className="stamp-back absolute left-1/2 top-[60px] z-[4] -translate-x-1/2 rotate-[-6deg] rounded-lg border-[3px] border-amber bg-[#fff7ec] px-2.5 py-[7px] text-[22px] font-black tracking-[0.05em] text-amber">
          BACK
        </span>
      ) : null}
    </>
  );
}

export function BehindCard({ job }: { job: Job }) {
  return (
    <article
      aria-hidden
      className="pointer-events-none absolute inset-0 flex scale-[0.955] translate-y-3 flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-paper shadow-[0_8px_22px_rgba(31,32,38,0.06)]"
    >
      <CardInner job={job} />
    </article>
  );
}

export function TopCard({
  job,
  restored,
  onDecide,
}: {
  job: Job;
  restored: boolean;
  onDecide: (direction: SwipeDirection) => void;
}) {
  const swipe = useSwipe(onDecide);
  return (
    <article
      {...swipe.handlers}
      data-swipe-card
      className={`card-promote absolute inset-0 flex touch-none select-none flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-paper shadow-[0_13px_34px_rgba(31,32,38,0.09)] ${
        swipe.dragging
          ? ""
          : "transition-[transform,opacity] duration-[220ms] ease-out"
      }`}
      style={swipe.style as CSSProperties}
    >
      <span
        className="absolute left-[22px] top-[31px] z-[4] rotate-[-8deg] rounded-lg border-[3px] border-rose bg-transparent px-2.5 py-[7px] text-[22px] font-black tracking-[0.05em] text-rose"
        style={{ opacity: swipe.saveStampOpacity }}
        aria-hidden
      >
        SAVE
      </span>
      <span
        className="absolute right-[22px] top-[31px] z-[4] rotate-[8deg] rounded-lg border-[3px] border-ink px-2.5 py-[7px] text-[22px] font-black tracking-[0.05em] text-ink"
        style={{ opacity: swipe.passStampOpacity }}
        aria-hidden
      >
        PASS
      </span>
      <CardInner job={job} restored={restored} />
    </article>
  );
}
