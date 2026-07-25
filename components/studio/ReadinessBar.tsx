/* "Application readiness" row — prototype .readiness / .readiness-row /
   .readiness-bar. Pure display: caller owns the readiness count. */

export function ReadinessBar({
  ready,
  total = 3,
}: {
  ready: number;
  total?: number;
}) {
  const pct = total > 0 ? Math.min(100, Math.max(0, (ready / total) * 100)) : 0;

  return (
    <div className="mt-4">
      <div className="mb-[7px] flex justify-between text-[11px]">
        <span>Application readiness</span>
        <strong className="text-green">
          {ready} of {total} ready
        </strong>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[6px] bg-quiet">
        <span
          className="block h-full rounded-[inherit] bg-green transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
