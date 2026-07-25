"use client";

/* Applications — list view over the mock store's applications, mapped to the
   redirect-apply timeline (Prepared → Opened listing → Confirmed applied).
   Wave 1 slice 3. Empty-state copy kept verbatim from the shipped placeholder. */

import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
import { jobById, type Job } from "@/lib/mock/jobs";
import { useMunusStore, type Application } from "@/lib/mock/store";
import { ApplicationRow } from "./ApplicationRow";

function PageHeader() {
  return (
    <div className="px-5 pb-[18px] pt-2.5">
      <h1 className="m-0 text-[34px] tracking-[-0.055em]">Applications</h1>
      <p className="mt-[5px] text-xs text-muted">
        Your applications, receipts, and next actions.
      </p>
    </div>
  );
}

export default function ApplicationsPage() {
  const { hydrated, applications } = useMunusStore();

  if (!hydrated) return <LoadingState label="Loading applications" />;

  // Most recently touched first.
  const rows = [...applications]
    .reverse()
    .map((application) => {
      const job = jobById(application.jobId);
      return job ? { application, job } : null;
    })
    .filter(
      (row): row is { application: Application; job: Job } => row !== null,
    );

  if (applications.length > 0 && rows.length === 0) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <PageHeader />
        <ErrorState body="We could not load your applications right now. Your receipts are still saved — try again in a moment.">
          <Button
            variant="dark"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </ErrorState>
      </section>
    );
  }

  if (applications.length === 0) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <PageHeader />
        <EmptyState
          symbol="↗"
          title="No applications yet"
          body="Tailor a favorite, review every answer, then apply on the official listing when you are ready."
        >
          <LinkButton href="/favorites" variant="primary" className="w-full">
            Open favorites
          </LinkButton>
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="screen-in flex flex-1 flex-col">
      <PageHeader />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {rows.map(({ job, application }) => (
          <ApplicationRow key={job.id} job={job} application={application} />
        ))}
      </div>
    </section>
  );
}
