# CONTRACTS.md — frozen interfaces between orchestrator, implementers, and phases
# Source of pixel truth: prototypes/scout-pink-v2.html, PINK theme.
# Change policy: orchestrator edits this file alone; implementers request changes
# via their wave report. Deviating from the prototype needs a written reason here.

## 1. Design tokens (resolved PINK theme values)

Colors (CSS custom properties, defined once in `src/app/globals.css`):
| Token | Value | Use |
|---|---|---|
| --rose | #f20c78 | forward motion + saving ONLY — never decorative |
| --rose-ink | #b90056 | text on rose-soft, selected states |
| --rose-soft | #fff0f6 | selected fills, icon chips |
| --ink | #18181b | primary text, dark buttons |
| --muted | #6f6f75 | secondary text |
| --paper | #fffdfd | cards, sheets |
| --phone | #f8f6f6 | app background |
| --canvas | #ebe7e8 | outer/desktop background |
| --line | #e6e0e2 | hairline borders |
| --quiet | #f0ecee | subtle fills, chips |
| --green | #16794b | evidence, verified, success text |
| --green-soft | #eaf7f0 | success fills (notes use #eef8f3) |
| --amber | #a35b00 | concerns text (bg #fff7ec, body text #70471a) |
| --red | #c42c43 | destructive |
| --sky / --tangerine / --butter | #78d9ff / #ff8b5c / #ffe36e | rare accents (ready-art, toast action) |

Shadows: page card `0 13px 34px rgba(31,32,38,.09)`; sheet `0 -12px 40px rgba(24,20,22,.18)`.
Font: system stack `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`, antialiased.

Type scale (size / weight / letter-spacing):
- Display XL 49/850/-.065em (welcome) · Display 38/850/-.055em (ready) · Question 35/850/-.05em
- Page title 34/850/-.055em · Card job title 29/850/-.05em · Section h2 27/850/-.045em
- Empty h2 26/850/-.045em · Screen h1 (topbar) 16/720
- Body 13/400-620 · Support 11-12/650 · Fine print 9-10/650-750
- Overline: 11/760, letter-spacing .1em, uppercase, --rose-ink
Weights are non-standard on purpose (620/650/720/750/760/800/850) — keep exact.

Radii: chips 7-9 · buttons/fields/choices 12-15 · tiles 17-22 · cards 25-28 · circles 50%.
Buttons: min-height 52 (md) / 40 (sm); radius 15/12; weight 710.
Screen padding: 20-24px horizontal; safe-area bottom padding on footers.

## 2. Data shapes (mirror of supabase/migrations — TS types in src/lib/types.ts)

```ts
type Plan = "free" | "plus";
type Profile = { id: string; name: string | null; email: string; roleTarget: string | null;
  level: string | null; locations: string[]; remoteOk: boolean; salaryMin: number | null;
  currency: string; alerts: string | null; cvPath: string | null; plan: Plan;
  stripeCustomerId: string | null; createdAt: string };
type FactKind = "role" | "skill" | "outcome" | "education";
type Fact = { id: string; profileId: string; kind: FactKind; content: string;
  sourceSpan: string | null; createdAt: string };            // the evidence store
type Company = { id: string; name: string; slug: string; ats: string; feedUrl: string; active: boolean };
type Job = { id: string; companyId: string; externalId: string; title: string; location: string;
  remote: boolean; salaryMin: number | null; salaryMax: number | null; currency: string | null;
  description: string; applyUrl: string; postedAt: string; verifiedAt: string; open: boolean };
type Decision = { id: string; profileId: string; jobId: string; type: "save" | "pass" | "star"; at: string };
type JobMatch = { profileId: string; jobId: string; score: number; reasons: string[];
  concern: string | null; cachedAt: string };
type DocumentKind = "cv" | "letter";
type TailoredDocument = { id: string; profileId: string; jobId: string; kind: DocumentKind;
  content: unknown; accepted: string[]; tone: string | null; pdfPath: string | null; updatedAt: string };
type ApplicationStatus = "prepared" | "opened" | "confirmed";
type Application = { id: string; profileId: string; jobId: string; status: ApplicationStatus;
  confirmedAt: string | null; receipt: unknown };
type Usage = { profileId: string; weekStart: string; swipes: number; gensToday: number; day: string };
```

## 3. Service adapters (every external dependency sits behind one)

```
src/lib/auth/      AuthProvider   = supabase | dev      (env: NEXT_PUBLIC_SUPABASE_URL set → supabase)
src/lib/facts/     FactsExtractor = groq | heuristic    (env: GROQ_API_KEY set → groq)
src/lib/storage/   CvStorage      = supabase | local    (dev: scratchpad/base64 in cookie-backed store)
```
Rule: UI code imports the interface, never a concrete adapter. Adapter selection
happens in one place per service (`index.ts` of that lib). Dev adapters must
exercise the SAME screens/states as real ones — no dev-only UI branches.

## 4. Component inventory (src/components/ui — orchestrator-owned)

| Component | API | Prototype source |
|---|---|---|
| Button | variant: primary·dark·outline·plain, size: md·sm, loading | .btn* |
| Choice | selected, onSelect, children | .choice |
| TextField | label, error, inputMode | .text-field + .field-label |
| UploadBox | state: idle·uploaded·error, fileMeta, onPick | .upload-box |
| Progress | value 0-1 | .progress |
| Overline | children | .overline |
| EmptyState | symbol, title, body, actions | .empty-state |
| Spinner / Generating | label, sublabel | .generating |
| Toast | useToast(): show(msg, action?) | .toast |
| Screen / TopBar | title, back href | .screen, .topbar |
| MetaChip · ReadyChip · SourcePill | text (+ tone for ReadyChip) | .meta-chip etc. |

## 5. Folder structure & FILE OWNERSHIP

```
src/app/                 layout.tsx, globals.css, page.tsx (welcome)   [SHARED — orchestrator only]
src/app/sign-in/                                                      [slice: auth]
src/app/onboarding/                                                   [slice: onboarding]
src/app/profile/facts/   parsed-facts review                          [slice: facts]
src/app/discover|favorites|studio|apply|applications/                 [later waves, one slice each]
src/app/api/<service>/                                                [owned by the slice owning the service]
src/components/ui/       design system                                [SHARED — orchestrator only]
src/lib/types.ts, env.ts, auth/, storage/                             [SHARED — orchestrator only]
src/lib/facts/, ingest/, match/, studio/                              [one slice each]
supabase/migrations/                                                  [SHARED — orchestrator only]
FEATURES.md · BACKLOG.md · CONTRACTS.md · package.json · configs      [SHARED — orchestrator only]
```
Two slices never touch the same path. Shared-file changes (new routes, deps,
tokens) are REQUESTED in wave reports and applied by the orchestrator at checkpoints.
