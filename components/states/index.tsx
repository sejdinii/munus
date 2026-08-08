import type { ReactNode } from "react";

/* The three mandatory screen states (CONTRACTS §4: every screen ships
   loading, empty, and error) plus offline, all styled from the prototype's
   .empty-state / .generating patterns. */

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[350px] flex-1 place-items-center text-center">
      <div role="status" aria-live="polite">
        <div className="mx-auto mb-3.5 size-[30px] animate-[spin_0.8s_linear_infinite] rounded-full border-[3px] border-quiet border-t-rose" />
        <strong className="text-sm">{label}</strong>
      </div>
    </div>
  );
}

/* ── Skeletons (QUALITY_BAR §4: skeletons, not spinners, on data
   surfaces). LoadingState's spinner remains correct for PROCESS states
   (something is being done: generating, submitting); skeletons are for
   "your data is on its way" and must echo the destination's layout so
   the reveal doesn't jump. All are aria-hidden inside a labelled
   role=status wrapper — screen readers get one announcement, not a
   pile of meaningless boxes. */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-lg ${className}`} />;
}

function SkeletonShell({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={`flex-1 ${className}`}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Deck-shaped: one large card with photo area, title lines, chip row. */
export function SkeletonDeck({ label = "Loading your deck" }: { label?: string }) {
  return (
    <SkeletonShell label={label} className="grid p-4">
      <div className="relative flex flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-paper p-[18px]">
        <Skeleton className="mb-4 h-[44%] min-h-[190px] w-full rounded-[20px]" />
        <Skeleton className="mb-2.5 h-7 w-3/4" />
        <Skeleton className="mb-5 h-4 w-1/2" />
        <div className="mb-5 flex gap-2">
          <Skeleton className="h-6 w-20 rounded-[8px]" />
          <Skeleton className="h-6 w-24 rounded-[8px]" />
          <Skeleton className="h-6 w-16 rounded-[8px]" />
        </div>
        <div className="mt-auto flex items-center justify-center gap-4">
          <Skeleton className="size-[54px] rounded-full" />
          <Skeleton className="size-[64px] rounded-full" />
          <Skeleton className="size-[54px] rounded-full" />
        </div>
      </div>
    </SkeletonShell>
  );
}

/** List-shaped: leading tile + two text lines, for favorites/applications/
 *  profile rows. */
export function SkeletonRows({
  count = 4,
  label = "Loading",
}: {
  count?: number;
  label?: string;
}) {
  return (
    <SkeletonShell label={label} className="grid content-start gap-3 p-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 rounded-[18px] border border-line bg-paper p-3.5"
        >
          <Skeleton className="size-[46px] shrink-0 rounded-[14px]" />
          <div className="min-w-0 flex-1">
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </SkeletonShell>
  );
}

/** Detail/document-shaped: heading block then paragraph lines, for job
 *  detail, receipt, and studio surfaces. */
export function SkeletonDetail({ label = "Loading" }: { label?: string }) {
  return (
    <SkeletonShell label={label} className="grid content-start gap-3 p-5">
      <Skeleton className="h-8 w-4/5" />
      <Skeleton className="mb-3 h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-5 h-[52px] w-full rounded-[15px]" />
    </SkeletonShell>
  );
}

export function EmptyState({
  symbol,
  title,
  body,
  children,
  tone = "rose",
}: {
  symbol: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
  tone?: "rose" | "ink";
}) {
  return (
    <div className="grid flex-1 place-items-center p-[35px] text-center">
      <div>
        <div
          className={`pop-in mx-auto mb-[18px] grid size-[68px] place-items-center rounded-[22px] text-[27px] ${
            tone === "rose" ? "bg-rose-soft text-rose" : "bg-quiet text-ink"
          }`}
        >
          {symbol}
        </div>
        <h2 className="m-0 text-[26px] tracking-[-0.045em]">{title}</h2>
        <p className="text-[13px] leading-[1.45] text-muted">{body}</p>
        {children ? <div className="mt-4 grid gap-2.5">{children}</div> : null}
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  body,
  children,
}: {
  title?: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <EmptyState symbol="!" tone="ink" title={title} body={body}>
      {children}
    </EmptyState>
  );
}

export function OfflineState({ children }: { children?: ReactNode }) {
  return (
    <EmptyState
      symbol="!"
      tone="ink"
      title="No connection"
      body="Your favorites and prepared applications are still available. New roles will refresh when you reconnect."
    >
      {children}
    </EmptyState>
  );
}
