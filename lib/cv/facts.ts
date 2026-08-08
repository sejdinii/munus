import { extractFactsGroq } from "./facts-groq";
import type { GroqUsage } from "./facts-groq";
import { extractFactsMock } from "./facts-mock";
import type { CvFact } from "./types";

/**
 * Provider router (TASK-104): Groq when configured, deterministic mock
 * otherwise — the pipeline is fully exercisable before the key lands.
 */
export async function extractFacts(
  text: string,
  options: { groqApiKey?: string } = {},
  onUsage?: (usage: GroqUsage) => void,
): Promise<{ facts: CvFact[]; provider: "mock" | "groq" }> {
  if (options.groqApiKey) {
    try {
      const facts = await extractFactsGroq(text, options.groqApiKey, undefined, onUsage);
      if (facts.length > 0) return { facts, provider: "groq" };
    } catch {
      // Fall through to the mock extractor — parsing must never block
      // the user's onboarding (manual fallback is the last resort).
    }
  }
  return { facts: extractFactsMock(text), provider: "mock" };
}
