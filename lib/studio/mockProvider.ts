/* Mock tailor provider — same interface the real Groq provider will
   implement (D17: openai/gpt-oss-120b when GROQ_API_KEY exists). Purely
   deterministic template output grounded in real fact ids, so the studio
   demo behaves exactly like the future pipeline: provider → verifier → UI.
   It never fabricates: every template cites the facts it was built from. */

import type {
  Suggestion,
  TailorProvider,
  TailorRequest,
  TailorResult,
} from "./types";

function toneWrap(text: string, tone: string | null): string {
  switch (tone) {
    case "Shorter":
      return text.split(", ")[0] + ".";
    case "More formal":
      return text.replace(/^Led /, "Directed ").replace(/^Move /, "Reposition ");
    case "More direct":
      return text.replace(/partnering with/, "working directly with");
    case "Warmer":
      return text.replace(/\.$/, " — work I genuinely enjoyed.");
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
        label: "Emphasize for this role",
        text: toneWrap(
          "Led discovery and end-to-end design for a new workflow product, partnering with engineering from prototype to launch.",
          tone,
        ),
        factIds: [workflow.id],
        evidenceLabel: `✓ From ${workflow.sourceSpan}`,
      });
    }
    if (systems) {
      suggestions.push({
        id: "cv-reorder-systems",
        docKind: "cv",
        label: "Reorder for relevance",
        text: toneWrap(
          `Move the design-system leadership bullet above visual design so it answers ${job.company}’s first requirement.`,
          tone,
        ),
        factIds: [systems.id],
        evidenceLabel: `✓ From ${systems.sourceSpan}`,
      });
    }
    if (activation && /growth|activation|onboarding/i.test(job.about + job.title)) {
      suggestions.push({
        id: "cv-surface-activation",
        docKind: "cv",
        label: "Surface a measured outcome",
        text: toneWrap(
          "Redesigned activation and onboarding flows, lifting week-one retention by 14%.",
          tone,
        ),
        factIds: [activation.id],
        evidenceLabel: `✓ From ${activation.sourceSpan}`,
      });
    }
    if (workflow) {
      suggestions.push({
        id: "letter-grounded-paragraph",
        docKind: "letter",
        label: "Grounded paragraph",
        text: toneWrap(
          "Most recently I led discovery and product design for a new workflow product through launch.",
          tone,
        ),
        factIds: [workflow.id],
        evidenceLabel: `✓ CV · ${workflow.sourceSpan}`,
      });
    }

    const letterParagraphs = [
      `Hello ${job.company} team,`,
      toneWrap(
        `I’m applying for the ${job.title} role because the challenge closely matches the products I have spent the last six years designing.`,
        tone,
      ),
      "I would welcome the opportunity to discuss the work.",
    ];

    /* role fact grounds the "six years" claim in the letter body. */
    void role;

    return { suggestions, letterParagraphs };
  },
};
