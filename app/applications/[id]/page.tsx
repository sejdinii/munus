"use client";

/* Application receipt — outside the (tabs) group by design: it has its own
   topbar/back affordance and no tabbar (matches prototype's detail screens).
   Timeline is the three D2 stages ONLY (FEATURES.md D2): Prepared → Opened
   listing → Confirmed applied. No "Submitted"/"Viewed by a human" direct-
   submit copy from the prototype — MVP never auto-submits (CONTRACTS §3.3). */

import Link from "next/link";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/Button";
import { Topbar } from "@/components/ui/Topbar";
import { useToast } from "@/components/ui/Toast";
import { jobById } from "@/lib/mock/jobs";
import { useMunusStore, type ApplicationStatus } from "@/lib/mock/store";

const STEPS: Array<{ status: ApplicationStatus; title: string; body: string }> = [
  {
    status: "prepared",
    title: "Prepared",
    body: "Documents tailored and reviewed.",
  },
  {
    status: "opened",
    title: "Opened listing",
    body: "You opened the official application on the employer’s site.",
  },
  {
    status: "confirmed",
    title: "Confirmed applied",
    body: "You confirmed you submitted it there.",
  },
];

export default function ApplicationReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { hydrated, applications } = useMunusStore();
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
          <Link href="/applications">
            <Button variant="dark" className="w-full">
              Back to applications
            </Button>
          </Link>
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
              const cls = i < stage ? "done" : i === stage ? "now" : "pending";
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
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t border-line py-5">
          <h3 className="m-0 mb-[13px] text-[13px]">Documents</h3>
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
              <span className="text-[9px] text-muted">2 pages · verified</span>
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
              <span className="text-[9px] text-muted">1 page · verified</span>
            </span>
            <span aria-hidden>✓</span>
          </div>
          <div className="mt-3 grid grid-cols-[22px_1fr] gap-[9px] rounded-[13px] bg-[#eef8f3] p-3 text-[10px] leading-[1.4] text-[#22563d]">
            <span aria-hidden>✓</span>
            <span>
              <strong>Receipt, not a promise.</strong> Munus stores the exact
              documents you approved, permanently.
            </span>
          </div>
        </section>

        <section className="border-t border-line py-5">
          <h3 className="m-0 mb-[13px] text-[13px]">Actions</h3>
          <div className="grid gap-2.5">
            <Button
              className="w-full"
              onClick={() => showToast("Opening the original listing")}
            >
              View original listing
            </Button>
            <Button
              variant="plain"
              className="w-full text-red"
              disabled
              title="Archive lands with the real API (W4)"
            >
              Archive application
            </Button>
          </div>
        </section>
      </div>
    </section>
  );
}
