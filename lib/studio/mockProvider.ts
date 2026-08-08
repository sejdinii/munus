/* Mock tailor provider — same interface the real Groq provider will
   implement (D17: openai/gpt-oss-120b when GROQ_API_KEY exists). Purely
   deterministic template output grounded in real fact ids, so the studio
   demo behaves exactly like the future pipeline: provider → verifier → UI.
   It never fabricates: every template cites the facts it was built from.

   Tone handling operates on whole templates, never mid-string surgery
   (critic W3 #2: naive splitting mangled interpolated job titles), applies
   only to content-kind suggestions (never editing instructions, critic W3
   #8), and normalizes trailing punctuation. */

import type {
  Suggestion,
  TailorProvider,
  TailorRequest,
  TailorResult,
} from "./types";

function stripPeriod(text: string): string {
  return text.replace(/\.\s*$/, "");
}

function firstSentence(text: string): string {
  const idx = text.indexOf(". ");
  return idx === -1 ? stripPeriod(text) : text.slice(0, idx);
}

function applyTone(
  text: string,
  tone: string | null,
  opts: { kind: Suggestion["kind"]; warmable?: boolean; shorter?: string },
): string {
  if (opts.kind === "instruction") return text;
  switch (tone) {
    case "Shorter":
      /* Prefer a hand-written short variant; the sentence-split fallback is
         safe (never cuts inside interpolated values) but rarely shorter. */
      return opts.shorter ?? `${firstSentence(stripPeriod(text))}.`;
    case "More formal":
      return text
        .replace(/^Led /, "Directed ")
        .replace(/\bI’m applying\b/, "I am applying");
    case "More direct":
      return text.replace(/partnering with/, "working directly with");
    case "Warmer":
      /* One warm clause per document, not on every line (critic W3 #8). */
      return opts.warmable
        ? `${stripPeriod(text)} — work I genuinely enjoyed.`
        : text;
    default:
      return text;
  }
}

export const mockTailorProvider: TailorProvider = {
  name: "mock",
  async tailor({ job, facts, tone }: TailorRequest): Promise<TailorResult> {
    /* Simulated latency so loading states are honest to test. */
    await new Promise((resolve) => setTimeout(resolve, 900));

    const workflow = facts.find((f) => f.id === "fact-outcome-workflow");
    const systems = facts.find((f) => f.id === "fact-skill-systems");
    const activation = facts.find((f) => f.id === "fact-outcome-activation");
    const role = facts.find((f) => f.id === "fact-role-saas");

    const suggestions: Suggestion[] = [];

    if (workflow) {
      suggestions.push({
        id: "cv-emphasize-workflow",
        docKind: "cv",
        kind: "content",
        label: "Emphasize for this role",
        text: applyTone(
          "Led discovery and end-to-end design for a new workflow product, partnering with engineering from prototype to launch.",
          tone,
          {
            kind: "content",
            warmable: true,
            shorter:
              "Led end-to-end design for a new workflow product through launch.",
          },
        ),
        factIds: [workflow.id],
        evidenceLabel: `✓ From ${workflow.sourceSpan}`,
      });
    }
    if (systems) {
      suggestions.push({
        id: "cv-reorder-systems",
        docKind: "cv",
        kind: "instruction",
        label: "Reorder for relevance",
        text: `Move the design-system leadership bullet to the top of Experience so it answers ${job.company}’s first requirement.`,
        factIds: [systems.id],
        evidenceLabel: `✓ From ${systems.sourceSpan}`,
      });
    }
    if (activation && /growth|activation|onboarding/i.test(job.about + job.title)) {
      suggestions.push({
        id: "cv-surface-activation",
        docKind: "cv",
        kind: "content",
        label: "Surface a measured outcome",
        text: applyTone(
          "Redesigned activation and onboarding flows, lifting week-one retention by 14%.",
          tone,
          {
            kind: "content",
            shorter: "Lifted week-one retention 14% via an activation redesign.",
          },
        ),
        factIds: [activation.id],
        evidenceLabel: `✓ From ${activation.sourceSpan}`,
      });
    }
    if (role) {
      suggestions.push({
        id: "letter-intro",
        docKind: "letter",
        kind: "content",
        label: "Grounded introduction",
        text: applyTone(
          `I’m applying for the ${job.title} role because the challenge closely matches the B2B SaaS products I have designed for the last six years.`,
          tone,
          {
            kind: "content",
            shorter: `The ${job.title} role closely matches my last six years designing B2B SaaS.`,
          },
        ),
        factIds: [role.id],
        evidenceLabel: `✓ CV · ${role.sourceSpan}`,
      });
    }
    if (workflow) {
      suggestions.push({
        id: "letter-grounded-paragraph",
        docKind: "letter",
        kind: "content",
        label: "Grounded paragraph",
        text: applyTone(
          "Most recently I led discovery and product design for a new workflow product through launch.",
          tone,
          {
            kind: "content",
            warmable: true,
            shorter: "I recently led a new workflow product from discovery through launch.",
          },
        ),
        factIds: [workflow.id],
        evidenceLabel: `✓ CV · ${workflow.sourceSpan}`,
      });
    }

    return { suggestions };
  },
};
