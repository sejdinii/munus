import type { CvFact, FactKind } from "./types";

/**
 * Deterministic mock extractor — the pipeline's brain while GROQ_API_KEY is
 * absent (TASK-104: "runs on the mock provider until the Groq key lands").
 * Rules are intentionally simple and unit-testable; the Groq provider
 * replaces this wholesale once configured.
 */

const SKILL_DICTIONARY = [
  "react",
  "typescript",
  "javascript",
  "node.js",
  "next.js",
  "python",
  "sql",
  "postgresql",
  "supabase",
  "figma",
  "product design",
  "ux research",
  "ui design",
  "prototyping",
  "usability testing",
  "design systems",
  "agile",
  "scrum",
  "kanban",
  "jira",
  "confluence",
  "analytics",
  "a/b testing",
  "amplitude",
  "tableau",
  "data analysis",
  "machine learning",
  "nlp",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "ci/cd",
  "graphql",
  "rest apis",
  "tailwind css",
  "html",
  "css",
  "excel",
  "power bi",
  "stakeholder management",
  "roadmapping",
  "kpis",
] as const;

const ROLE_PATTERNS = [
  /product designer/i,
  /ux\/?ui designer/i,
  /design lead/i,
  /product manager/i,
  /product owner/i,
  /software engineer/i,
  /frontend engineer/i,
  /backend engineer/i,
  /full[ -]stack engineer/i,
  /data scientist/i,
  /data analyst/i,
  /data engineer/i,
  /machine learning engineer/i,
  /ai engineer/i,
  /ux researcher/i,
  /design researcher/i,
  /technical writer/i,
  /consultant/i,
  /business analyst/i,
  /project manager/i,
] as const;

const EDUCATION_PATTERNS = [
  /bachelor'?s? degree/i,
  /master'?s? degree/i,
  /phd/i,
  /doctorate/i,
  /b\.?sc\.?/i,
  /m\.?sc\.?/i,
  /diploma/i,
  /bachelor/i,
  /master/i,
  /university of/i,
  /technische universit/i,
  /hochschule/i,
] as const;

const OUTCOME_MARKERS = [
  /increased/i,
  /reduced/i,
  /improved/i,
  /launched/i,
  /built/i,
  /led/i,
  /grew/i,
  /delivered/i,
  /achieved/i,
  /optimized/i,
  /optimised/i,
  /cut/i,
  /boosted/i,
  /doubled/i,
  /tripled/i,
  /\d+%/,
  /\d+x/i,
] as const;

const LINE_LIMIT = 400;
const MAX_FACTS = { role: 10, skill: 40, outcome: 15, education: 10, profile: 1, contact: 8 } as const;

function pushUnique(
  facts: CvFact[],
  kind: FactKind,
  content: string,
  source: string,
) {
  const clean = content.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 280) return;
  if (facts.some((f) => f.kind === kind && f.content.toLowerCase() === clean.toLowerCase())) return;
  if (facts.filter((f) => f.kind === kind).length >= MAX_FACTS[kind]) return;
  facts.push({
    kind,
    content: clean,
    source_span: source.trim().slice(0, 160) || undefined,
  });
}

export function extractFactsMock(text: string): CvFact[] {
  const facts: CvFact[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, LINE_LIMIT);

  for (const line of lines) {
    // Roles: headline lines (short, title-cased, no sentence punctuation).
    if (line.length <= 80 && !/[.;:]$/.test(line)) {
      for (const pattern of ROLE_PATTERNS) {
        if (pattern.test(line)) {
          pushUnique(facts, "role", line, line);
          break;
        }
      }
    }
    // Education.
    for (const pattern of EDUCATION_PATTERNS) {
      if (pattern.test(line)) {
        pushUnique(facts, "education", line, line);
        break;
      }
    }
    // Skills: dictionary hits on any line (case-insensitive).
    for (const skill of SKILL_DICTIONARY) {
      if (new RegExp(`(^|[^a-z0-9+#.])${skill.replace(/[.+]/g, "\\$&")}([^a-z0-9+#.]|$)`, "i").test(line)) {
        pushUnique(facts, "skill", skill, line);
      }
    }
    // Outcomes: bullet-ish or metric-rich lines.
    const isBullet = /^[-•*·]/.test(line) || /^\d+[.)]/.test(line);
    if (isBullet && OUTCOME_MARKERS.some((m) => m.test(line))) {
      pushUnique(facts, "outcome", line.replace(/^[-•*·]\s*/, ""), line);
    }
  }

  return facts;
}
