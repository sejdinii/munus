/* THE VERIFIER — CONTRACTS.md §3.1: a BLOCKING gate, not a warning.
   Every suggestion entering the UI must cite at least one fact id, and
   every cited id must exist in the evidence store. Anything else is
   dropped and logged. This module is deliberately boring, deterministic,
   and dependency-free: the trust guarantee must not hinge on model
   behavior. Zero escapes is a launch KPI (plan §6). */

import type { Fact, Suggestion, TailorResult, VerifiedResult, VerifierDrop } from "./types";

export function verify(result: TailorResult, facts: Fact[]): VerifiedResult {
  const known = new Set(facts.map((f) => f.id));
  const suggestions: Suggestion[] = [];
  const dropped: VerifierDrop[] = [];

  for (const suggestion of result.suggestions) {
    if (suggestion.factIds.length === 0) {
      dropped.push({ suggestion, reason: "no-evidence-cited" });
      continue;
    }
    if (!suggestion.factIds.every((id) => known.has(id))) {
      dropped.push({ suggestion, reason: "unknown-fact-id" });
      continue;
    }
    suggestions.push(suggestion);
  }

  if (dropped.length > 0) {
    /* The drop log is the audit trail behind "zero verifier escapes".
       Server-side this becomes a logged metric; client mock logs to
       console so escapes are visible during development. */
    console.warn(
      `[verifier] dropped ${dropped.length} unverifiable suggestion(s):`,
      dropped.map((d) => `${d.suggestion.id}:${d.reason}`).join(", "),
    );
  }

  return { suggestions, dropped };
}
