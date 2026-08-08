"use client";

// Prototype screens 02 · Career onboarding — six questions, CV upload at Q5.
// Deviation from prototype: answers start unselected and Continue disables
// until each question is answered (the prototype pre-seeded demo answers).

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Choice, Progress, TextField } from "@/components/ui/inputs";
import { Overline, Screen } from "@/components/ui/screen";

type StepKey = "roleTarget" | "location" | "level" | "salary" | "cv" | "alerts";

type Step = {
  key: StepKey;
  title: string;
  help: string;
  options?: string[];
};

const STEPS: Step[] = [
  {
    key: "roleTarget",
    title: "What work should we look for?",
    help: "Choose the closest role. You can add adjacent titles later.",
    options: ["Product designer", "UX/UI designer", "Design lead", "Product manager"],
  },
  {
    key: "location",
    title: "Where do you want to work?",
    help: "We use this to rank roles, not to exclude good exceptions.",
    options: ["Remote in Europe", "Berlin · hybrid", "London · hybrid", "Relocation possible"],
  },
  {
    key: "level",
    title: "What level fits you now?",
    help: "This helps avoid junior roles and unrealistic stretches.",
    options: ["Mid-level", "Senior", "Lead", "Open to two levels"],
  },
  {
    key: "salary",
    title: "Set your salary floor",
    help: "You will not see this number shared with employers.",
  },
  {
    key: "cv",
    title: "Give AI your real career history",
    help: "Your CV becomes the evidence source for matching and tailoring. Nothing is sent to employers yet.",
  },
  {
    key: "alerts",
    title: "How quickly should we alert you?",
    help: "Fresh company listings often have the smallest applicant pools.",
    options: ["Immediately", "Morning and evening", "Daily digest", "No notifications"],
  },
];

type CvState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string }
  | { status: "uploaded"; fileName: string; fileSize: number; factCount?: number }
  | { status: "error"; message: string };

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function parseSalary(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return value >= 1000 && value <= 2_000_000 ? value : null;
}

export function OnboardingFlow({
  initialAnswers,
  initialCv,
}: {
  initialAnswers: {
    roleTarget: string | null;
    location: string | null;
    level: string | null;
    salaryMin: number | null;
    alerts: string | null;
  };
  initialCv: { fileName: string; fileSize: number } | null;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Record<string, string | null>>({
    roleTarget: initialAnswers.roleTarget,
    location: initialAnswers.location,
    level: initialAnswers.level,
    alerts: initialAnswers.alerts,
  });
  const [salaryText, setSalaryText] = useState(
    initialAnswers.salaryMin ? `€${initialAnswers.salaryMin.toLocaleString("en")}` : "€65,000",
  );
  const [cv, setCv] = useState<CvState>(
    initialCv
      ? { status: "uploaded", fileName: initialCv.fileName, fileSize: initialCv.fileSize }
      : { status: "idle" },
  );
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const stepComplete = (() => {
    if (current.options) return Boolean(choices[current.key]);
    if (current.key === "salary") return parseSalary(salaryText) !== null;
    return cv.status === "uploaded";
  })();

  async function uploadFile(file: File) {
    setCv({ status: "uploading", fileName: file.name });
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/cv", { method: "POST", body: form });
      const payload = (await response.json()) as {
        error?: string;
        fileName?: string;
        fileSize?: number;
        factCount?: number;
      };
      if (!response.ok) {
        setCv({
          status: "error",
          message: payload.error ?? "Upload failed. Please try again.",
        });
        return;
      }
      setCv({
        status: "uploaded",
        fileName: payload.fileName ?? file.name,
        fileSize: payload.fileSize ?? file.size,
        factCount: payload.factCount,
      });
    } catch {
      setCv({
        status: "error",
        message: "We couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  async function finish() {
    setFinishing(true);
    setFinishError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleTarget: choices.roleTarget,
          location: choices.location,
          level: choices.level,
          salaryMin: parseSalary(salaryText),
          alerts: choices.alerts,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFinishError(payload.error ?? "Something went wrong. Please try again.");
        setFinishing(false);
        return;
      }
      router.push("/profile/facts");
    } catch {
      setFinishError("We couldn't reach the server. Check your connection and try again.");
      setFinishing(false);
    }
  }

  return (
    <Screen className="onboarding">
      <div className="onboard-head">
        {step > 0 ? (
          <button
            type="button"
            className="icon-button"
            aria-label="Previous question"
            onClick={() => setStep(step - 1)}
          >
            <Icon name="back" />
          </button>
        ) : (
          <Link href="/" className="icon-button" aria-label="Back to welcome">
            <Icon name="back" />
          </Link>
        )}
        <Progress value={(step + 1) / STEPS.length} />
        <span />
      </div>

      <div className="question">
        <Overline>
          Question {step + 1} of {STEPS.length}
        </Overline>
        <h1>{current.title}</h1>
        <p className="lead">{current.help}</p>

        {current.options ? (
          <div className="choices">
            {current.options.map((option) => (
              <Choice
                key={option}
                selected={choices[current.key] === option}
                onSelect={() => setChoices({ ...choices, [current.key]: option })}
              >
                {option}
              </Choice>
            ))}
          </div>
        ) : null}

        {current.key === "salary" ? (
          <TextField
            label="Minimum annual salary"
            inputMode="numeric"
            value={salaryText}
            onChange={(event) => setSalaryText(event.target.value)}
            error={
              salaryText && parseSalary(salaryText) === null
                ? "Enter an amount like €65,000."
                : undefined
            }
            hint="We still show exceptional roles slightly below this, clearly labeled."
          />
        ) : null}

        {current.key === "cv" ? (
          <div
            className={[
              "upload-box",
              cv.status === "uploaded" && "uploaded",
              cv.status === "error" && "upload-error",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="upload-icon" aria-hidden="true">
              {cv.status === "uploaded" ? (
                "✓"
              ) : cv.status === "uploading" ? (
                <span className="spinner" style={{ width: 20, height: 20, margin: 0, borderWidth: 2 }} />
              ) : cv.status === "error" ? (
                "!"
              ) : (
                <Icon name="upload" />
              )}
            </div>
            <h3>
              {cv.status === "uploaded"
                ? "CV added"
                : cv.status === "uploading"
                  ? "Reading your CV"
                  : cv.status === "error"
                    ? "That didn't work"
                    : "Add your current CV"}
            </h3>
            <p role={cv.status === "error" ? "alert" : undefined}>
              {cv.status === "uploaded"
                ? `${cv.fileName} · ${formatSize(cv.fileSize)}${
                    cv.factCount ? ` · ${cv.factCount} facts extracted` : ""
                  }`
                : cv.status === "uploading"
                  ? `${cv.fileName} — extracting your verified experience…`
                  : cv.status === "error"
                    ? cv.message
                    : "PDF or DOCX · Your source of truth for AI tailoring"}
            </p>
            <Button
              size="sm"
              variant={cv.status === "uploaded" ? "outline" : "dark"}
              loading={cv.status === "uploading"}
              onClick={() => fileInput.current?.click()}
            >
              {cv.status === "uploaded"
                ? "Replace file"
                : cv.status === "error"
                  ? "Try another file"
                  : "Choose a file"}
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadFile(file);
                event.target.value = "";
              }}
            />
          </div>
        ) : null}
      </div>

      <footer className="onboard-footer">
        {finishError ? (
          <p className="field-error" role="alert" style={{ textAlign: "center" }}>
            {finishError}
          </p>
        ) : null}
        <Button
          variant="primary"
          disabled={!stepComplete}
          loading={finishing}
          onClick={() => (isLast ? void finish() : setStep(step + 1))}
        >
          {isLast ? "Build my matches" : "Continue"}
        </Button>
        <p className="privacy">Your answers stay private and can be changed from Profile.</p>
      </footer>
    </Screen>
  );
}
