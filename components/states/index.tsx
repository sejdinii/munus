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
          className={`mx-auto mb-[18px] grid size-[68px] place-items-center rounded-[22px] text-[27px] ${
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
