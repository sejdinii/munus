/* Onboarding step config — updated per founder feedback (2026-08-07):
   role + level in ONE window (wide searchable catalog + custom entry),
   work type as Remote/Hybrid/On-site preference, full Europe location
   catalog (multi-select), salary question REMOVED, CV MANDATORY. */

export type RoleAndLevelStep = {
  kind: "roleAndLevel";
  key: "roles" | "levels";
  title: string;
  help: string;
  levelOptions: readonly string[];
};

export type WorkTypesStep = {
  kind: "workTypes";
  key: "workTypes";
  title: string;
  help: string;
  options: readonly string[];
};

export type LocationsStep = {
  kind: "locations";
  key: "locations";
  title: string;
  help: string;
};

export type UploadStep = {
  kind: "upload";
  key: "cvUploaded";
  title: string;
  help: string;
};

export type ChoiceStep = {
  kind: "choice";
  key: "alerts";
  title: string;
  help: string;
  options: readonly string[];
};

export type StepConfig = RoleAndLevelStep | WorkTypesStep | LocationsStep | UploadStep | ChoiceStep;

export const LEVEL_OPTIONS = [
  "Intern / Junior",
  "Mid-level",
  "Senior",
  "Lead",
  "Open to two levels",
] as const;
export const WORK_TYPE_OPTIONS = ["Remote", "Hybrid", "On-site"] as const;

export const onboardingSteps: readonly StepConfig[] = [
  {
    kind: "roleAndLevel",
    key: "roles",
    title: "What work should we look for?",
    help: "Add every role you'd consider — type and pick, or type your own. Levels too.",
    levelOptions: LEVEL_OPTIONS,
  },
  {
    kind: "workTypes",
    key: "workTypes",
    title: "How do you want to work?",
    help: "Choose every format you'd accept — we rank roles, we don't exclude.",
    options: WORK_TYPE_OPTIONS,
  },
  {
    kind: "locations",
    key: "locations",
    title: "Where in Europe?",
    help: "Pick every city you'd work in. We use this to rank, not to exclude good exceptions.",
  },
  {
    kind: "upload",
    key: "cvUploaded",
    title: "Give AI your real career history",
    help: "Your CV is required — it's the evidence source for matching and tailoring. Nothing is sent to employers yet.",
  },
  {
    kind: "choice",
    key: "alerts",
    title: "How quickly should we alert you?",
    help: "Fresh company listings often have the smallest applicant pools.",
    options: ["Immediately", "Morning and evening", "Daily digest", "No notifications"],
  },
] as const;
