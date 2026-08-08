/* Minimal prop-level types for components/studio/** — these components are
   pure presentational (props in, callbacks out) and intentionally import
   nothing from lib/mock. The caller (the studio screen, owned by the
   orchestrator) maps its own store/data shapes onto these before handing
   props down. */

export type StudioTab = "cv" | "letter";

/** One AI suggestion row — matches the prototype's studioSuggestions()
 * shape (id, label, text, evidence) plus the per-row accepted flag that
 * SuggestionCard needs as a prop. */
export type StudioSuggestion = {
  id: string;
  label: string;
  text: string;
  evidence: string;
  accepted: boolean;
};
