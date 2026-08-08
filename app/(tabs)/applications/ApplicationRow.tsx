/* Single applications row. D2-compliant statuses ONLY (FEATURES.md D2):
   prepared / opened / confirmed — no "Submitting"/"Viewed" direct-submit
   fictions from the prototype. */

import Link from "next/link";
import { ReadyChip } from "@/components/ui/Chip";
import type { Job } from "@/lib/mock/jobs";
import type { Application } from "@/lib/mock/store";

/* Real stamps only — the row used three identical filler strings while
   openedAt/confirmedAt sat unused in state (critic W4 #9). */
function stamp(application: Application): string | null {
  const at = application.confirmedAt ?? application.openedAt;
  if (!at) return null;
  const d = new Date(at);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const today = new Date().toDateString() === d.toDateString();
  const when = today
    ? `today at ${time}`
    : d.toLocaleDateString([], { day: "numeric", month: "short" });
  return application.confirmedAt ? `applied ${when}` : `opened ${when}`;
}

const STATUS_COPY: Record<
  Application["status"],
  { label: string; tone: "default" | "top" | "ok" }
> = {
  prepared: { label: "Prepared", tone: "default" },
  opened: { label: "Opened listing", tone: "top" },
  confirmed: { label: "Applied ✓", tone: "ok" },
};

export function ApplicationRow({
  job,
  application,
  onUnarchive,
}: {
  job: Job;
  application: Application;
  /** Present only for rows rendered inside the "Archived" disclosure — swaps
      the status chip for an Unarchive affordance (setArchived(id,false)). */
  onUnarchive?: () => void;
}) {
  const status = STATUS_COPY[application.status];
  const confirmed = application.status === "confirmed";

  if (onUnarchive) {
    return (
      <div className="grid grid-cols-[42px_1fr_auto] items-center gap-[11px] border-t border-line py-4 opacity-60 first:border-t-0">
        <Link
          href={`/applications/${job.id}`}
          className="col-span-2 grid grid-cols-[42px_1fr] items-center gap-[11px]"
        >
          <span
            aria-hidden
            className="grid size-[42px] place-items-center rounded-[14px] bg-quiet text-[15px] font-extrabold text-muted"
          >
            •
          </span>
          <span>
            <h3 className="m-0 mb-[3px] text-[13px] text-muted">{job.title}</h3>
            <p className="m-0 text-[10px] text-muted">{job.company} · archived</p>
          </span>
        </Link>
        <button
          type="button"
          onClick={onUnarchive}
          className="rounded-[7px] bg-quiet px-[9px] py-1.5 text-[10px] font-[700] text-ink hover:bg-line"
        >
          Unarchive
        </button>
      </div>
    );
  }

  return (
    <Link
      href={`/applications/${job.id}`}
      className="grid grid-cols-[42px_1fr_auto] items-center gap-[11px] border-t border-line py-4 first:border-t-0"
    >
      <span
        aria-hidden
        className={`grid size-[42px] place-items-center rounded-[14px] text-[15px] font-extrabold ${
          confirmed ? "bg-[#eaf7f0] text-green" : "bg-quiet text-muted"
        }`}
      >
        {confirmed ? "✓" : "•"}
      </span>
      <span>
        <h3 className="m-0 mb-[3px] text-[13px]">{job.title}</h3>
        <p className="m-0 text-[10px] text-muted">
          {[job.company, stamp(application), "tap for receipt"]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </span>
      <ReadyChip tone={status.tone}>{status.label}</ReadyChip>
    </Link>
  );
}
