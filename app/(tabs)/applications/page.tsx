"use client";

/* Applications — list view over the mock store's applications, mapped to the
   redirect-apply timeline (Prepared → Opened listing → Confirmed applied).
   Wave 4 slice A: archived applications are hidden from the default list —
   the receipt is never deleted, just tucked behind a quiet disclosure row
   (setArchived(id, false) unarchives from there). */

import { useState } from "react";
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
  const { hydrated, applications, setArchived, deckCache } = useMunusStore();
  const [showArchived, setShowArchived] = useState(false);

  if (!hydrated) return <LoadingState label="Loading applications" />;

  // Most recently touched first.
  /* Most recently touched first, by the stamp that actually exists —
     insertion order left confirmations buried (critic W4 #9). */
  const touchedAt = (a: Application) => a.confirmedAt ?? a.openedAt ?? 0;
  const rows = [...applications]
    .sort((x, y) => touchedAt(y) - touchedAt(x))
    .map((application) => {
      /* Real jobs live in the deck cache (their ids aren't in the mock
         catalog) — same lookup as the studio/preflight (W4-live). */
      const job = deckCache[application.jobId] ?? jobById(application.jobId);
      return job ? { application, job } : null;
    })
    .filter(
      (row): row is { application: Application; job: Job } => row !== null,
    );

  const activeRows = rows.filter((row) => !row.application.archived);
  const archivedRows = rows.filter((row) => row.application.archived);

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
        {activeRows.length > 0 ? (
          activeRows.map(({ job, application }) => (
            <ApplicationRow key={job.id} job={job} application={application} />
          ))
        ) : (
          // Archived-only edge: every application is tucked behind the
          // toggle below, so the default list reads as empty here.
          <EmptyState
            symbol="↗"
            title="No active applications"
            body="Everything you have applied to is archived. Unarchive one below, or tailor a new favorite to apply."
          >
            <LinkButton href="/favorites" variant="primary" className="w-full">
              Open favorites
            </LinkButton>
          </EmptyState>
        )}

        {archivedRows.length > 0 ? (
          <div className="mt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              aria-expanded={showArchived}
              className="flex w-full items-center justify-between py-3.5 text-[11px] font-[650] text-muted"
            >
              <span>Archived ({archivedRows.length})</span>
              <span aria-hidden>{showArchived ? "⌃" : "⌄"}</span>
            </button>
            {showArchived
              ? archivedRows.map(({ job, application }) => (
                  <ApplicationRow
                    key={job.id}
                    job={job}
                    application={application}
                    onUnarchive={() => setArchived(job.id, false)}
                  />
                ))
              : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
