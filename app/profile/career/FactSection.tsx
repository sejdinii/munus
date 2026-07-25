import { MetaChip } from "@/components/ui/Chip";
import type { Fact } from "@/lib/studio/types";

/* One evidence-store section (Roles / Outcomes / Skills / Education).
   border-t section styling matches the prototype-consistent detail sections
   used on job detail and the application receipt (app/jobs/[id]/page.tsx,
   app/applications/[id]/page.tsx: `border-t border-line py-5`). Each fact
   renders as its content plus a quiet MetaChip source citation — the same
   "reuse the quiet chip pattern" the spec calls for. */
export function FactSection({
  label,
  facts,
}: {
  label: string;
  facts: Fact[];
}) {
  return (
    <section className="border-t border-line py-5 first:border-t-0 first:pt-1">
      <h3 className="m-0 mb-3.5 text-[13px]">
        {label} · {facts.length}
      </h3>
      {facts.length === 0 ? (
        <p className="m-0 text-[11px] leading-[1.4] text-muted">
          None on file yet.
        </p>
      ) : (
        <div className="grid gap-3.5">
          {facts.map((fact) => (
            <div key={fact.id}>
              <p className="m-0 text-[13px] leading-[1.5] text-[#4f494c]">
                {fact.content}
              </p>
              <div className="mt-1.5">
                <MetaChip>{fact.sourceSpan}</MetaChip>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
