"use client";

/* AI Application Studio — ORCHESTRATOR-OWNED (CONTRACTS §6, the trust
   moat's screen). Prototype renderStudio()/renderGuideSheet() under the
   pink theme. All suggestions arrive exclusively through
   lib/studio/pipeline.generateKit (provider → verifier → UI); this screen
   cannot skip the gate. Mock provider until GROQ_API_KEY exists (D17).

   Sanctioned addition (D20 pending record): a "Download PDF kit" action —
   W3's exit criterion is generate → accept → DOWNLOAD; the prototype defers
   export to preflight, which ships next wave. */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
import { Topbar } from "@/components/ui/Topbar";
import { useToast } from "@/components/ui/Toast";
import { SparkIcon } from "@/components/ui/icons";
import {
  DocLines,
  DocPreview,
  GeneratingState,
  GroundingNote,
  ReadinessBar,
  SegmentedTabs,
  SuggestionCard,
  ToneSheet,
} from "@/components/studio";
import { jobById } from "@/lib/mock/jobs";
import { useMunusStore } from "@/lib/mock/store";
import { mockFacts } from "@/lib/studio/facts";
import { mockTailorProvider } from "@/lib/studio/mockProvider";
import { generateKit } from "@/lib/studio/pipeline";
import { composeCvDocument, composeLetterDocument } from "@/lib/studio/compose";
import type { VerifiedResult } from "@/lib/studio/types";

const TONES = ["Shorter", "More formal", "More direct", "Warmer"];
const TABS = [
  { value: "cv" as const, label: "CV" },
  { value: "letter" as const, label: "Cover letter" },
];

export default function StudioPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const store = useMunusStore();
  const { showToast } = useToast();

  const [tab, setTab] = useState<"cv" | "letter">("cv");
  const [generating, setGenerating] = useState(false);
  const [kit, setKit] = useState<VerifiedResult | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingTone, setPendingTone] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [generateError, setGenerateError] = useState(false);
  const regenerated = useRef(false);

  const job = jobById(jobId);
  const st = store.studio[jobId];
  const accepted = st?.accepted ?? [];
  const generated = st?.generated ?? false;
  const tone = st?.tone ?? null;

  const runGenerate = useCallback(
    async (nextTone: string | null, announce?: string) => {
      if (!job) return;
      setGenerating(true);
      setGenerateError(false);
      try {
        const result = await generateKit(
          mockTailorProvider,
          job,
          mockFacts,
          nextTone,
        );
        setKit(result);
        store.setStudio(job.id, { generated: true, tone: nextTone });
        if (announce) showToast(announce);
      } catch {
        setGenerateError(true);
      } finally {
        setGenerating(false);
      }
    },
    [job, store, showToast],
  );

  /* Returning to an already-generated kit (deterministic mock): rebuild it
     quietly once, with the honest generating state visible. */
  useEffect(() => {
    if (job && generated && !kit && !generating && !regenerated.current) {
      regenerated.current = true;
      void runGenerate(tone);
    }
  }, [job, generated, kit, generating, tone, runGenerate]);

  if (!store.hydrated) return <LoadingState label="Opening the studio" />;

  if (!job) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <Topbar title="Application studio" backHref="/favorites" />
        <ErrorState
          title="Role not found"
          body="This studio link points at a role that no longer exists."
        >
          <LinkButton href="/favorites" variant="dark" className="w-full">
            Back to favorites
          </LinkButton>
        </ErrorState>
      </section>
    );
  }

  const cvSuggestions = kit?.suggestions.filter((s) => s.docKind === "cv") ?? [];
  const letterSuggestions =
    kit?.suggestions.filter((s) => s.docKind === "letter") ?? [];
  const openCount = cvSuggestions.filter((s) => !accepted.includes(s.id)).length;
  const readyCount = 1 + (generated ? 1 : 0) + (generated && accepted.length >= 2 ? 1 : 0);

  const toggleAccept = (id: string, accept: boolean) => {
    const next = accept
      ? accepted.includes(id)
        ? accepted
        : [...accepted, id]
      : accepted.filter((a) => a !== id);
    store.setStudio(job.id, { accepted: next });
    showToast(accept ? "Change accepted" : "Original wording kept");
  };

  const acceptedSuggestions =
    kit?.suggestions.filter((s) => accepted.includes(s.id)) ?? [];

  const downloadKit = async () => {
    if (!kit) return;
    setExporting(true);
    try {
      const { renderCvPdf, renderLetterPdf, downloadBlob } = await import(
        "@/lib/pdf/render"
      );
      const cvDoc = composeCvDocument(
        mockFacts,
        acceptedSuggestions,
        store.onboarding.role,
      );
      const letterDoc = composeLetterDocument(job, kit, acceptedSuggestions);
      downloadBlob(await renderCvPdf(cvDoc), `CV-${job.company}.pdf`);
      downloadBlob(await renderLetterPdf(letterDoc), `Letter-${job.company}.pdf`);
      showToast("PDF kit downloaded — evidence-checked");
    } catch {
      showToast("PDF export failed — try again");
    } finally {
      setExporting(false);
    }
  };

  let content: React.ReactNode;
  if (generating) {
    content = (
      <GeneratingState
        title="Grounding your documents"
        body={
          "Comparing the job with your verified career profile.\nNo new claims will be created."
        }
      />
    );
  } else if (generateError) {
    content = (
      <ErrorState
        title="Generation failed"
        body="Something went wrong while tailoring. Your facts are untouched — try again."
      >
        <Button variant="dark" className="w-full" onClick={() => runGenerate(tone)}>
          Try again
        </Button>
      </ErrorState>
    );
  } else if (!generated || !kit) {
    content = (
      <>
        <GroundingNote>
          <strong>Evidence-only mode is on.</strong>
          <br />
          Munus can sharpen wording and emphasis, but cannot add skills or
          outcomes missing from your career profile.
        </GroundingNote>
        <DocPreview
          title={tab === "cv" ? "Your CV" : "Cover letter"}
          status={<span className="text-[9px] text-muted">Original</span>}
        >
          <h3 className="m-0 text-lg">Your career profile</h3>
          <span className="text-[9px] text-muted">
            {mockFacts.length} verified facts · sample data
          </span>
          <DocLines count={3} />
          <DocLines count={3} className="mt-[25px]" />
        </DocPreview>
      </>
    );
  } else if (tab === "cv") {
    content = (
      <>
        <GroundingNote>
          All suggested claims are traceable to your CV.
          {kit.dropped.length > 0
            ? ` ${kit.dropped.length} unverifiable suggestion(s) were dropped by the verifier.`
            : " Nothing was invented; anything unverifiable is dropped."}
        </GroundingNote>
        <DocPreview
          title="Your CV"
          status={
            <span className="text-[9px] text-green">
              {openCount > 0 ? `${openCount} open suggestions` : "All reviewed"}
            </span>
          }
        >
          <h3 className="m-0 text-lg">Your career profile</h3>
          <span className="text-[9px] text-muted">
            {mockFacts.length} verified facts · sample data
          </span>
          {cvSuggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              label={s.label}
              text={s.text}
              evidence={s.evidenceLabel}
              accepted={accepted.includes(s.id)}
              onAccept={() => toggleAccept(s.id, true)}
              onKeepOriginal={() => toggleAccept(s.id, false)}
            />
          ))}
          <DocLines count={3} className="mt-[22px]" />
        </DocPreview>
      </>
    );
  } else {
    const toneNote = tone ? ` · rewritten ${tone.toLowerCase()}` : "";
    content = (
      <>
        <GroundingNote>
          Drafted from your verified experience and the employer’s published
          requirements{toneNote}.
        </GroundingNote>
        <DocPreview
          title="Cover letter"
          status={<span className="text-[9px] text-green">Draft ready</span>}
        >
          {kit.letterParagraphs.slice(0, -1).map((p) => (
            <p key={p} className="mt-0 text-[11px] leading-[1.55]">
              {p}
            </p>
          ))}
          {letterSuggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              label={s.label}
              text={s.text}
              evidence={s.evidenceLabel}
              accepted={accepted.includes(s.id)}
              onAccept={() => toggleAccept(s.id, true)}
              onKeepOriginal={() => toggleAccept(s.id, false)}
            />
          ))}
          <p className="mt-3 text-[11px] leading-[1.55]">
            {kit.letterParagraphs[kit.letterParagraphs.length - 1]}
          </p>
        </DocPreview>
      </>
    );
  }

  return (
    <section className="screen-in flex flex-1 flex-col">
      <Topbar title="Application studio" backHref="/favorites" />
      <header className="px-5 pb-4">
        <p className="m-0 mb-[5px] text-[11px] font-[760] uppercase tracking-[0.1em] text-rose-ink">
          {job.company}
        </p>
        <h2 className="m-0 text-[27px] leading-[1.05] tracking-[-0.045em]">
          {job.title}
        </h2>
        <ReadinessBar ready={readyCount} />
      </header>
      <div className="mx-5 mb-[13px]">
        <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-[3px]">
        {content}
      </div>
      <footer className="grid gap-2 border-t border-line bg-paper/95 px-[18px] pb-5 pt-[11px] backdrop-blur-[18px]">
        {generated && kit ? (
          <>
            <Button
              variant="primary"
              onClick={() =>
                showToast("Preflight review arrives in the next wave")
              }
            >
              Review application
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button small disabled={exporting} onClick={downloadKit}>
                {exporting ? "Exporting…" : "Download PDF kit"}
              </Button>
              <Button
                small
                variant="plain"
                onClick={() => {
                  setPendingTone(null);
                  setSheetOpen(true);
                }}
              >
                Regenerate with guidance
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="primary"
            disabled={generating}
            onClick={() => runGenerate(tone)}
          >
            <SparkIcon /> Tailor both documents
          </Button>
        )}
      </footer>
      <ToneSheet
        open={sheetOpen}
        tones={TONES}
        selected={pendingTone}
        onSelect={setPendingTone}
        onRegenerate={() => {
          setSheetOpen(false);
          if (pendingTone) {
            void runGenerate(
              pendingTone,
              `Rewritten — ${pendingTone.toLowerCase()}, facts unchanged`,
            );
          }
        }}
        onCancel={() => setSheetOpen(false)}
      />
    </section>
  );
}
