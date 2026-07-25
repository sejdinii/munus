"use client";

/* Career profile — the evidence store screen (CONTRACTS §2 `facts` table,
   §3.1 evidence-only AI: this is the trust story's anchor, what the AI is
   allowed to know). Outside the (tabs) group by design, matching the other
   detail screens (app/jobs/[id], app/applications/[id]): own Topbar + back,
   no tabbar. Facts are a static import (lib/studio/facts mockFacts) — there
   is no fetch, so the only real async state is store hydration for the CV
   status meta line; facts themselves get a defensive EmptyState if the
   list were ever empty (it never is in the mock, but a real CV-parse
   failure could produce zero facts). */

import { EmptyState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
import { Topbar } from "@/components/ui/Topbar";
import { useToast } from "@/components/ui/Toast";
import { mockFacts } from "@/lib/studio/facts";
import type { Fact, FactKind } from "@/lib/studio/types";
import { useMunusStore } from "@/lib/mock/store";
import { FactSection } from "./FactSection";

const GROUPS: Array<{ kind: FactKind; label: string }> = [
  { kind: "role", label: "Roles" },
  { kind: "outcome", label: "Outcomes" },
  { kind: "skill", label: "Skills" },
  { kind: "education", label: "Education" },
];

function groupByKind(facts: Fact[]) {
  return GROUPS.map((group) => ({
    ...group,
    facts: facts.filter((fact) => fact.kind === group.kind),
  }));
}

export default function CareerProfilePage() {
  const { hydrated, onboarding } = useMunusStore();
  const { showToast } = useToast();

  if (!hydrated) return <LoadingState label="Loading your evidence store" />;

  const grouped = groupByKind(mockFacts);

  return (
    <section className="screen-in flex flex-1 flex-col">
      <Topbar title="Career profile" backHref="/profile" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="pb-[18px] pt-1">
          <h1 className="m-0 text-[34px] leading-[1.04] tracking-[-0.055em]">
            Your evidence store
          </h1>
          <p className="mt-[5px] text-xs leading-[1.4] text-muted">
            Everything the AI is allowed to work from. Nothing else exists to
            it.
          </p>
          <p className="mt-2.5 text-[10px] font-[650] text-muted">
            {onboarding.cvUploaded ? "CV added" : "No CV yet"} ·{" "}
            {mockFacts.length} fact{mockFacts.length === 1 ? "" : "s"} on file
          </p>
        </div>

        <div className="mb-1 rounded-[14px] border border-[#e7cfa0] bg-[#fff6e6] px-3.5 py-3 text-[11px] leading-[1.4] text-amber">
          <strong className="font-[720]">Sample data</strong> — your real CV
          replaces this when accounts arrive.
        </div>

        {mockFacts.length === 0 ? (
          <EmptyState
            symbol="!"
            tone="ink"
            title="No evidence yet"
            body="Upload your CV so Munus has verified facts to match and tailor from."
          >
            <LinkButton href="/onboarding" variant="dark" className="w-full">
              Upload your CV
            </LinkButton>
          </EmptyState>
        ) : (
          grouped.map((group) => (
            <FactSection key={group.kind} label={group.label} facts={group.facts} />
          ))
        )}
      </div>

      <footer className="sticky bottom-0 grid gap-2.5 border-t border-line bg-paper/95 px-[18px] pb-5 pt-3 backdrop-blur-[18px]">
        <LinkButton href="/onboarding" variant="primary" className="w-full">
          Update your CV
        </LinkButton>
        <Button
          variant="plain"
          className="w-full"
          onClick={() =>
            showToast(
              "Every AI suggestion must cite one of these facts — anything else is dropped.",
            )
          }
        >
          How evidence-only works
        </Button>
      </footer>
    </section>
  );
}
