/* Single applications row. D2-compliant statuses ONLY (FEATURES.md D2):
   prepared / opened / confirmed — no "Submitting"/"Viewed" direct-submit
   fictions from the prototype. */

import Link from "next/link";
import { ReadyChip } from "@/components/ui/Chip";
import type { Job } from "@/lib/mock/jobs";
import type { Application } from "@/lib/mock/store";

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
}: {
  job: Job;
  application: Application;
}) {
  const status = STATUS_COPY[application.status];
  const confirmed = application.status === "confirmed";

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
        <p className="m-0 text-[10px] text-muted">{job.company} · tap for receipt</p>
      </span>
      <ReadyChip tone={status.tone}>{status.label}</ReadyChip>
    </Link>
  );
}
