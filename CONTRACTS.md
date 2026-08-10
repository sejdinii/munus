# CONTRACTS.md — frozen interfaces between orchestrator, implementers, and phases
# Source of pixel truth: prototypes/jobswipe5.html (user-uploaded 2026-08-08,
# supersedes munus-liquid-glass-mock.jsx — same glass system plus the full app
# pattern set: brand-pill header, progress dots, X+"Next →" onboarding nav,
# SAVED/SKIP stamps, doc-status rows, green apply-class actions, bottom-sheet
# application review, gold count badges). Template semantics MATCH product
# truth (right = save; apply from Saved behind review). scout-pink-v2.html
# still binds FLOWS and COPY where the template is silent.
# Change policy: orchestrator edits this file alone; implementers request changes
# via their wave report. Deviating from the mock needs a written reason here.
#
# §1 v2 — LIQUID GLASS (implemented in src/app/globals.css):
# Ground: #8a9aaa with CSS atmosphere (soft radial clouds, fixed attachment).
# Surfaces: .liquid-glass (white .01 fill, blur 4, inset highlight) and
# .liquid-glass-selected (white .12, blur 8) with gradient hairline borders
# via mask-composite. Text: white opacity tiers (.9/.85/.75/.7/.6/.5/.45/.4).
# Accent: gold rgba(220,200,80,.9) = verification/saving/forward motion
# (glow on the committing action only). Semantics: ok rgba(134,220,150,.95),
# bad rgba(255,130,130,.95). Type: Helvetica Neue stack, display w400 with
# -0.02..-0.03em tracking, 26px phone titles; labels w500-600. Geometry:
# pills (9999) for controls/chips/tabs, 20 rows, 24-32 cards. Motion: staggered
# .fade-up (16px rise, .5s cubic-bezier(.22,1,.36,1)), press scale .97.
# PRODUCT-TRUTH OVERRIDE: the mock's swipe-right-to-apply is design fiction —
# right = save; applying stays behind preflight review.
# Legacy v1 token names alias into this world (see globals.css) so older
# markup re-skins without churn.
#
# The v1 PINK section below is RETIRED — kept for history only.

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

Shadows: page card `0 13px 34px rgba(31,32,38,.09)`; sheet `0 -12px 40px rgba(24,20,22,.18)`;
hard-offset art shadow `5px 6px 0 var(--ink)` (orbit cards, pop badges).

DEVIATION (2026-08-08, recorded per change policy): the prototype's pink theme
hides the welcome orbit art and strips hard-offset shadows — that produced
wireframe-empty screens in the real app. We recolor the art into the pink
palette instead of hiding it (orbit: rose card + butter pop + sky card, ink
borders and offsets; sign-in: the ready-screen rose/sky/paper card stack).
Palette choice must never delete structural richness. Content-light screens
each carry one intentional art moment.
Font: system stack `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`, antialiased.

Type scale (size / weight / letter-spacing):
- Display XL 49/700/-.065em (welcome) · Display 38/700/-.055em (ready) · Question 35/700/-.05em
- Page title 34/700/-.055em · Card job title 29/700/-.05em · Section h2 27/700/-.045em
- Empty h2 26/700/-.045em · Screen h1 (topbar) 16/720
- Body 13/400-620 · Support 11-12/650 · Fine print 9-10/650-750
- Overline: 11/760, letter-spacing .1em, uppercase, --rose-ink
Display headings use the browser-default 700 — the prototype declares no weight
on them. The non-standard weights (620/650/710/720/750/760/790/800/850) belong
to UI elements (buttons, chips, labels, monograms) where the prototype declares
them explicitly — keep those exact.

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
src/lib/auth/      AuthProvider   = supabase | dev        (env: NEXT_PUBLIC_SUPABASE_URL set → supabase)
src/lib/facts/     FactsExtractor = groq | heuristic      (env: GROQ_API_KEY set → groq)
src/lib/store/     Store          = supabase | dev-file   (profile+facts+CV storage live together;
                                                           a separate CvStorage seam was folded in — bw0)
```
Rules: UI code imports the interface, never a concrete adapter. Adapter
selection happens in one place per service (`index.ts` of that lib). Dev
adapters must exercise the SAME screens/states as real ones — no dev-only UI
branches that alter behavior; a short informational label telling the user
they're on a simulated session is allowed (honesty beats invisibility), but a
dev path may never fake a success the real adapter wouldn't produce. The dev
session refuses to mint on production builds unless SCOUT_ALLOW_DEV_AUTH=1.

## 4. Component inventory (src/components/ui — orchestrator-owned)

Status column: BUILT (bw0) or PLANNED (build in the wave that first needs it;
CSS may already exist).

| Component | API | Prototype source | Status |
|---|---|---|---|
| Button / ButtonLink | variant: primary·dark·outline·plain, size: md·sm, loading | .btn* | BUILT |
| Choice | selected, onSelect, children | .choice | BUILT |
| TextField | label, error, hint, inputMode | .text-field + .field-label | BUILT |
| Progress | value 0-1 | .progress | BUILT |
| Overline / Wordmark | children | .overline, .wordmark | BUILT |
| EmptyState | symbol, title, body, actions | .empty-state | BUILT |
| Generating | label, sublabel | .generating | BUILT |
| Screen / TopBar | title, backHref | .screen, .topbar | BUILT |
| UploadBox | currently inline in onboarding-flow; extract when a second screen needs it | .upload-box | PLANNED |
| Toast | useToast(): show(msg, action?) — CSS shipped, hook not | .toast | PLANNED (deck wave) |
| MetaChip · ReadyChip · SourcePill | text (+ tone) — .meta-chip CSS shipped, used raw | .meta-chip etc. | PLANNED (deck wave) |

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
