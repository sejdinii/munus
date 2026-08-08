import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { store } from "@/lib/store";
import type { Fact, FactKind } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Screen, TopBar } from "@/components/ui/screen";
import { EmptyState, GroundingNote } from "@/components/ui/states";

// The evidence store, visible. Built from the prototype's detail-screen
// patterns (page-title, section, reason-row → fact-row, grounding-note).

const KIND_ORDER: FactKind[] = ["role", "outcome", "skill", "education"];
const KIND_LABELS: Record<FactKind, string> = {
  role: "Experience",
  outcome: "Outcomes",
  skill: "Skills",
  education: "Education",
};

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** A source span already contained in the fact's content adds only noise. */
function spanAddsContext(content: string, sourceSpan: string | null): boolean {
  if (!sourceSpan) return false;
  const normalize = (s: string) =>
    s.replace(/^[-–—•*·▪\s]+/, "").replace(/\s+/g, " ").trim().toLowerCase();
  return !normalize(content).includes(normalize(sourceSpan));
}

export default async function FactsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const [facts, cvMeta] = await Promise.all([
    store.listFacts(user.id),
    store.getCvMeta(user.id),
  ]);

  if (facts.length === 0) {
    return (
      <Screen>
        <TopBar title="Career profile" backHref="/" />
        <EmptyState
          symbol={<Icon name="spark" size={27} />}
          title="No verified facts yet"
          body="Upload your CV and we'll turn it into the evidence store that powers matching and tailoring."
        >
          <ButtonLink variant="primary" href="/onboarding">
            Add your CV
          </ButtonLink>
        </EmptyState>
      </Screen>
    );
  }

  const grouped = new Map<FactKind, Fact[]>();
  for (const kind of KIND_ORDER) grouped.set(kind, []);
  for (const fact of facts) grouped.get(fact.kind)?.push(fact);

  return (
    <Screen>
      <TopBar title="Career profile" backHref="/onboarding" />
      <div className="page-title" style={{ paddingTop: 0 }}>
        <h1>Your evidence</h1>
        <p>
          {facts.length} facts extracted from your CV — the only source AI is
          allowed to work from.
        </p>
      </div>
      <div className="screen-scroll" style={{ paddingTop: 0 }}>
        <GroundingNote>
          <strong>Evidence-only mode is on.</strong>
          <br />
          Scout can reframe and emphasize what&rsquo;s here, but can never add
          skills or outcomes that aren&rsquo;t. Wrong or missing? Replace your
          CV and we re-extract.
        </GroundingNote>

        {cvMeta ? (
          <div className="file-card">
            <span className="file-badge">
              {(cvMeta.fileName.split(".").pop() ?? "cv").toUpperCase().slice(0, 4)}
            </span>
            <div>
              <strong>{cvMeta.fileName}</strong>
              <span>
                {cvMeta.fileSize > 0 ? `${formatSize(cvMeta.fileSize)} · ` : ""}source of truth
              </span>
            </div>
            <ButtonLink size="sm" variant="plain" href="/onboarding">
              Replace
            </ButtonLink>
          </div>
        ) : null}

        {KIND_ORDER.map((kind) => {
          const rows = grouped.get(kind) ?? [];
          if (rows.length === 0) return null;
          return (
            <section key={kind} className="section">
              <h2>
                {KIND_LABELS[kind]}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 650 }}>· {rows.length}</span>
              </h2>
              {kind === "skill" ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {rows.map((fact) => (
                    <span key={fact.id} className="meta-chip" title={fact.sourceSpan ?? undefined}>
                      {fact.content}
                    </span>
                  ))}
                </div>
              ) : (
                rows.map((fact) => (
                  <div key={fact.id} className="fact-row">
                    <span className="fact-dot" aria-hidden="true">
                      <Icon name="check" size={11} />
                    </span>
                    <span>
                      {fact.content}
                      {spanAddsContext(fact.content, fact.sourceSpan) ? (
                        <span className="fact-source">from “{fact.sourceSpan}”</span>
                      ) : null}
                    </span>
                  </div>
                ))
              )}
            </section>
          );
        })}

        <section className="section">
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="btn btn-plain btn-small" style={{ color: "var(--red)" }}>
              Sign out
            </button>
          </form>
        </section>
      </div>
    </Screen>
  );
}
