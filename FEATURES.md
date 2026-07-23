# FEATURES.md — single source of truth for what exists
# The agent maintains this file. Humans read it. Neither trusts memory.
# Status values: DONE (built + verified running) | PARTIAL (built, missing states/edge cases)
#                STUB (placeholder/mock only) | MISSING (not started) | BLOCKED (needs user decision)
# RULE: nothing gets marked DONE without being run/tested in this session.
# Authority chain: docs/MUNUS_MVP_PLAN.md (product) > CONTRACTS.md (technical) > this file (state).

## MVP Definition of Done
Munus MVP is DONE when: the app boots with zero errors, every CORE flow below is
DONE (not PARTIAL), every screen has loading/empty/error states, and the
critical-path demo — sign in → onboard (6 questions + CV → parsed facts) →
swipe real fresh jobs with real evidence-based reasons → save → tailor in the
studio (evidence-only, verifier-gated) → preflight → open official listing →
return-confirm → application receipt — runs end-to-end on a phone (PWA)
without a crash, with a stranger able to pay for Plus.

## SCOPE (from plan §1 — the contract of what MVP is and is not)
| In MVP (ships) | Explicitly NOT in MVP |
|---|---|
| Onboarding: 6 questions + CV → structured facts store | Automated submission (Pro tier — later, on this foundation) |
| Discover: swipe deck of real fresh jobs, fit score, 2 evidence reasons, 1 honest concern, swipe/buttons/star/undo/detail | Employer screening-question autofill |
| Favorites: shortlist + per-job readiness chips | WhatsApp |
| AI Application Studio: evidence-only suggestions w/ evidence chips, Accept/Keep, tone regen, PDF export | Native App Store build (PWA first) |
| Preflight → redirect apply → return-confirm → receipt | Multi-CV management |
| Applications: list + receipt (Prepared → Opened listing → Confirmed applied) | |
| Accounts & plans: Google/Apple sign-in, Free + Plus, Stripe checkout | |
| Legal basics: privacy, terms, GDPR export/delete, cookie-less analytics | |

Beachhead: ONE vertical — recommended product/UX designers in Europe (see
DECISIONS LOG D11: recommendation pending user confirmation).

## WAVE ROADMAP (from plan §4 — "Done means" is the exit criterion; nothing depends on a later phase)
| Wave | Plan phase | Weeks | Ships | Exit criterion ("Done means") | Status |
|---|---|---|---|---|---|
| W0 | 0 · Foundation | 0–1 | Repo, CI, Supabase schema + migrations, auth (Google/Apple), CV upload → facts extraction | Sign in, upload CV, see parsed facts | PARTIAL — app scaffold/CI/shell DONE (see FOUNDATION); Supabase schema/auth/CV BLOCKED on user creds |
| W1 | 1 · Ingestion | 1–2 | Seed list (1k companies), Greenhouse+Lever pullers, normalizer, dedupe, freshness, embeddings | 3–5k live jobs, auto-refreshing, spot-checked | MISSING |
| W2 | 2 · Deck | 2–3 | Matching + deck API; Discover UI ported pixel-exact (swipe physics, star, undo, coach, detail) | Swipe real ranked jobs with real reasons on a phone | MISSING |
| W3 | 3 · Studio | 3–4 | Favorites; facts-constrained tailoring + verifier; suggestions UI; tone sheet; PDF export | Generate → accept → download an honest tailored CV+letter | MISSING |
| W4 | 4 · Apply loop | 4–5 | Preflight; redirect + return-confirm; applications + receipts; "still open" checks | Full journey: swipe → tailor → apply → receipt | MISSING |
| W5 | 5 · Money & law | 5–6 | Usage metering, Stripe (Plus), paywall moments (3rd try, 21st swipe), privacy/terms, GDPR export+delete | A stranger can pay and a regulator can't hurt us | MISSING |
| W6 | 6 · Polish & beta | 6–7 | Onboarding funnel, PWA install, PostHog, empty/offline states, 20-user closed beta | Beta users complete the loop unaided; crash-free | MISSING |
| W7 | 7 · Launch | 8 | Fix beta findings, seed content, launch (designer communities, Product Hunt) | Public, measured, first organic signups | MISSING |

## FOUNDATION (orchestrator-built, wave 1 base)
| Item | Status | Verified how | Notes |
|---|---|---|---|
| Next.js 16 scaffold (TS strict, Tailwind 4) | DONE | typecheck+build+boot 2026-07-23, all routes 200 | Next 16.2.11 |
| Design tokens (styles/tokens.css from prototype pink) | DONE | screenshots vs prototype 2026-07-23 | |
| UI primitives (Button, chips, IconButton, Topbar, Toast, icons) | DONE | build + rendered in shell | hand-rolled: shadcn registry unreachable under network policy (justified deviation) |
| State components (Loading/Empty/Error/Offline) | DONE | rendered on all tab screens | |
| App shell: welcome + tabbar + 4 tab routes | DONE | boot + screenshots (393×852) | tab screens are honest placeholders pending slices |
| Mock data layer (prototype jobs + persisted store) | DONE | vitest 4/4 + boot | replaced by real APIs in W2 |
| CI workflow (typecheck/build/test) | PARTIAL | file authored; first run pending on GitHub | verify on next push |
| PWA manifest stub | PARTIAL | served at /manifest.webmanifest | icons + service worker in W6 |

## CORE FLOWS (MVP-blocking)
| Feature | Status | Verified how | Notes |
|---|---|---|---|
| Auth (Google/Apple via Supabase) | MISSING | — | placement in flow: see GAPS |
| Onboarding 6-question flow | MISSING | — | prototype screens 02 |
| CV upload → facts extraction (LLM parse) | MISSING | — | facts table = evidence store |
| Job ingestion (Greenhouse + Lever first) | MISSING | — | founder building seed list in BACKLOG.md |
| Matching (embeddings + rule layer, cached reasons) | MISSING | — | LLM only above threshold, top 30/day polish |
| Discover swipe deck (physics, star, undo, coach) | MISSING | — | pixel-exact from prototype |
| Job detail | MISSING | — | |
| Favorites + readiness chips + "still open" check | MISSING | — | |
| Studio: evidence-only tailoring + verifier gate | MISSING | — | verifier is blocking, zero escapes |
| Studio: Accept/Keep, tone regen, PDF export | MISSING | — | |
| Preflight review | MISSING | — | NO employer-questions block in MVP (D3) |
| Redirect apply + return-confirm + receipt | MISSING | — | Prepared → Opened → Confirmed |
| Applications list + receipt timeline | MISSING | — | MVP copy ≠ prototype's direct-submit copy (D2) |
| Usage metering (server-side) | MISSING | — | Free 20 swipes/wk, 2 tries/job |
| Stripe: Plus checkout + portal + webhooks | MISSING | — | €14.99/mo · €6.99/wk · €34.99/q |
| Paywall moments (3rd AI try, 21st swipe) | MISSING | — | |
| Plans screen (Free/Plus/Pro-waitlist) | MISSING | — | Pro = waitlist button (D5) |
| Privacy, terms, GDPR export/delete | MISSING | — | |

## REQUIRED BUT NOT CORE (post-boot, pre-launch)
| Feature | Status | Verified how | Notes |
|---|---|---|---|
| Loading/empty/error states on every screen | MISSING | — | prototype ships: caught-up, offline, unsupported, out-of-swipes |
| PWA install (manifest, service worker, offline shell) | MISSING | — | |
| PostHog (EU) cookie-less analytics | MISSING | — | KPI events from plan §6 |
| Onboarding funnel measurement | MISSING | — | target >60% completion |
| Alert delivery (email digest at minimum) | BLOCKED | — | plan collects preference, ships no mechanism — BACKLOG item, needs user call |
| Pro waitlist capture | MISSING | — | needs a table; BACKLOG item |
| Profile/settings (prefs edit, plan, career profile) | MISSING | — | |
| "I got hired" pause flow | MISSING | — | BACKLOG; later |

## DISCOVERED GAPS (agent appends here when it finds unstated requirements)
- 2026-07-23 (bootstrap): **Alert delivery is unshipped.** Onboarding asks alert
  cadence (§1.1) but no phase builds any notification channel. Decide: email
  digest in W6, or label "coming soon" and stop asking the question.
- 2026-07-23 (bootstrap): **Auth placement is unspecified.** Plan says
  Google/Apple sign-in; prototype welcome has no sign-in and flows straight
  into onboarding (+ a "Preview with sample data" guest path). Where auth
  happens (before onboarding vs. at CV-upload/save moment) changes the funnel.
- 2026-07-23 (bootstrap): **Guest preview mode** exists in the prototype,
  absent from the plan. Needs an explicit in/out decision.
- 2026-07-23 (bootstrap): **`decisions` log needs an `unsave` type** (or
  favorites can't be a view over it) — undo removes saves. Phase 0 schema detail.
- 2026-07-23 (bootstrap): **Pro waitlist has no storage.** §7 mandates the
  waitlist button; nothing captures the signups.
- 2026-07-23 (bootstrap): **docs/PRICING.md is referenced by the plan footer
  but does not exist in the repo.** Prices are recoverable from plan §1.7 +
  prototype plans screen (they agree), but the canonical doc is missing.
- 2026-07-23 (bootstrap): **Prototype "Withdraw application" is impossible
  under redirect apply** — replace with archive/remove-from-list + honest copy.
- 2026-07-23 (bootstrap): prototype has dead code for a Discover
  "learning banner" (CSS + dismiss action, never rendered) — treat as not spec.

## DECISIONS LOG
# Format: D# · date · decision · source. Plan-sourced decisions are PRE-DECIDED:
# never re-ask the user.
- D1 · 2026-07-23 · Thin/stale deck risk → beachhead vertical + 1k-company seed
  list + freshness checks; never show a dead link twice. (plan §7)
- D2 · 2026-07-23 · MVP apply = redirect + return-confirm ONLY. Automated
  submission is Pro, later. Receipt timeline: Prepared → Opened listing →
  Confirmed applied. Prototype's direct-submit copy does not ship. (plan §1/§7)
- D3 · 2026-07-23 · No employer screening-question autofill in MVP — the
  preflight "Employer questions" block from the prototype drops out. (plan §1)
- D4 · 2026-07-23 · Missing salary → show "not listed" honestly, never estimate
  silently. (plan §7)
- D5 · 2026-07-23 · LLM invented experience → verifier is a BLOCKING gate, not
  a warning; log every drop; zero escapes audited weekly. (plan §7, §6)
- D6 · 2026-07-23 · ATS feed changes → per-source adapters with health alerts;
  sources are additive. (plan §7)
- D7 · 2026-07-23 · Apple tax → web/PWA first keeps Stripe economics; Capacitor
  wrapper only after PMF. (plan §7)
- D8 · 2026-07-23 · Auto-apply scope creep → Pro stays a waitlist button until
  Plus revenue exists. (plan §7)
- D9 · 2026-07-23 · Pricing: Free (20 swipes/wk, 2 AI tries/job, free first kit
  per saved job) · Plus €14.99/mo · €6.99/wk · €34.99/q, unlimited within fair
  use (500 swipes/day, 30 gens/day). (plan §1/§2)
- D10 · 2026-07-23 · Stack: Next.js 16 + Vercel + Supabase + Groq llama-3.3-70b
  + MiniLM/bge-small + Stripe + PostHog EU — same stack as talk.cv on purpose.
  (plan §2)
- D11 · 2026-07-23 · Beachhead: ONE vertical at launch; plan RECOMMENDS
  product/UX designers in Europe. Recommendation adopted as working assumption
  (founder is seeding against it) — final confirmation is on the user's
  decision list from the bootstrap report. Second vertical = config change.
  (plan §1)
- D12 · 2026-07-23 · prototypes/scout-pink-v2.html is the BINDING visual spec;
  pink theme ships; product copy says Munus wherever the prototype says Scout.
  (bootstrap instruction)
- D13 · 2026-07-23 · Ingestion adapter requirements adopted from founder batch 1:
  no slug guessing, EU Greenhouse host fallback, empty-feed-is-healthy,
  dual-ATS migration tolerance, vertical-as-config. (checkpoint; CONTRACTS §2)
- D14 · 2026-07-23 · decisions.type gains `unsave` so favorites stays a pure
  view over the swipe log. (checkpoint)
- D15 · 2026-07-23 · Pro waitlist gets a `waitlist` table in W5. (checkpoint)
- D16 · 2026-07-23 · Working defaults adopted pending user override (open until
  W2): keep guest preview mode; auth happens at the CV-upload moment; Google
  sign-in first, Apple before beta; alert channel = email digest in W6.
  (checkpoint — user can override any of these)
