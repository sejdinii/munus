// Deterministic CV parser — the keyless fallback and the floor the LLM
// extractor must beat. Section-aware, evidence-preserving, never inventive:
// every fact's sourceSpan is a verbatim line from the CV.

import type { ExtractedFact, FactsExtractor } from "./types";

const MAX_FACTS = 60;

type Section = "experience" | "education" | "skills" | "other";

const SECTION_HEADERS: Array<[RegExp, Section]> = [
  [/^(work\s+)?experience\b|^employment\b|^professional experience\b|^career\b/i, "experience"],
  [/^education\b|^studies\b|^academic\b/i, "education"],
  [/^skills\b|^tools\b|^technologies\b|^stack\b|^expertise\b|^competenc/i, "skills"],
  [/^projects\b|^achievements\b|^highlights\b|^summary\b|^profile\b|^about\b/i, "other"],
];

// Date ranges mark role lines: "2019–2023", "Jan 2020 - Present", "2021 to now".
const DATE_RANGE =
  /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(19|20)\d{2}\s*(–|—|-|to|until)\s*(((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(19|20)\d{2}|present|now|today|current)/i;

const OUTCOME_VERB =
  /\b(led|launched|shipped|grew|reduced|increased|improved|redesigned|built|scaled|drove|delivered|owned|founded|created|established|mentored|managed)\b/i;

const DEGREE =
  /\b(b\.?a\.?|b\.?sc\.?|m\.?a\.?|m\.?sc\.?|mba|ph\.?d\.?|bachelor|master|diploma|degree)\b/i;

const SKILL_DICTIONARY = [
  "figma", "sketch", "adobe xd", "framer", "principle", "protopie", "webflow",
  "prototyping", "wireframing", "design systems", "design tokens",
  "user research", "usability testing", "user interviews", "a/b testing",
  "information architecture", "interaction design", "visual design", "ui design",
  "ux design", "service design", "journey mapping", "personas", "accessibility",
  "wcag", "ux writing", "content design", "motion design", "illustration",
  "html", "css", "javascript", "typescript", "react", "swiftui", "tailwind",
  "analytics", "amplitude", "mixpanel", "hotjar", "posthog", "notion", "jira",
  "agile", "scrum", "workshop facilitation", "stakeholder management",
];

function span(line: string): string {
  const s = line.trim();
  return s.length > 140 ? `${s.slice(0, 137)}…` : s;
}

function isBullet(line: string): boolean {
  return /^\s*[-–•*·▪]\s+/.test(line);
}

function stripBullet(line: string): string {
  return line.replace(/^\s*[-–•*·▪]\s+/, "").trim();
}

export const heuristicExtractor: FactsExtractor = {
  async extract(cvText: string): Promise<ExtractedFact[]> {
    const lines = cvText.split("\n");
    const facts: ExtractedFact[] = [];
    const seen = new Set<string>();

    const push = (fact: ExtractedFact) => {
      const key = `${fact.kind}:${fact.content.toLowerCase()}`;
      if (seen.has(key) || facts.length >= MAX_FACTS) return;
      seen.add(key);
      facts.push(fact);
    };

    let section: Section = "other";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const header = SECTION_HEADERS.find(([re]) => re.test(line));
      if (header && line.length < 40) {
        section = header[1];
        continue;
      }

      // Education first — degree lines often carry date ranges and would
      // otherwise be misfiled as roles.
      if (section === "education" || DEGREE.test(line)) {
        if (line.length > 8 && (DEGREE.test(line) || /universit|college|school|academy/i.test(line))) {
          push({ kind: "education", content: span(stripBullet(line)), sourceSpan: span(line) });
          continue;
        }
      }

      // Roles: any line carrying a date range. If the line is essentially just
      // the dates, the title usually sits on the line above or below it.
      if (DATE_RANGE.test(line)) {
        const remainder = line.replace(DATE_RANGE, "").replace(/[·|,–—-]/g, "").trim();
        let title = "";
        if (remainder.length < 6 && !isBullet(line)) {
          const isTitleLine = (raw: string | undefined) => {
            const candidate = raw?.trim() ?? "";
            return (
              candidate.length > 3 &&
              candidate.length < 80 &&
              !DATE_RANGE.test(candidate) &&
              !isBullet(candidate) &&
              !SECTION_HEADERS.some(([re]) => re.test(candidate))
            );
          };
          const prev = lines.slice(0, i).reverse().find((raw) => raw.trim());
          if (isTitleLine(prev)) title = prev!.trim();
          else if (isTitleLine(lines[i + 1])) title = lines[i + 1].trim();
        }
        push({
          kind: "role",
          content: span(title ? `${title} (${line})` : line),
          sourceSpan: span(line),
        });
        continue;
      }

      // Skills: split list lines inside the skills section.
      if (section === "skills") {
        for (const part of stripBullet(line).split(/[,;·|•]/)) {
          const skill = part.trim();
          if (skill.length >= 2 && skill.length <= 40) {
            push({ kind: "skill", content: skill, sourceSpan: span(line) });
          }
        }
        continue;
      }

      // Outcomes: bullets with numbers or achievement verbs.
      if (isBullet(line)) {
        const body = stripBullet(line);
        const hasMetric = /\d|%|€|\$|£/.test(body);
        if ((hasMetric || OUTCOME_VERB.test(body)) && body.length > 15) {
          push({ kind: "outcome", content: span(body), sourceSpan: span(line) });
          continue;
        }
      }
    }

    // Whole-document skill dictionary sweep (catches skills named in prose).
    const lower = cvText.toLowerCase();
    for (const skill of SKILL_DICTIONARY) {
      if (facts.length >= MAX_FACTS) break;
      const index = lower.indexOf(skill);
      if (index === -1) continue;
      const lineWithSkill = cvText.slice(
        cvText.lastIndexOf("\n", index) + 1,
        cvText.indexOf("\n", index) === -1 ? undefined : cvText.indexOf("\n", index),
      );
      push({
        kind: "skill",
        content: skill.replace(/\b\w/g, (c) => c.toUpperCase()),
        sourceSpan: span(lineWithSkill),
      });
    }

    return facts;
  },
};
