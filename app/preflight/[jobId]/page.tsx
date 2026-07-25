"use client";

/* Preflight review → redirect apply → return-confirm — ORCHESTRATOR-OWNED
   (the apply loop's state machine, CONTRACTS §3.3 / D2). Prototype
   renderPreflight() adapted: NO employer-questions block (D3), no
   direct-submit path — the primary action opens the official listing and
   the return-confirm ("Did you apply?", Handshake pattern) files the
   receipt. Sample listing URLs are labelled as samples (mock phase). */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
import { Topbar } from "@/components/ui/Topbar";
import { useToast } from "@/components/ui/Toast";
import { jobById } from "@/lib/mock/jobs";
import { useMunusStore } from "@/lib/mock/store";
import { ConfirmReturnDialog } from "./ConfirmReturnDialog";

export default function PreflightPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const store = useMunusStore();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const promptedThisReturn = useRef(false);

  const job = jobById(jobId);
  const st = store.studio[jobId];
  const application = store.applications.find((a) => a.jobId === jobId);
  const generated = st?.generated ?? false;
  const acceptedCount = st?.accepted.length ?? 0;

  /* Docs reviewed and ready = a `prepared` application exists (D2 stage 1).
     Created once, on arrival with generated docs. */
  useEffect(() => {
    if (store.hydrated && job && generated && !application) {
      store.setApplication(job.id, "prepared");
    }
  }, [store, job, generated, application]);

  /* Return-confirm: when the tab regains focus while the listing is opened,
     ask once per return (Handshake pattern). Also prompts on direct
     navigation back to this page in the opened state. */
  const maybePrompt = useCallback(() => {
    if (application?.status === "opened" && !promptedThisReturn.current) {
      promptedThisReturn.current = true;
      setConfirmOpen(true);
    }
  }, [application?.status]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") maybePrompt();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [maybePrompt]);

  useEffect(() => {
    if (store.hydrated) maybePrompt();
  }, [store.hydrated, maybePrompt]);

  if (!store.hydrated) return <LoadingState label="Preparing your review" />;

  if (!job) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <Topbar title="Review" backHref="/favorites" />
        <ErrorState
          title="Role not found"
          body="This review link points at a role that no longer exists."
        >
          <LinkButton href="/favorites" variant="dark" className="w-full">
            Back to favorites
          </LinkButton>
        </ErrorState>
      </section>
    );
  }

  if (!generated) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <Topbar title="Review" backHref={`/studio/${job.id}`} />
        <ErrorState
          title="Nothing to review yet"
          body="Tailor your documents in the studio first — the review shows exactly what you approved."
        >
          <LinkButton
            href={`/studio/${job.id}`}
            variant="primary"
            className="w-full"
          >
            Open the studio
          </LinkButton>
        </ErrorState>
      </section>
    );
  }

  const openListing = () => {
    store.markOpened(job.id);
    promptedThisReturn.current = false;
    window.open(job.applyUrl, "_blank", "noopener");
    showToast("Listing opened — come back when you’re done");
  };

  const confirmApplied = () => {
    store.confirmApplied(job.id);
    setConfirmOpen(false);
    showToast("Receipt filed — congratulations");
    router.push(`/applications/${job.id}`);
  };

  const confirmed = application?.status === "confirmed";

  return (
    <section className="screen-in relative flex flex-1 flex-col">
      <Topbar title="Review" backHref={`/studio/${job.id}`} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[120px]">
        <p className="m-0 mb-1.5 text-[11px] font-[760] uppercase tracking-[0.1em] text-rose-ink">
          Final check
        </p>
        <h2 className="m-0 mb-1.5 text-[33px] tracking-[-0.055em]">
          Ready to apply?
        </h2>
        <p className="mb-5 text-xs text-muted">
          Nothing is sent by Munus — you apply on the employer’s official
          page. This is exactly what you take with you.
        </p>

        <section className="border-t border-line py-[17px]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="m-0 text-[13px]">Contact details</h3>
          </div>
          <p className="m-0 text-[11px] leading-[1.4] text-muted">
            Contact details attach when accounts arrive with real sign-in —
            until then you enter them on the employer’s form yourself.
          </p>
        </section>

        <section className="border-t border-line py-[17px]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="m-0 text-[13px]">Documents</h3>
            <LinkButton
              href={`/studio/${job.id}`}
              variant="plain"
              small
              className="!min-h-0 !p-0 text-[11px] font-[750] !text-rose-ink"
            >
              Review changes
            </LinkButton>
          </div>
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
                {acceptedCount} accepted change{acceptedCount === 1 ? "" : "s"} ·
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
        </section>

        <div className="grid grid-cols-[22px_1fr] gap-[9px] rounded-[13px] bg-[#eef8f3] p-3 text-[10px] leading-[1.4] text-[#22563d]">
          <span aria-hidden>✓</span>
          <span>
            <strong>Facts checked.</strong> Every AI-edited claim maps to your
            evidence store — anything unverifiable was dropped before you saw
            it.
          </span>
        </div>

        {application?.status === "opened" ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-4 w-full rounded-[13px] border border-amber/40 bg-[#fff7ec] p-3 text-left text-[11px] leading-[1.4] text-[#70471a]"
          >
            <strong>You opened the listing.</strong> Did you apply? Tap to
            confirm and file your receipt.
          </button>
        ) : null}
      </div>

      <footer className="absolute inset-x-0 bottom-0 border-t border-line bg-paper/95 px-[18px] pb-5 pt-[11px] backdrop-blur-[18px]">
        <p className="m-0 mb-2 text-center text-[9px] text-muted">
          {confirmed
            ? "Receipt filed — this application is confirmed."
            : "Opens the official listing in a new tab · sample URL until live feeds arrive"}
        </p>
        {confirmed ? (
          <LinkButton
            href={`/applications/${job.id}`}
            variant="dark"
            className="w-full"
          >
            View receipt
          </LinkButton>
        ) : (
          <Button variant="primary" className="w-full" onClick={openListing}>
            Open official application
          </Button>
        )}
      </footer>

      {confirmOpen ? (
        <ConfirmReturnDialog
          company={job.company}
          onConfirm={confirmApplied}
          onNotYet={() => setConfirmOpen(false)}
        />
      ) : null}
    </section>
  );
}
