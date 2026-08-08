// Data shapes frozen in CONTRACTS.md §2 — mirror of supabase/migrations.

export type Plan = "free" | "plus";

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  roleTarget: string | null;
  level: string | null;
  locations: string[];
  remoteOk: boolean;
  salaryMin: number | null;
  currency: string;
  alerts: string | null;
  cvPath: string | null;
  plan: Plan;
  stripeCustomerId: string | null;
  createdAt: string;
};

export type FactKind = "role" | "skill" | "outcome" | "education";

export type Fact = {
  id: string;
  profileId: string;
  kind: FactKind;
  content: string;
  sourceSpan: string | null;
  createdAt: string;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  ats: string;
  feedUrl: string;
  active: boolean;
};

export type Job = {
  id: string;
  companyId: string;
  externalId: string;
  title: string;
  location: string;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  description: string;
  applyUrl: string;
  postedAt: string;
  verifiedAt: string;
  open: boolean;
};

export type DecisionType = "save" | "pass" | "star";

export type Decision = {
  id: string;
  profileId: string;
  jobId: string;
  type: DecisionType;
  at: string;
};

export type JobMatch = {
  profileId: string;
  jobId: string;
  score: number;
  reasons: string[];
  concern: string | null;
  cachedAt: string;
};

export type DocumentKind = "cv" | "letter";

export type TailoredDocument = {
  id: string;
  profileId: string;
  jobId: string;
  kind: DocumentKind;
  content: unknown;
  accepted: string[];
  tone: string | null;
  pdfPath: string | null;
  updatedAt: string;
};

export type ApplicationStatus = "prepared" | "opened" | "confirmed";

export type Application = {
  id: string;
  profileId: string;
  jobId: string;
  status: ApplicationStatus;
  confirmedAt: string | null;
  receipt: unknown;
};

export type Usage = {
  profileId: string;
  weekStart: string;
  swipes: number;
  gensToday: number;
  day: string;
};
