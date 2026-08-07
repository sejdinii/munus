"use client";

/* Preflight review → redirect apply → return-confirm — ORCHESTRATOR-OWNED
   (the apply loop's state machine, CONTRACTS §3.3 / D2). Prototype
   renderPreflight() adapted: NO employer-questions block (D3), no
   direct-submit path — the primary action opens the official listing and
   the return-confirm ("Did you apply?", Handshake pattern) files the
   receipt. Sample listing URLs are labelled as samples (mock phase). */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
import { Topbar } from "@/components/ui/Topbar";
import { useToast } from "@/components/ui/Toast";
import { jobById } from "@/lib/mock/jobs";
import { useMunusStore } from "@/lib/mock/store";
import { useSession } from "@/lib/supabase/session";
import { isCheckableApplyUrl, type ListingCheck } from "@/lib/apply/check";
import { ConfirmReturnDialog } from "./ConfirmReturnDialog";

export default function PreflightPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const store = useMunusStore();
  const { showToast } = useToast();
  const { status } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  /* W4-live: "still open" check — server-side HEAD on the apply URL. */
  const [listingCheck, setListingCheck] = useState<ListingCheck | null>(null);
  const [checkingListing, setCheckingListing] = useState(false);
  /* Armed when the user actually leaves for the listing; only a real
     return (visibility/focus) may raise the dialog. The old
     status-change effect fired it on DEPARTURE and consumed the latch,
     so the real return prompted nothing (critic W4 #1). */
  const returnPending = useRef(false);

  const job = store.deckCache[jobId] ?? jobById(jobId);
  const st = store.studio[jobId];
  const application = store.applications.find((a) => a.jobId === jobId);
  const generated = st?.generated ?? false;
  const acceptedCount = st?.accepted.length ?? 0;

  /* W4-live: check the listing is still open when the preflight loads
     (real apply URLs only; sample links are never claimed checked). */
  useEffect(() => {
    if (status !== "signedIn" || !job || !isCheckableApplyUrl(job.applyUrl)) return;
    let cancelled = false;
    setCheckingListing(true);
    fetch("/api/apply/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: job.applyUrl }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("status" + r.status))))
      .then((payload: ListingCheck) => {
        if (!cancelled) setListingCheck(payload);
      })
      .catch(() => {
        if (!cancelled) {
          setListingCheck({ reachable: false, status: null, checkedAt: new Date().toISOString(), checkable: true });
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingListing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, job]);

  /* The `prepared` record is created when the user actually commits by
     opening the listing — merely visiting this screen must not write a
     permanent Applications row (critic W4 #10). */

  /* Return-confirm: when the tab regains focus while the listing is opened,
     ask once per return (Handshake pattern). Also prompts on direct
     navigation back to this page in the opened state. */
  /* Detecting "the user came back" is genuinely unreliable: opening a new
     tab does not always hide or blur the opener (desktop especially), so
     visibilitychange/focus alone can miss the return entirely. Any of three
     signals therefore counts as a return, and the latch guarantees the
     prompt appears exactly once per departure:
       - visibilitychange → mobile tab switching (the common case)
       - focus            → desktop window/tab refocus
       - pointerdown/keydown on our page → they are demonstrably back
     If all three somehow miss, the inline banner below is the fallback. */
  useEffect(() => {
    function onReturn() {
      if (document.visibilityState !== "visible") return;
      if (!returnPending.current) return;
      returnPending.current = false;
      setConfirmOpen(true);
    }
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    document.addEventListener("pointerdown", onReturn);
    document.addEventListener("keydown", onReturn);
    return () => {
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("pointerdown", onReturn);
      document.removeEventListener("keydown", onReturn);
    };
  }, []);

  if (!store.hydrated) return <LoadingState label="Preparing your review" />;

  if (store.storageError && store.applications.length === 0) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <Topbar title="Review" backHref="/favorites" />
        <ErrorState body="We could not load your saved progress — it may be corrupted. Re-open the studio to rebuild your documents before applying.">
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
    /* NOT window.open(url, "_blank", "noopener"): that always returns null,
       which is indistinguishable from a blocked popup. Open normally, then
       sever `opener` ourselves for the same security guarantee. */
    const opened = window.open(job.applyUrl, "_blank");
    if (opened) opened.opener = null;
    if (!opened) {
      /* Popup blocked: nothing was opened, so claiming "opened" would be a
         lie and would arm a confirm prompt for a page never seen
         (critic W4 #6). */
      setPopupBlocked(true);
      showToast("Your browser blocked the new tab — use the link below");
      return;
    }
    store.openApplication(job.id);
    returnPending.current = true;
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
    <section className="screen-in relative flex min-h-0 flex-1 flex-col">
      <Topbar title="Review" backHref={`/studio/${job.id}`} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
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

        {/* W4-live: honest still-open signal; never blocks, never claims
            unverified links are fine. */}
        {isCheckableApplyUrl(job.applyUrl) ? (
          <p className="mb-4 flex items-center gap-2 text-[11px]">
            {checkingListing ? (
              <>
                <span className="size-2 animate-pulse rounded-full bg-quiet-ink" aria-hidden />
                <span className="text-muted">Checking the listing is still open…</span>
              </>
            ) : listingCheck?.reachable ? (
              <>
                <span className="grid size-4 place-items-center rounded-full bg-green/20 text-[9px] font-extrabold text-green" aria-hidden>
                  ✓
                </span>
                <span className="text-green">Still open — checked just now</span>
              </>
            ) : (
              <>
                <span className="grid size-4 place-items-center rounded-full bg-amber-soft text-[9px] font-extrabold" aria-hidden>
                  !
                </span>
                <span className="text-amber-ink">
                  Couldn’t verify — the listing may have closed. You decide.
                </span>
              </>
            )}
          </p>
        ) : null}

        <section className="border-t border-line py-[17px]">
          <h3 className="m-0 mb-3 text-[13px]">What happens next</h3>
          <ol className="m-0 grid list-none gap-2.5 p-0">
            {[
              "We open the employer’s official listing in a new tab.",
              "You apply there — Munus never submits on your behalf.",
              "When you come back, tell us if you applied and we file your receipt.",
            ].map((step, i) => (
              <li
                key={step}
                className="grid grid-cols-[22px_1fr] gap-[9px] text-[11px] leading-[1.4]"
              >
                <span className="grid size-[22px] place-items-center rounded-full bg-rose-soft text-[10px] font-extrabold text-rose-ink">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-line py-[17px]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="m-0 text-[13px]">Documents</h3>
            <LinkButton
              href={`/studio/${job.id}`}
              variant="plain"
              small
              className="!min-h-11 items-center !p-0 text-[11px] font-[750] !text-rose-ink"
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

        {popupBlocked ? (
          <div className="mt-4 rounded-[13px] border border-amber/40 bg-[#fff7ec] p-3 text-[11px] leading-[1.4] text-[#70471a]">
            <strong>Your browser blocked the new tab.</strong> Open the
            listing with this link, then come back and confirm below.
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                store.openApplication(job.id);
                returnPending.current = true;
              }}
              className="mt-2 block break-all font-[750] underline"
            >
              {job.applyUrl}
            </a>
          </div>
        ) : null}

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

      <footer className="sticky bottom-0 border-t border-line bg-paper/95 px-[18px] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[11px] backdrop-blur-[18px]">
        <p className="m-0 mb-2 text-center text-[9px] text-muted">
          {confirmed
            ? "Receipt filed — this application is confirmed."
            : "Opens the employer’s official application page in a new tab"}
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
