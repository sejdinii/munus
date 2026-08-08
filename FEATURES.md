# FEATURES.md — single source of truth for what exists
# The agent maintains this file. Humans read it. Neither trusts memory.
# Status values: DONE (built + verified running) | PARTIAL (built, missing states/edge cases)
#                STUB (placeholder/mock only) | MISSING (not started) | BLOCKED (needs user decision)
# RULE: nothing gets marked DONE without being run/tested in this session.
# Product: Scout — swipe-based job discovery PWA. Spec: docs/SCOUT_MVP_PLAN.md
# Design spec (pixel truth): prototypes/scout-pink-v2.html (pink theme)

## MVP Definition of Done
The Scout MVP is DONE when: the app boots with zero errors; every CORE flow below
is DONE (not PARTIAL); every screen has loading/empty/error states; and the
critical-path demo (onboard → swipe real jobs → save → tailor with evidence →
preflight → redirect apply → receipt) runs end-to-end on a phone without a crash.

## CORE FLOWS (MVP-blocking) — build phases 0-5 in docs/SCOUT_MVP_PLAN.md
| Feature | Status | Verified how | Notes |
|---|---|---|---|
| Repo scaffold (Next.js, TS strict, Tailwind, tokens) | MISSING | — | bw0 |
| CI (lint + typecheck + build) | MISSING | — | bw0 |
| Supabase schema + migrations + RLS | MISSING | — | bw0; migrations checked in, applied when project exists |
| Auth: Google/Apple sign-in | MISSING | — | bw0; real OAuth needs user-supplied creds — dev adapter until then |
| CV upload → parsed facts store (evidence source) | MISSING | — | bw0 'done means' demo |
| Onboarding (6 questions → profile) | MISSING | — | prototype screens 02 |
| Job ingestion (Greenhouse/Lever pullers, dedupe, freshness) | MISSING | — | phase 1; make-or-break |
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

## DECISIONS LOG
- 2026-08-08 · Scope + architecture locked per docs/SCOUT_MVP_PLAN.md (approved before this session): discovery + favorites + evidence-only AI docs + redirect apply; auto-apply Pro is architected-for, not built. Stack: Next.js + Supabase + Groq + Stripe, PWA-first.
- 2026-08-08 · Prototype `scout-pink-v2.html` is the design spec, PINK theme (body[data-theme="pink"] overrides). Pixel-exact port is the bar; deviations need written reasons.
- 2026-08-08 · Beachhead vertical: product/UX designers in Europe.
- 2026-08-08 · bw0 default (agent, standing until user overrides): no Supabase/Groq/OAuth secrets exist in the build environment, so every external service sits behind an adapter interface with a keyless dev mode (dev session, heuristic CV parser). Real keys activate real adapters via env only — no code changes. Auth caps at PARTIAL until real OAuth creds are configured.
