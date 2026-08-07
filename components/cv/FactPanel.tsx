"use client";

import { useState } from "react";
import { FACT_KINDS, type CvFact, type FactKind } from "@/lib/cv/types";

const KIND_LABELS: Record<FactKind, string> = {
  role: "Roles",
  skill: "Skills",
  outcome: "Outcomes",
  education: "Education",
};

const KIND_HINTS: Record<FactKind, string> = {
  role: "e.g. Product Designer (2021–2024)",
  skill: "e.g. Figma, TypeScript, user testing",
  outcome: "e.g. Cut onboarding time by 30%",
  education: "e.g. MSc Data Science, Lancaster University",
};

/**
 * Parsed-facts panel (TASK-104 exit criterion: "upload CV, see parsed
 * facts"). Facts group by kind; each is removable. When parsing yielded
 * nothing usable, the manual fallback form takes over.
 */
export function FactPanel({
  facts,
  provider,
  onRemove,
  onManualAdd,
  onDone,
}: {
  facts: CvFact[];
  provider: "mock" | "groq";
  onRemove: (index: number) => void;
  onManualAdd: (kind: FactKind, content: string) => Promise<boolean>;
  onDone: () => void;
}) {
  const [manualKind, setManualKind] = useState<FactKind>("skill");
  const [manualText, setManualText] = useState("");
  const [manualBusy, setManualBusy] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const empty = facts.length === 0;

  async function submitManual() {
    const content = manualText.trim();
    if (content.length < 2) return;
    setManualBusy(true);
    setManualError(null);
    const ok = await onManualAdd(manualKind, content);
    setManualBusy(false);
    if (ok) setManualText("");
    else setManualError("Could not save that fact — please try again.");
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="m-0 text-base">
          {empty ? "Nothing found in your CV yet" : "What we found in your CV"}
        </h3>
        <span className="text-[10px] font-[650] uppercase tracking-[0.08em] text-muted">
          {provider === "groq" ? "AI parse" : "draft parse"}
        </span>
      </div>

      {empty ? (
        <p className="mb-3 mt-0 text-xs leading-[1.45] text-muted">
          The draft parser couldn&apos;t pull facts from this file. Add the
          important ones below — the real parser unlocks when the AI key is
          configured.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-2 p-0">
          {FACT_KINDS.map((kind) => {
            const group = facts.filter((f) => f.kind === kind);
            if (group.length === 0) return null;
            return (
              <li key={kind} className="m-0 p-0">
                <p className="mb-1 mt-0 text-[10px] font-[760] uppercase tracking-[0.1em] text-rose-ink">
                  {KIND_LABELS[kind]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.map((fact, i) => {
                    const globalIndex = facts.indexOf(fact);
                    return (
                      <span
                        key={`${fact.content}-${i}`}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-ink"
                      >
                        <span className="truncate">{fact.content}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${fact.content}`}
                          onClick={() => onRemove(globalIndex)}
                          className="grid size-4 shrink-0 place-items-center rounded-full bg-quiet text-[10px] leading-none text-muted hover:bg-rose-soft hover:text-rose-ink"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 grid gap-2 rounded-[14px] border border-line bg-paper p-3">
        <div className="grid grid-cols-[110px_1fr] gap-2">
          <select
            aria-label="Fact kind"
            value={manualKind}
            onChange={(e) => setManualKind(e.target.value as FactKind)}
            className="h-[44px] rounded-xl border border-line bg-paper px-2 text-xs text-ink outline-none focus:border-rose"
          >
            {FACT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {KIND_LABELS[kind]}
              </option>
            ))}
          </select>
          <input
            aria-label="Fact content"
            placeholder={KIND_HINTS[manualKind]}
            value={manualText}
            maxLength={280}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submitManual();
            }}
            className="h-[44px] w-full rounded-xl border border-line bg-paper px-3 text-xs text-ink outline-none focus:border-rose"
          />
        </div>
        {manualError ? (
          <p role="alert" className="m-0 text-[10px] font-[650] text-red">
            {manualError}
          </p>
        ) : null}
        <button
          type="button"
          disabled={manualBusy || manualText.trim().length < 2}
          onClick={() => void submitManual()}
          className="min-h-[44px] rounded-xl border border-ink bg-ink px-3 text-xs font-[710] text-white disabled:opacity-40"
        >
          {manualBusy ? "Saving…" : "Add fact manually"}
        </button>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-3 min-h-[44px] w-full rounded-xl border border-rose bg-rose-soft text-[13px] font-[710] text-rose-ink"
      >
        {empty ? "Skip — I&apos;ll edit facts later" : "These look right"}
      </button>
    </div>
  );
}
