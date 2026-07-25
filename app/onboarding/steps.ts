/* Onboarding step config — verbatim copy of prototypes/scout-pink-v2.html's
   `onboardingSteps` array (binding visual spec, CONTRACTS §4). Keys map to
   lib/mock/store.tsx OnboardingAnswers fields. */

interface StepBase {
  title: string;
  help: string;
}

export type ChoiceStep = StepBase & {
  kind: "choice";
  key: "role" | "location" | "level" | "alerts";
  options: readonly string[];
};

export type FieldStep = StepBase & {
  kind: "field";
  key: "salaryFloor";
  fieldLabel: string;
  fieldNote: string;
  defaultValue: string;
};

export type UploadStep = StepBase & {
  kind: "upload";
  key: "cvUploaded";
};

export type StepConfig = ChoiceStep | FieldStep | UploadStep;

export const DEFAULT_SALARY_FLOOR = "€65,000";

export const onboardingSteps: readonly StepConfig[] = [
  {
    kind: "choice",
    key: "role",
    title: "What work should we look for?",
    help: "Choose the closest role. You can add adjacent titles later.",
    options: [
      "Product designer",
      "UX/UI designer",
      "Design lead",
      "Product manager",
    ],
  },
  {
    kind: "choice",
    key: "location",
    title: "Where do you want to work?",
    help: "We use this to rank roles, not to exclude good exceptions.",
    options: [
      "Remote in Europe",
      "Berlin · hybrid",
      "London · hybrid",
      "Relocation possible",
    ],
  },
  {
    kind: "choice",
    key: "level",
    title: "What level fits you now?",
    help: "This helps avoid junior roles and unrealistic stretches.",
    options: ["Mid-level", "Senior", "Lead", "Open to two levels"],
  },
  {
    kind: "field",
    key: "salaryFloor",
    title: "Set your salary floor",
    help: "You will not see this number shared with employers.",
    fieldLabel: "Minimum annual salary",
    fieldNote:
      "We still show exceptional roles slightly below this, clearly labeled.",
    defaultValue: DEFAULT_SALARY_FLOOR,
  },
  {
    kind: "upload",
    key: "cvUploaded",
    title: "Give AI your real career history",
    help: "Your CV becomes the evidence source for matching and tailoring. Nothing is sent to employers yet.",
  },
  {
    kind: "choice",
    key: "alerts",
    title: "How quickly should we alert you?",
    help: "Fresh company listings often have the smallest applicant pools.",
    options: [
      "Immediately",
      "Morning and evening",
      "Daily digest",
      "No notifications",
    ],
  },
] as const;
