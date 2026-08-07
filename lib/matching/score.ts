/**
 * Rule-layer job matching (W2). Pure and deterministic: same inputs, same
 * score — the honesty contract of the deck. The LLM only polishes REASONS
 * for top candidates (see reasons.ts); the score itself is always explainable.
 *
 * Score = role(35) + skills(30) + level(10) + location(15) + salary(10).
 * Concerns are surfaced, never hidden: a job below the salary floor still
 * shows, clearly labeled (spec: "exceptional roles slightly below this,
 * clearly labeled").
 */

export interface MatchProfile {
  role_target?: string | null;
  level?: string | null;
  locations: string[];
  remote_ok: boolean;
  salary_min?: number | null;
}

export interface MatchFact {
  kind: "role" | "skill" | "outcome" | "education";
  content: string;
}

export interface MatchJob {
  id: string;
  title: string;
  location?: string | null;
  remote: boolean;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  description?: string | null;
  verified_at?: string | null;
}

export interface ScoreResult {
  score: number;
  reasons: string[];
  concern?: string;
}

const SENIORITY_WORDS = new Set([
  "senior", "sr", "lead", "principal", "staff", "head", "junior", "jr",
  "mid", "entry", "intern", "internship", "i", "ii", "iii", "iv", "v",
]);

/** Lowercase, strip punctuation, drop seniority words → comparable tokens. */
export function normalizeRole(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s/]/g, " ")
      .split(/[\s/]+/)
      .filter((w) => w.length > 1 && !SENIORITY_WORDS.has(w)),
  );
}

function roleOverlap(titleTokens: Set<string>, candidates: string[]): string | null {
  for (const candidate of candidates) {
    const tokens = normalizeRole(candidate);
    let hits = 0;
    for (const token of tokens) {
      if (titleTokens.has(token)) hits += 1;
    }
    // A candidate counts when at least half its tokens appear (min 1 hit).
    if (tokens.size > 0 && hits >= Math.max(1, Math.ceil(tokens.size / 2))) {
      return candidate;
    }
  }
  return null;
}

function seniorityOf(title: string): "junior" | "mid" | "senior" | null {
  const t = title.toLowerCase();
  if (/(senior|sr\.|lead|principal|staff|head)\b/.test(t)) return "senior";
  if (/(junior|jr\.|intern|entry)/.test(t)) return "junior";
  return null;
}

const SKILL_STOP = new Set([
  "the", "and", "with", "for", "you", "your", "our", "team", "work",
  "experience", "role", "will", "etc", "e.g", "plus", "or", "using",
]);

export function scoreJob(profile: MatchProfile, facts: MatchFact[], job: MatchJob): ScoreResult {
  const reasons: string[] = [];
  const titleTokens = normalizeRole(job.title);
  const text = `${job.title} ${job.description ?? ""}`.toLowerCase();
  let score = 0;

  // ── role (35) ───────────────────────────────────────────────────────────
  const roleCandidates = [
    profile.role_target,
    ...facts.filter((f) => f.kind === "role").map((f) => f.content),
  ].filter((r): r is string => Boolean(r));
  const matchedRole = roleOverlap(titleTokens, roleCandidates);
  if (matchedRole) {
    score += 35;
    reasons.push(`Matches your target role: ${matchedRole}`);
  }

  // ── skills (30) ─────────────────────────────────────────────────────────
  const skills = facts
    .filter((f) => f.kind === "skill")
    .map((f) => f.content.toLowerCase());
  const matchedSkills: string[] = [];
  for (const skill of skills) {
    if (SKILL_STOP.has(skill)) continue;
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i").test(text)) {
      matchedSkills.push(skill);
    }
  }
  score += Math.min(30, matchedSkills.length * 7);
  if (matchedSkills.length > 0) {
    reasons.push(`Uses your skills: ${matchedSkills.slice(0, 4).join(", ")}`);
  }

  // ── level (10) ──────────────────────────────────────────────────────────
  const jobLevel = seniorityOf(job.title);
  const level = (profile.level ?? "").toLowerCase();
  if (jobLevel === "junior" && level !== "open to two levels") {
    score += 0; // junior role for a non-junior profile: no points, no drama
  } else if (jobLevel === "senior" && (level.includes("senior") || level.includes("lead") || level.includes("open"))) {
    score += 10;
  } else if (jobLevel === null && (level.includes("mid") || level.includes("open"))) {
    score += 8; // unmarked roles are usually mid-weight
  } else if (jobLevel === "senior" && level.includes("mid")) {
    score += 4; // stretch — allowed, but honestly partial
  } else {
    score += 6;
  }

  // ── location (15) ───────────────────────────────────────────────────────
  const location = job.location ?? "";
  if (job.remote && profile.remote_ok) {
    score += 15;
    reasons.push("Remote — you asked for remote");
  } else if (profile.locations.some((loc) => location.toLowerCase().includes(loc.toLowerCase()))) {
    score += 15;
    const hit = profile.locations.find((loc) => location.toLowerCase().includes(loc.toLowerCase()))!;
    reasons.push(`In your area: ${hit}`);
  } else if (profile.locations.length === 0) {
    score += 8; // no preference expressed — neutral
  } else {
    score += 0;
    reasons.push("Location is outside your selected areas");
  }

  // ── salary (10) ─────────────────────────────────────────────────────────
  if (job.salary_min == null) {
    score += 5; // not listed — never estimated (contract)
  } else if (profile.salary_min != null && job.salary_min < profile.salary_min) {
    score += 5;
    reasons.push(
      `Salary (${job.currency ?? "€"}${job.salary_min}) below your ${job.currency ?? "€"}${profile.salary_min} floor`,
    );
  } else {
    score += 10;
    reasons.push("Salary at or above your floor");
  }

  // ── freshness bonus (cap 100) ───────────────────────────────────────────
  if (job.verified_at) {
    const ageDays = (Date.now() - new Date(job.verified_at).getTime()) / 86_400_000;
    if (ageDays <= 3) score += 2;
    else if (ageDays <= 7) score += 1;
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score: finalScore,
    reasons: reasons.slice(0, 4),
    // Only NEGATIVE flags are concerns — never the positive salary line.
    concern:
      reasons.find(
        (r) => r.startsWith("Location is outside") || r.includes("below your"),
      ) ?? undefined,
  };
}
