"use client";

/* Onboarding — 6-question flow, prototype screen 02 (CONTRACTS §4 binding
   visual spec: .onboarding, .onboard-head, .progress, .choices, .choice,
   .field-label, .text-field, .upload-box, .onboard-footer, .privacy).
   Answers persist through lib/mock/store's setOnboarding as the user
   progresses (W2+ this becomes POST /api/profile). */

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { BackIcon, UploadIcon } from "@/components/ui/icons";
import { useMunusStore, type OnboardingAnswers } from "@/lib/mock/store";
import { useSession } from "@/lib/supabase/session";
import { SignInGate } from "@/components/auth/SignInGate";
import { FactPanel } from "@/components/cv/FactPanel";
import type { CvFact, FactKind } from "@/lib/cv/types";
import { onboardingSteps, LEVEL_OPTIONS } from "./steps";
import { searchRoles, ROLE_GROUPS } from "@/lib/onboarding/roles";
import { searchLocations, EUROPE_LOCATIONS } from "@/lib/onboarding/locations";

const STEP_STORAGE_KEY = "munus-onboarding-step-v1";
const MAX_CV_BYTES = 8 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const HAS_BACKEND = Boolean(
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL,
);

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
  const [parsing, setParsing] = useState(false);
  const [facts, setFacts] = useState<CvFact[]>([]);
  const [factsProvider, setFactsProvider] = useState<"mock" | "groq">("mock");
  const [factsAccepted, setFactsAccepted] = useState(false);
  const [manualFailed, setManualFailed] = useState(false);

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
      : step.kind === "roleAndLevel"
        ? Boolean(onboarding.role)
        : step.kind === "workTypes"
          ? (onboarding.workTypes?.length ?? 0) > 0
          : step.kind === "locations"
            ? (onboarding.locations?.length ?? 0) > 0
            : Boolean(cvFile) || onboarding.cvUploaded === true;

  function goBack() {
    if (isFirst) {
      router.push("/");
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    if (isLast) {
      // Persist the answers to the profile (server-side, auth-bound) so the
      // deck ranks with them; then complete locally and move to ready.
      if (HAS_BACKEND) {
        void fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: onboarding.role,
            level: onboarding.level,
            workTypes: onboarding.workTypes,
            locations: onboarding.locations,
            alerts: onboarding.alerts,
          }),
        }).catch(() => {
          /* profile save is best-effort — the deck still works from facts */
        });
      }
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
    if (HAS_BACKEND) {
      void parseCv(file);
    } else {
      // No backend configured (mock/CI mode): the prototype behavior
      // stands — file name recorded, parse comes with the real backend.
      setOnboarding({ cvUploaded: true });
    }
  }

  /** TASK-104: upload → extract → facts (server-side, auth-bound). */
  async function parseCv(file: File) {
    setParsing(true);
    setFacts([]);
    setFactsAccepted(false);
    setManualFailed(false);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/cv", { method: "POST", body: form });
      const payload = (await response.json().catch(() => null)) as
        | { facts?: CvFact[]; provider?: "mock" | "groq"; error?: string }
        | null;
      if (!response.ok) {
        setUploadError(payload?.error ?? "Could not parse that file.");
        setManualFailed(true);
        setOnboarding({ cvUploaded: true });
        return;
      }
      setFacts(payload?.facts ?? []);
      setFactsProvider(payload?.provider ?? "mock");
      if ((payload?.facts?.length ?? 0) > 0) {
        setFactsAccepted(true);
      } else {
        setManualFailed(true);
      }
      setOnboarding({ cvUploaded: true });
    } catch {
      setUploadError("Network error while parsing your CV — try again.");
      setManualFailed(true);
      setOnboarding({ cvUploaded: true });
    } finally {
      setParsing(false);
    }
  }

  /** Manual fallback: POST a single fact to /api/cv/facts. */
  async function addManualFact(kind: FactKind, content: string): Promise<boolean> {
    try {
      const response = await fetch("/api/cv/facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts: [{ kind, content }] }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { facts?: CvFact[] }
        | null;
      if (!response.ok) return false;
      setFacts((prev) => [...prev, ...(payload?.facts ?? [])]);
      setFactsAccepted(true);
      return true;
    } catch {
      return false;
    }
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

        {step.kind === "roleAndLevel" ? (
          <RoleAndLevelPicker
            value={onboarding.role}
            level={onboarding.level}
            onPick={(role) => setOnboarding({ role })}
            onLevel={(level) => setOnboarding({ level })}
          />
        ) : null}

        {step.kind === "workTypes" ? (
          <div className="grid gap-2.5">
            {step.options.map((option) => {
              const selected = (onboarding.workTypes ?? []).includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setOnboarding({
                      workTypes: selected
                        ? (onboarding.workTypes ?? []).filter((w) => w !== option)
                        : [...(onboarding.workTypes ?? []), option],
                    })
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

        {step.kind === "locations" ? (
          <LocationsPicker
            value={onboarding.locations ?? []}
            onChange={(locations) => setOnboarding({ locations })}
          />
        ) : null}

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

        {step.kind === "upload" ? (
          <UploadStepGate>
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
            {parsing ? (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-[650] text-muted">
                <span
                  aria-hidden
                  className="size-3.5 animate-spin rounded-full border-2 border-rose-soft border-t-rose"
                />
                Parsing your CV…
              </div>
            ) : null}
            {!parsing && (factsAccepted || manualFailed) ? (
              <FactPanel
                facts={facts}
                provider={factsProvider}
                onRemove={(index) =>
                  setFacts((prev) => prev.filter((_, i) => i !== index))
                }
                onManualAdd={addManualFact}
                onDone={() => setFactsAccepted(true)}
              />
            ) : null}
        </UploadStepGate>
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

/**
 * Auth gate at the CV-upload moment (D16): guests preview everything
 * before this step; here they sign in (Google first, Apple before beta)
 * and the upload box appears only for an active session.
 */
function UploadStepGate({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return <LoadingState label="Checking your session" />;
  }
  if (status === "signedOut" || status === "unconfigured") {
    return <SignInGate />;
  }
  return <>{children}</>;
}

/**
 * Role + level in ONE window (founder feedback): searchable catalog of every
 * role group, one tap to pick, free-text custom entry, and the level chips
 * inline. The catalog lives in lib/onboarding/roles.ts.
 */
function RoleAndLevelPicker({
  value,
  level,
  onPick,
  onLevel,
}: {
  value: string | undefined;
  level: string | undefined;
  onPick: (role: string) => void;
  onLevel: (level: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState("");
  const groups = searchRoles(query);
  const showAll = query.trim().length === 0;

  return (
    <div className="grid gap-5">
      <input
        type="search"
        aria-label="Search roles"
        placeholder="Search roles… (e.g. data scientist, designer)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-[55px] w-full rounded-[14px] border border-line bg-paper px-[15px] text-ink outline-none focus:border-rose focus:ring-[3px] focus:ring-rose-soft"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onPick(value)}
          className={`flex min-h-[55px] items-center justify-between gap-3 rounded-[14px] border border-rose bg-rose-soft px-4 text-left font-[620] text-rose-ink`}
        >
          <span>{value}</span>
          <span aria-hidden className="text-xs font-[710]">change</span>
        </button>
      ) : null}
      <div className="max-h-[300px] overflow-y-auto rounded-[14px] border border-line">
        {groups.map((group) => (
          <div key={group.group} className="border-b border-line last:border-0">
            <p className="m-0 bg-quiet/60 px-3.5 py-1.5 text-[10px] font-[760] uppercase tracking-[0.08em] text-muted">
              {group.group}
            </p>
            <div className="flex flex-wrap gap-1.5 p-2.5">
              {group.roles.map((role) => {
                const selected = value === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onPick(role)}
                    className={`rounded-full border px-3 py-1.5 text-[12.5px] font-[620] ${
                      selected
                        ? "border-rose bg-rose-soft text-rose-ink"
                        : "border-line bg-paper text-ink"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 ? (
          <p className="m-0 px-3.5 py-4 text-xs text-muted">
            No catalog match — type your own below.
          </p>
        ) : null}
      </div>
      {!showAll ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim()) onPick(custom.trim());
          }}
        >
          <input
            type="text"
            aria-label="Custom role"
            placeholder="Not in the list? Type it here"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="h-[48px] min-w-0 flex-1 rounded-[14px] border border-line bg-paper px-[15px] text-ink outline-none focus:border-rose focus:ring-[3px] focus:ring-rose-soft"
          />
          <button
            type="submit"
            disabled={!custom.trim()}
            className="h-[48px] rounded-[14px] bg-ink px-4 text-[13px] font-[710] text-white disabled:opacity-40"
          >
            Add
          </button>
        </form>
      ) : null}
      <div>
        <p className="m-0 mb-2 text-xs font-bold">Your level</p>
        <div className="grid grid-cols-2 gap-2">
          {LEVEL_OPTIONS.map((option) => {
            const selected = level === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onLevel(option)}
                className={`min-h-[48px] rounded-[14px] border px-3 text-left text-[13px] font-[620] ${
                  selected
                    ? "border-rose bg-rose-soft text-rose-ink"
                    : "border-line bg-paper text-ink"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Europe location picker (founder feedback): searchable full-European
 * catalog, multi-select chips, "Anywhere in Europe" shortcut. The catalog
 * lives in lib/onboarding/locations.ts.
 */
function LocationsPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (locations: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const groups = searchLocations(query);
  const showAll = query.trim().length === 0;
  const anywhere = value.includes("Anywhere in Europe");

  function toggle(city: string) {
    if (anywhere) {
      onChange([city]);
      return;
    }
    onChange(
      value.includes(city) ? value.filter((c) => c !== city) : [...value, city],
    );
  }

  return (
    <div className="grid gap-5">
      <button
        type="button"
        onClick={() => onChange(anywhere ? [] : ["Anywhere in Europe"])}
        className={`flex min-h-[55px] items-center justify-between gap-3 rounded-[14px] border px-4 text-left font-[620] ${
          anywhere
            ? "border-rose bg-rose-soft text-rose-ink"
            : "border-line bg-paper text-ink"
        }`}
      >
        <span>Anywhere in Europe</span>
        <span
          aria-hidden
          className={`grid size-[19px] shrink-0 place-items-center rounded-full ${
            anywhere
              ? "border-[6px] border-rose"
              : "border-[1.5px] border-[#c8c0c4]"
          }`}
        />
      </button>
      {value.length > 0 && !anywhere ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => toggle(city)}
              className="rounded-full border border-rose bg-rose-soft px-3 py-1.5 text-[12.5px] font-[620] text-rose-ink"
            >
              {city} ✕
            </button>
          ))}
        </div>
      ) : null}
      <input
        type="search"
        aria-label="Search locations"
        placeholder="Search every European city…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-[55px] w-full rounded-[14px] border border-line bg-paper px-[15px] text-ink outline-none focus:border-rose focus:ring-[3px] focus:ring-rose-soft"
      />
      <div className="max-h-[280px] overflow-y-auto rounded-[14px] border border-line">
        {groups.map((group) => (
          <div key={group.country} className="border-b border-line last:border-0">
            <p className="m-0 bg-quiet/60 px-3.5 py-1.5 text-[10px] font-[760] uppercase tracking-[0.08em] text-muted">
              {group.country}
            </p>
            <div className="flex flex-wrap gap-1.5 p-2.5">
              {group.cities.map((city) => {
                const selected = value.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggle(city)}
                    className={`rounded-full border px-3 py-1.5 text-[12.5px] font-[620] ${
                      selected
                        ? "border-rose bg-rose-soft text-rose-ink"
                        : "border-line bg-paper text-ink"
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 ? (
          <p className="m-0 px-3.5 py-4 text-xs text-muted">
            No city match — try the country name or a nearby hub.
          </p>
        ) : null}
      </div>
      {showAll ? (
        <p className="m-0 text-[10px] leading-[1.35] text-muted">
          {EUROPE_LOCATIONS.reduce((n, g) => n + g.cities.length, 0)} cities ·{" "}
          {EUROPE_LOCATIONS.length} countries — search to narrow.
        </p>
      ) : null}
    </div>
  );
}
