# FEATURES.md — single source of truth for what exists
# The agent maintains this file. Humans read it. Neither trusts memory.
# Status values: DONE (built + verified running) | PARTIAL (built, missing states/edge cases)
#                STUB (placeholder/mock only) | MISSING (not started) | BLOCKED (needs user decision)
# RULE: nothing gets marked DONE without being run/tested in this session.
# Product: Munus (renamed from Scout 2026-08-08) — swipe-based job discovery PWA.
# Spec: docs/SCOUT_MVP_PLAN.md (pre-rename doc; product truths unchanged)
# Design spec (pixel truth): prototypes/scout-pink-v2.html (pink theme)

## MVP Definition of Done
The Scout MVP is DONE when: the app boots with zero errors; every CORE flow below
is DONE (not PARTIAL); every screen has loading/empty/error states; and the
critical-path demo (onboard → swipe real jobs → save → tailor with evidence →
preflight → redirect apply → receipt) runs end-to-end on a phone without a crash.

## CORE FLOWS (MVP-blocking) — build phases 0-5 in docs/SCOUT_MVP_PLAN.md
| Feature | Status | Verified how | Notes |
|---|---|---|---|
| Repo scaffold (Next.js, TS strict, Tailwind, tokens) | DONE | prod build boots; screens screenshot-verified at 430/900px | Next 16.3, Tailwind v4, tokens from pink prototype |
| CI (lint + typecheck + build) | DONE | GitHub Actions run #69 green on this branch | .github/workflows/ci.yml |
| Supabase schema + migrations + RLS | PARTIAL | SQL written+reviewed; NOT applied — container network policy blocks supabase.co | apply with `supabase db push` from a permitted machine |
| Auth: Google/Apple sign-in | PARTIAL | dev-session flow E2E-verified (guards, sign-in/out, returning-user routing); OAuth wiring typechecked only | needs: migration applied + Google/Apple providers enabled in Supabase dashboard; keyless prod builds refuse dev sessions unless SCOUT_ALLOW_DEV_AUTH=1 |
| CV upload → parsed facts store (evidence source) | PARTIAL | E2E on prod build: PDF+TXT upload, 422/401 paths, facts render, screenshots | heuristic extractor verified; Groq extractor + Supabase storage adapter unverified (no key / network) |
| Onboarding (6 questions → profile) | DONE | prod-build E2E + screenshots; salary validation, required CV, prefill on return | prototype screens 02, pixel-faithful |
| Job ingestion (Greenhouse/Lever pullers, dedupe, freshness) | PARTIAL | pipeline E2E on fixtures: both adapters, dedupe across re-runs, verified_at refresh, salary/remote normalization, health tracking, /api/ingest + Vercel cron | live pull unverified — container network blocks ATS hosts; 'done means 3-5k live jobs' needs a network-permitted run |
| Matching (embeddings + rules; reasons + concern) | MISSING | — | phase 2 |
| Discover deck (swipe/buttons/star/undo/detail, pixel-exact) | MISSING | — | phase 2 |
| Favorites + readiness chips + still-open checks | MISSING | — | phase 3 |
| AI studio: evidence-only tailoring + verifier + accept/keep | MISSING | — | phase 3; verifier is a blocking gate |
| PDF export (tailored CV + letter) | MISSING | — | phase 3 |
| Preflight review → redirect apply → return-confirm | MISSING | — | phase 4 |
| Applications list + receipts + timeline | MISSING | — | phase 4 |
| Usage metering (server-side; Free limits, Plus fair-use) | MISSING | — | phase 5 |
| Stripe: Plus checkout + portal + webhooks + paywall moments | MISSING | — | phase 5 |
| Privacy/terms + GDPR export/delete | MISSING | — | phase 5; legal-blocking for launch, not for demo |
| Landing page at / (Persuade; CTA → app, pricing shown) | DONE | prod build, detector clean, screenshots 1280/500px, artifact preview published | supersedes welcome screen; CTAs session-aware |

## REQUIRED BUT NOT CORE (pre-launch)
| Feature | Status | Verified how | Notes |
|---|---|---|---|
| Empty states (deck caught-up, favorites, applications) | MISSING | — | prototype has all three designed |
| Error/offline states + retry | MISSING | — | prototype 'offline' screen |
| Out-of-swipes limit screen | MISSING | — | prototype 'limit' screen |
| Onboarding funnel polish + PWA install | MISSING | — | phase 6 |
| PostHog analytics (EU) | MISSING | — | phase 6 |
| Plans screen (Free/Plus/Pro display) | MISSING | — | prototype screen 10 |
| Notifications/alerts (freshness pings) | MISSING | — | cadence chosen in onboarding Q6 |

## DISCOVERED GAPS (agent appends here when it finds unstated requirements)
- (agent: every time you notice a missing requirement mid-build, add it here
  immediately — do not rely on remembering it later)
- 2026-08-08 · A real Supabase project IS configured in the environment env
  (URL + anon + service role + DB URL) but the build container's network policy
  denies supabase.co and :5432 — migration unapplied, real-stack unverified.
  User actions needed: run `supabase db push`, enable Google+Apple providers in
  the Supabase dashboard, widen the environment network policy (or verify from
  a deploy).
- 2026-08-08 · supabase-js logs "Unrecognized Supabase API key format" for the
  project's new-format keys (sb_publishable_/sb_secret_) — bump
  @supabase/supabase-js when a release recognizes them, and re-test auth.
- 2026-08-08 · Welcome's "Preview with sample data" CTA deferred until the
  Discover deck exists (phase 2) — pair with the soft-gate pattern logged in
  BACKLOG design intel.
- 2026-08-08 · CV upload is REQUIRED to finish onboarding (prototype shows no
  skip). If we ever want a skip path, that's a product decision — default: keep
  required, the evidence store is the product.
- 2026-08-08 · Facts screen offers re-extract via Replace CV only — no per-fact
  edit/delete. Fine for MVP; revisit if beta users flag wrong extractions.
- 2026-08-08 · sign-in/onboarding/facts currently render inside the 430px
  app-frame on desktop; real marketing/responsive desktop layouts are a
  post-MVP concern (PWA-first per plan).
- 2026-08-08 · (critic, FIXED same session) CV upload at Q5 preceded profile
  creation at Q6 → FK violation on the real stack. Fixed threefold: DB trigger
  creates profiles on auth signup (migration), supabase-store upserts a minimal
  row before saving facts, dev-store creates a profile stub. Ordering bugs like
  this only surface on the real stack — re-test there once network allows.
- 2026-08-08 · (critic) Keyless dev store writes .dev-data/ under cwd — fails
  on read-only serverless filesystems. Dev-mode demos run locally/tunneled
  only; a keyless production deploy now fails loudly at sign-in unless
  SCOUT_ALLOW_DEV_AUTH=1 is set deliberately.
- 2026-08-08 · (critic, deferred as nitpicks) UploadBox still inline in
  onboarding-flow; spinner size re-specified at 3 call sites; facts file-row
  hand-rolled; screen-scroll bottom padding 40 vs prototype 116 (no tabbar
  yet — revisit when the tabbar ships in the deck wave).

- 2026-08-08 · (user-flagged, FIXED same session) Onboarding Q1 hardcoded four
  designer titles, single-select — conflated the supply-side beachhead (which
  jobs we ingest) with the demand side (what users may ask for). Now: multi-
  select chips + free-text add, any title, up to 10; schema role_target →
  role_targets text[]. REMAINING for phase 2: when a user's roles fall outside
  beachhead catalog coverage, the deck must say so honestly (+ waitlist), not
  serve a thin deck silently. Location (Q2) is still single-select — same
  critique may apply; decide at the deck wave.

- 2026-08-08 · (user-flagged, FIXED same session) bw0 screens read as flat
  wireframes vs current Mobbin-grade apps. Root causes: pink prototype theme
  hides the orbit art + hard shadows (palette choice silently deleted
  personality — recolored back in, logged in CONTRACTS §1); Q1 chips replaced
  the prototype's 55px choice rows (restored); critic reviewed CSS text, never
  rendered pixels. design-critic.md and design-researcher.md updated: render
  before critiquing, prototype = floor not ceiling, theme-variant trap, dead-
  space/visual-mass bar, input-freedom check.

- 2026-08-08 · USER DECIDED (visual world v2): full redesign to the LIQUID
  GLASS system from their Claude-design mock (pasted verbatim →
  prototypes/munus-liquid-glass-mock.jsx). Pink paper world retired. Recorded
  adaptations: swipe-right stays SAVE (mock's apply-on-swipe violates
  review-before-send), licensed system Helvetica stack replaces the mock's
  unlicensed font mirror, CSS atmosphere replaces its third-party CDN photo.
  OPEN QUESTION for user: mock brands the app "Munus" (= repo name); all code
  and docs still say "Scout" — rename is a one-command sweep on request.
  Bonus fix while re-skinning: .overline class collided with Tailwind's
  overline text-decoration utility — every kicker had a phantom line above it
  since bw0.

- 2026-08-08 · USER UPLOADED JobSwipe5.html → new binding authority
  (prototypes/jobswipe5.html). Same glass system, richer pattern set; its
  swipe semantics now MATCH product truth (right = save, apply from Saved
  behind a review sheet). All screens aligned: onboarding → dots + centered
  glass card + X/"Next →" nav (6 real steps in template language); sign-in →
  template-language card (not in template); facts → brand-pill header +
  shield summary card; landing hero card → exact template card anatomy.
  Reduced-motion CSS now zeroes animation-delay too (real a11y fix; also
  makes static screenshots verifiable via --force-prefers-reduced-motion).

- 2026-08-08 · USER DECIDED: product name is MUNUS (matches repo + their
  designs). Swept through code, UI copy, package name, PRODUCT/README; env
  var is now MUNUS_ALLOW_DEV_AUTH, dev cookie munus_dev_session. Historical
  docs (SCOUT_MVP_PLAN.md, older decision entries) intentionally unchanged.

- 2026-08-10 · Ingestion built fixture-first (ATS hosts blocked from this
  container — greenhouse/lever both unreachable). Adapters are real; fetcher
  is a seam (live | fixtures via INGEST_FIXTURES=1 / keyless dev default).
  Remaining for live: run from network-permitted env, validate seed slugs
  (all marked unverified; health tracking deactivates after 5 fails), expand
  seed from ~50 starter to 1-2k via directory scrape + founder research.
  DEFERRED: embeddings (jobs.embedding stays null; embedder adapter is
  phase-2 matching work). Supabase-side fail_streak column needs migration
  0002 (dev store enforces health contract already). Close-vanished logic
  verified by code path on dev store; re-verify against a live feed churn.

## DECISIONS LOG
- 2026-08-08 · USER DECIDED (landing page): built as the app's real / route
  (not a prototypes/ mock); primary CTA links into the app (/sign-in), NOT a
  waitlist; pricing section shown publicly (Free / Plus €14.99 / Pro teaser).
  Consequence: former welcome screen is superseded by the landing; app
  screens moved into the (app) route group with the phone frame; PRODUCT.md
  created as durable product truth (impeccable init).
- 2026-08-08 · Scope + architecture locked per docs/SCOUT_MVP_PLAN.md (approved before this session): discovery + favorites + evidence-only AI docs + redirect apply; auto-apply Pro is architected-for, not built. Stack: Next.js + Supabase + Groq + Stripe, PWA-first.
- 2026-08-08 · Prototype `scout-pink-v2.html` is the design spec, PINK theme (body[data-theme="pink"] overrides). Pixel-exact port is the bar; deviations need written reasons.
- 2026-08-08 · Beachhead vertical: product/UX designers in Europe. USER
  CLARIFIED same day: beachhead constrains ingestion/marketing only — role
  input is never restricted; users select multiple titles and type any job.
- 2026-08-08 · bw0 default (agent, standing until user overrides): every external service sits behind an adapter interface with a keyless dev mode (dev session, file store, heuristic CV parser). Real keys activate real adapters via env only — no code changes.
- 2026-08-08 · Environment discovery: Supabase project env vars ARE present, but the container cannot reach supabase.co (network policy) — so in-session verification runs the dev adapters against a build made without those vars, and Supabase-path rows cap at PARTIAL until verified from a network-permitted context.
- 2026-08-08 · Verification bar for bw0: prod build + curl E2E (happy path, 401, 422, guards, sign-out) + headless-Chromium screenshots. Headless Chromium clamps window width to ~500px, so phone-width shots clip on the right — screenshot at 900px where the frame centers instead.
