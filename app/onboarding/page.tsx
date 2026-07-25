"use client";

/* Onboarding — 6-question flow, prototype screen 02 (CONTRACTS §4 binding
   visual spec: .onboarding, .onboard-head, .progress, .choices, .choice,
   .field-label, .text-field, .upload-box, .onboard-footer, .privacy).
   Answers persist through lib/mock/store's setOnboarding as the user
   progresses (W2+ this becomes POST /api/profile). */

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { BackIcon, UploadIcon } from "@/components/ui/icons";
import { useMunusStore, type OnboardingAnswers } from "@/lib/mock/store";
import { onboardingSteps, DEFAULT_SALARY_FLOOR } from "./steps";

const STEP_STORAGE_KEY = "munus-onboarding-step-v1";
const MAX_CV_BYTES = 8 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function readStoredStep(max: number): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STEP_STORAGE_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed >= 0 && parsed < max ? parsed : 0;
  } catch {
    return 0;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function OnboardingPage() {
  const router = useRouter();
  const { hydrated, onboarding, setOnboarding } = useMunusStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [stepRestored, setStepRestored] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Resume mid-flow on refresh (own localStorage key — the step position
  // isn't part of the shared OnboardingAnswers contract). A completed
  // profile always re-enters at step 1 in the "update" variant instead of
  // resuming wherever a previous completed pass left off.
  useEffect(() => {
    if (!hydrated || stepRestored) return;
    setStepIndex(
      onboarding.completed ? 0 : readStoredStep(onboardingSteps.length),
    );
    setStepRestored(true);
  }, [hydrated, stepRestored, onboarding.completed]);

  useEffect(() => {
    if (!stepRestored) return;
    try {
      window.localStorage.setItem(STEP_STORAGE_KEY, String(stepIndex));
    } catch {
      /* storage unavailable: step position stays in memory only */
    }
  }, [stepIndex, stepRestored]);

  const step = onboardingSteps[stepIndex];

  // The salary field arrives prefilled per the prototype; persist that
  // default the first time this step is reached so it is a real answer,
  // not just a placeholder.
  useEffect(() => {
    if (step?.kind === "field" && onboarding.salaryFloor === undefined) {
      setOnboarding({ salaryFloor: step.defaultValue });
    }
  }, [step, onboarding.salaryFloor, setOnboarding]);

  useEffect(() => {
    setUploadError(null);
  }, [stepIndex]);

  if (!hydrated || !stepRestored || !step) {
    return <LoadingState label="Preparing your questions" />;
  }

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === onboardingSteps.length - 1;
  const showUpdateVariant = isFirst && onboarding.completed === true;
  const uploaded = Boolean(cvFile) || onboarding.cvUploaded === true;

  const canContinue =
    step.kind === "choice"
      ? Boolean(onboarding[step.key])
      : step.kind === "field"
        ? true
        : Boolean(cvFile) || onboarding.cvUploaded !== undefined;

  function goBack() {
    if (isFirst) {
      router.push("/");
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    if (isLast) {
      setOnboarding({ completed: true });
      try {
        window.localStorage.removeItem(STEP_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      router.push("/onboarding/ready");
      return;
    }
    setStepIndex((i) => Math.min(onboardingSteps.length - 1, i + 1));
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isAcceptedFile(file)) {
      setUploadError("Please choose a PDF or DOCX file.");
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setUploadError("That file is larger than 8 MB — try a smaller export.");
      return;
    }
    setUploadError(null);
    setCvFile(file);
    setOnboarding({ cvUploaded: true });
  }

  function skipUpload() {
    setUploadError(null);
    setCvFile(null);
    setOnboarding({ cvUploaded: false });
    goNext();
  }

  return (
    <section className="screen-in flex flex-1 flex-col bg-paper px-6 pb-7 pt-2">
      <div className="-mx-2 grid grid-cols-[42px_1fr_42px] items-center">
        <IconButton label="Previous question" onClick={goBack}>
          <BackIcon />
        </IconButton>
        <div className="h-[3px] overflow-hidden rounded-full bg-quiet">
          <span
            className="block h-full rounded-full bg-rose transition-[width] duration-200 ease-out"
            style={{
              width: `${((stepIndex + 1) / onboardingSteps.length) * 100}%`,
            }}
          />
        </div>
        <span aria-hidden className="size-[42px]" />
      </div>

      <div className="flex-1 pt-[46px]">
        <p className="m-0 mb-2 text-[11px] font-[760] uppercase tracking-[0.1em] text-rose-ink">
          {showUpdateVariant
            ? "Update your answers"
            : `Question ${stepIndex + 1} of ${onboardingSteps.length}`}
        </p>
        <h1 className="m-0 text-[35px] leading-[1.04] tracking-[-0.05em]">
          {step.title}
        </h1>
        <p className="mb-7 mt-3 text-sm leading-[1.45] text-muted">
          {step.help}
        </p>

        {step.kind === "choice" ? (
          <div className="grid gap-2.5">
            {step.options.map((option) => {
              const selected = onboarding[step.key] === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setOnboarding({
                      [step.key]: option,
                    } as Partial<OnboardingAnswers>)
                  }
                  className={`flex min-h-[55px] items-center justify-between gap-3 rounded-[14px] border px-4 text-left font-[620] ${
                    selected
                      ? "border-rose bg-rose-soft text-rose-ink"
                      : "border-line bg-paper text-ink"
                  }`}
                >
                  <span>{option}</span>
                  <span
                    aria-hidden
                    className={`grid size-[19px] shrink-0 place-items-center rounded-full ${
                      selected
                        ? "border-[6px] border-rose"
                        : "border-[1.5px] border-[#c8c0c4]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        ) : null}

        {step.kind === "field" ? (
          <div>
            <label htmlFor="salary" className="mb-2 block text-xs font-bold">
              {step.fieldLabel}
            </label>
            <input
              id="salary"
              inputMode="numeric"
              aria-label={step.fieldLabel}
              value={onboarding.salaryFloor ?? DEFAULT_SALARY_FLOOR}
              onChange={(event) =>
                setOnboarding({ salaryFloor: event.target.value })
              }
              className="h-[55px] w-full rounded-[14px] border border-line bg-paper px-[15px] text-ink outline-none focus:border-rose focus:ring-[3px] focus:ring-rose-soft"
            />
            <p className="mt-[9px] text-left text-[10px] leading-[1.35] text-muted">
              {step.fieldNote}
            </p>
          </div>
        ) : null}

        {step.kind === "upload" ? (
          <div>
            <div
              className={`rounded-[18px] border px-5 py-6 text-center ${
                uploaded
                  ? "border-solid border-[#b8d9c9] bg-[#f5fbf8]"
                  : "border-dashed border-[#bdb4b8]"
              }`}
            >
              <div className="mx-auto mb-3 grid size-[46px] place-items-center rounded-[15px] bg-rose-soft text-rose-ink">
                {uploaded ? "✓" : <UploadIcon />}
              </div>
              <h3 className="m-0 text-base">
                {uploaded ? "CV added" : "Add your current CV"}
              </h3>
              <p className="mb-[15px] mt-[7px] text-xs leading-[1.4] text-muted">
                {cvFile
                  ? `${cvFile.name} · ${formatBytes(cvFile.size)}`
                  : uploaded
                    ? "Your CV is on file for matching and tailoring."
                    : "PDF or DOCX · Your source of truth for AI tailoring"}
              </p>
              <label
                className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border px-3.5 text-[13px] font-[710] ${
                  uploaded
                    ? "border-line bg-paper"
                    : "border-ink bg-ink text-white"
                }`}
              >
                {uploaded ? "Replace file" : "Choose a file"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={handleFile}
                />
              </label>
            </div>
            {uploadError ? (
              <p role="alert" className="mt-2.5 text-xs font-[650] text-red">
                {uploadError}
              </p>
            ) : null}
            {!uploaded ? (
              <button
                type="button"
                onClick={skipUpload}
                className="mx-auto mt-3 block bg-transparent text-xs font-[650] text-muted underline-offset-2 hover:underline"
              >
                I&apos;ll add it later
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <footer className="grid gap-2.5">
        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={!canContinue}
          onClick={goNext}
        >
          {isLast ? "Build my matches" : "Continue"}
        </Button>
        <p className="m-0 text-center text-[10px] leading-[1.35] text-muted">
          Your answers stay private and can be changed from Profile.
        </p>
      </footer>
    </section>
  );
}
