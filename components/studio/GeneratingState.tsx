import type { ReactNode } from "react";

/* Centered spinner block shown while tailoring runs — prototype .generating
   / .spinner. Reuses the "spin" keyframe already defined in app/globals.css
   (same one components/states/index.tsx's LoadingState relies on) — no new
   global CSS needed. */

export function GeneratingState({
  title,
  body,
}: {
  title: string;
  body: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-[350px] place-items-center text-center"
    >
      <div>
        <div className="mx-auto mb-3.5 size-[30px] animate-[spin_0.8s_linear_infinite] rounded-full border-[3px] border-quiet border-t-rose" />
        <strong className="text-sm">{title}</strong>
        <p className="text-[11px] leading-[1.45] text-muted">{body}</p>
      </div>
    </div>
  );
}
