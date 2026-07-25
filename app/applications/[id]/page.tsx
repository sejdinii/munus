"use client";

/* Application receipt — outside the (tabs) group by design: it has its own
   topbar/back affordance and no tabbar (matches prototype's detail screens).
   Timeline is the three D2 stages ONLY (FEATURES.md D2): Prepared → Opened
   listing → Confirmed applied. No "Submitted"/"Viewed by a human" direct-
   submit copy from the prototype — MVP never auto-submits (CONTRACTS §3.3). */

import { useParams, useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
import { Topbar } from "@/components/ui/Topbar";
import { useToast } from "@/components/ui/Toast";
import { jobById } from "@/lib/mock/jobs";
import { useMunusStore, type ApplicationStatus } from "@/lib/mock/store";

/* Relative-or-clock stamp for timeline steps (Wave 4 slice A): same day
   shows a clock time, otherwise a short relative/absolute fallback — never
   a bare epoch, never a fabricated "just now" for a step that has not
   actually happened yet (that's what the `pending` branch below is for). */
function formatStamp(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const days = Math.floor((now.getTime() - ms) / 86_400_000);
  if (days <= 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const STEPS: Array<{
  status: ApplicationStatus;
  title: string;
  pending: string;
  done: (stamp: string) => string;
}> = [
  {
    status: "prepared",
    title: "Prepared",
    /* Future voice: a pending step must never narrate an event that has not
       happened (critic W4 #4). */
    pending: "Tailor your documents in the studio when you're ready.",
    done: () => "Documents tailored and reviewed.",
  },
  {
    status: "opened",
    title: "Opened listing",
    pending: "Not yet — open the official listing when you're ready.",
    done: (stamp) => `Opened the listing · ${stamp}`,
  },
  {
    status: "confirmed",
    title: "Confirmed applied",
    pending: "Confirm here once you've submitted on the employer's site.",
    done: (stamp) => `Confirmed applied · ${stamp}`,
  },
];

export default function ApplicationReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, applications, studio, setArchived, confirmApplied } =
    useMunusStore();
  const { showToast } = useToast();

  if (!hydrated) return <LoadingState label="Loading receipt" />;

  const application = applications.find((a) => a.jobId === id);
  const job = jobById(id);

  if (!application || !job) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <Topbar title="Application receipt" backHref="/applications" />
        <ErrorState
          title="Application not found"
          body="We could not find a receipt for this application. It may have been removed."
        >
          <LinkButton href="/applications" variant="dark" className="w-full">
            Back to applications
          </LinkButton>
        </ErrorState>
      </section>
    );
  }

  const stage = STEPS.findIndex((s) => s.status === application.status);
  const confirmedLabel = application.confirmedAt
    ? new Date(application.confirmedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <section className="screen-in flex flex-1 flex-col">
      <Topbar title="Application receipt" backHref="/applications" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10">
        <div className="mb-[23px] mt-[3px]">
          <div
            className="grid size-[76px] place-items-center rounded-[21px] text-[31px] font-[850] tracking-[-0.06em]"
            style={{ background: job.color }}
            aria-hidden
          >
            {job.monogram}
          </div>
          <h2 className="mb-[5px] mt-[18px] text-[34px] leading-[1.02] tracking-[-0.055em]">
            {job.title}
          </h2>
          <p className="m-0 text-[13px] text-muted">
            {job.company} ·{" "}
            {confirmedLabel ? `confirmed ${confirmedLabel}` : job.location}
          </p>
        </div>

        <section className="border-t border-line py-5">
          <h3 className="m-0 mb-[13px] text-[13px]">Status</h3>
          <div>
            {STEPS.map((step, i) => {
              /* A confirmed application is COMPLETE: its final step must read as done,
             not as the current in-progress step (critic W4 #8). */
          const terminal = application.status === "confirmed";
          const cls =
            i < stage || (terminal && i === stage)
              ? "done"
              : i === stage
                ? "now"
                : "pending";
              return (
                <div
                  key={step.status}
                  className="relative grid grid-cols-[24px_1fr] gap-[11px] pb-[18px] last:pb-0"
                >
                  {i < STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${
                        cls === "done" ? "bg-[#cdebdc]" : "bg-quiet"
                      }`}
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className={`z-[1] grid size-6 place-items-center rounded-full text-[10px] font-extrabold ${
                      cls === "done"
                        ? "bg-[#eaf7f0] text-green"
                        : cls === "now"
                          ? "bg-rose text-white"
                          : "bg-quiet text-muted"
                    }`}
                  >
                    {cls === "done" ? "✓" : cls === "now" ? "●" : ""}
                  </span>
                  <div>
                    <h4
                      className={`m-0 mb-0.5 text-xs ${cls === "pending" ? "text-muted" : ""}`}
                    >
                      {step.title}
                    </h4>
                    <p className="m-0 text-[10px] leading-[1.4] text-muted">
                      {(() => {
                        const stamp =
                          step.status === "opened"
                            ? application.openedAt
                            : step.status === "confirmed"
                              ? application.confirmedAt
                              : undefined;
                        return stamp
                          ? step.done(formatStamp(stamp))
                          : step.pending;
                      })()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t border-line py-5">
          <h3 className="m-0 mb-[13px] text-[13px]">Documents</h3>
          {/* Only claim documents that exist: the studio hasn't shipped, so
              most applications have none — saying "2 pages · verified" here
              would be the exact fiction D2/CONTRACTS §3.1 bans (critic #2). */}
          {studio[job.id]?.generated ? (
            <>
              <div className="grid grid-cols-[36px_1fr_auto] items-center gap-[9px]">
                <span
                  aria-hidden
                  className="grid h-[42px] w-9 place-items-center rounded-lg bg-quiet text-[9px] font-extrabold"
                >
                  PDF
                </span>
                <span>
                  <strong className="block text-[11px]">
                    CV · tailored for {job.company}
                  </strong>
                  <span className="text-[9px] text-muted">
                    {studio[job.id]?.accepted.length ?? 0} accepted changes ·
                    evidence-checked
                  </span>
                </span>
                <span aria-hidden>✓</span>
              </div>
                  <div className="mt-[9px] grid grid-cols-[36px_1fr_auto] items-center gap-[9px]">
                <span
                  aria-hidden
                  className="grid h-[42px] w-9 place-items-center rounded-lg bg-quiet text-[9px] font-extrabold"
                >
                  PDF
                </span>
                <span>
                  <strong className="block text-[11px]">Cover letter</strong>
                  <span className="text-[9px] text-muted">
                    fixed frame · approved paragraphs only
                  </span>
                </span>
                <span aria-hidden>✓</span>
              </div>
          <div className="mt-3 grid grid-cols-[22px_1fr] gap-[9px] rounded-[13px] bg-[#eef8f3] p-3 text-[10px] leading-[1.4] text-[#22563d]">
                <span aria-hidden>✓</span>
                <span>
                  <strong>Receipt, not a promise.</strong> Munus stores the
                  exact documents you approved, permanently.
                </span>
              </div>
            </>
          ) : (
            <p className="m-0 text-[11px] leading-[1.45] text-muted">
              No tailored documents yet. Tailor and approve them in the
              studio — the exact files you approve are stored here
              permanently.
            </p>
          )}
        </section>

        <section className="border-t border-line py-5">
          <h3 className="m-0 mb-[13px] text-[13px]">Actions</h3>
          <div className="grid gap-2.5">
            {application.status === "prepared" ? (
              <LinkButton
                href={`/preflight/${job.id}`}
                variant="primary"
                className="w-full"
              >
                Continue to review
              </LinkButton>
            ) : null}
            {/* An opened application MUST be confirmable from here: the user
                may return via Applications rather than the preflight tab
                (critic W4 #2 — the loop dead-ended). */}
            {application.status === "opened" ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  confirmApplied(job.id);
                  showToast("Receipt filed — congratulations");
                }}
              >
                Yes, I applied — file my receipt
              </Button>
            ) : null}
            <div className="grid gap-1.5">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[15px] border border-line bg-paper px-[18px] font-[710] transition-transform hover:-translate-y-px"
              >
                Open sample listing
              </a>
              <p className="m-0 text-center text-[10px] text-muted">
                Sample URL until live feeds arrive
              </p>
            </div>
            <Button
              variant="plain"
              className="w-full text-red"
              onClick={() => {
                setArchived(job.id, true);
                showToast(`Archived “${job.title}”`, {
                  label: "Undo",
                  onPress: () => setArchived(job.id, false),
                });
                router.push("/applications");
              }}
            >
              Archive
            </Button>
          </div>
        </section>
      </div>
    </section>
  );
}
