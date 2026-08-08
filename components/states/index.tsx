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
  /* Default radius ONLY when the caller passes none: at equal specificity
     the class that sorts later in the built CSS wins, so an unconditional
     rounded-lg silently flattens every rounded-full/rounded-[…] override
     (critic QW0 #2 — circles were rendering as 8px squares). */
  const hasRadius = /(?:^|\s)rounded/.test(className);
  return (
    <div
      aria-hidden
      className={`skeleton ${hasRadius ? "" : "rounded-lg"} ${className}`}
    />
  );
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

/** Deck-shaped: mirrors the real discover layout — card in the deck area,
 *  action circles BELOW the card (matching DeckActions: 4×46px + one
 *  56px primary), never inside it. Callers wrap it in the discover
 *  section chrome so the header doesn't flash in on reveal. */
export function SkeletonDeck({ label = "Loading your deck" }: { label?: string }) {
  return (
    <SkeletonShell label={label} className="flex min-h-0 flex-col">
      <div className="relative mx-3.5 mt-1 min-h-0 flex-1">
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-paper p-[18px]">
          <Skeleton className="mb-4 h-[42%] min-h-[170px] w-full rounded-[20px]" />
          <Skeleton className="mb-2.5 h-7 w-3/4" />
          <Skeleton className="mb-5 h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-[8px]" />
            <Skeleton className="h-6 w-24 rounded-[8px]" />
            <Skeleton className="h-6 w-16 rounded-[8px]" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 px-5 pb-3 pt-3.5">
        <Skeleton className="size-[46px] rounded-full" />
        <Skeleton className="size-[46px] rounded-full" />
        <Skeleton className="size-[46px] rounded-full" />
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="size-[46px] rounded-full" />
      </div>
    </SkeletonShell>
  );
}

/** List-shaped: mirrors FavoriteRow's divided-list grammar — 58px tile,
 *  border-t rows, trailing action — NOT bordered cards (the reveal must
 *  not switch visual grammar; critic QW0 #3). */
export function SkeletonRows({
  count = 4,
  label = "Loading",
}: {
  count?: number;
  label?: string;
}) {
  return (
    <SkeletonShell label={label} className="px-5">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="grid grid-cols-[58px_1fr_auto] items-center gap-[13px] border-t border-line py-4 first:border-t-0"
        >
          <Skeleton className="size-[58px] rounded-[17px]" />
          <div className="min-w-0">
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="mb-2 h-3 w-1/2" />
            <Skeleton className="h-5 w-24 rounded-[7px]" />
          </div>
          <Skeleton className="h-9 w-[74px] rounded-[12px]" />
        </div>
      ))}
    </SkeletonShell>
  );
}

/** Detail/document-shaped: heading block then paragraph lines. `hero`
 *  adds the 76px monogram tile detail screens open with, so the reveal
 *  doesn't push content down. Callers wrap in their real Topbar. */
export function SkeletonDetail({
  label = "Loading",
  hero = false,
}: {
  label?: string;
  hero?: boolean;
}) {
  return (
    <SkeletonShell label={label} className="grid content-start gap-3 p-5">
      {hero ? <Skeleton className="mb-2 size-[76px] rounded-[21px]" /> : null}
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
  calm = false,
}: {
  symbol: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
  tone?: "rose" | "ink";
  /** Skips the spring entrance — springs mark arrivals and wins, and an
   *  error is neither (critic QW0 #11). ErrorState sets this. */
  calm?: boolean;
}) {
  return (
    <div className="grid flex-1 place-items-center p-[35px] text-center">
      <div>
        <div
          className={`${calm ? "" : "pop-in"} mx-auto mb-[18px] grid size-[68px] place-items-center rounded-[22px] text-[27px] ${
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
    <EmptyState calm symbol="!" tone="ink" title={title} body={body}>
      {children}
    </EmptyState>
  );
}

export function OfflineState({ children }: { children?: ReactNode }) {
  return (
    <EmptyState
      calm
      symbol="!"
      tone="ink"
      title="No connection"
      body="Your favorites and prepared applications are still available. New roles will refresh when you reconnect."
    >
      {children}
    </EmptyState>
  );
}
