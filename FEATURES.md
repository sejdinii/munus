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
| W0 | 0 · Foundation | 0–1 | Repo, CI, Supabase schema + migrations, auth (Google/Apple), CV upload → facts extraction | Sign in, upload CV, see parsed facts | **DONE (2026-08-07)** — schema+RLS applied (EVID-102); Google auth E2E verified real account (EVID-103); CV→facts pipeline live: upload→storage→pdfjs text→facts→DB→editable panel (EVID-104, mock provider; Groq swaps in with GROQ_API_KEY) |
| W1 | 1 · Ingestion | 1–2 | Seed list (1k companies), Greenhouse+Lever pullers, normalizer, dedupe, freshness, embeddings | 3–5k live jobs, auto-refreshing, spot-checked | **PARTIAL→NEAR-DONE (2026-08-07)** — HTTP verification pass executed (150/175 live, seed flipped to verifiedVia http); Supabase JobStore live: **8,251 real jobs** (greenhouse 4,854 / lever 651 / ashby 1,674 / workable 229 / smartrecruiters 845), freshness markMissing proven (2 closed), feed_health telemetry recording; embeddings deferred (D24); auto-refresh cron pending deploy (Vercel) or Hermes cron |
| W2 | 2 · Deck | 2–3 | Matching + deck API; Discover UI ported pixel-exact (swipe physics, star, undo, coach, detail) | Swipe real ranked jobs with real reasons on a phone | **NEAR-DONE (2026-08-07)** — deck UI + detail DONE (critic-reviewed); matching + deck API LIVE (rule scorer + LLM reasons, real deck browser-verified); **onboarding reworked per founder feedback** (role catalog + level in one window, work types Remote/Hybrid/On-site, full Europe locations, salary removed, CV mandatory, profile answers now persist via POST /api/profile); remaining: phone-swipe pass |
| W3 | 3 · Studio | 3–4 | Favorites; facts-constrained tailoring + verifier; suggestions UI; tone sheet; PDF export | Generate → accept → download an honest tailored CV+letter | **DONE (2026-08-07)** — LIVE with real facts + Groq (AI TAILOR verified on Clera: 4 grounded suggestions); **LaTeX + Tectonic PDF export** per founder direction (EVID-109): star Mollie → tailor → Download → CV-Mollie.pdf (2 pages, real facts text-extracted); tone sheet on real provider (rewritten more formal ✓); honest empty-kit case verified |
| W4 | 4 · Apply loop | 4–5 | Preflight; redirect + return-confirm; applications + receipts; "still open" checks | Full journey: swipe → tailor → apply → receipt | **DONE (2026-08-07)** — **LIVE on real jobs** (EVID-111): server-side still-open check on the employer's apply URL (preflight shows "Still open — checked just now"); real redirect to the official ATS page; return-confirm files the receipt; applications + receipt pages resolve real jobs. Browser E2E: Monzo 90% → tailor (2 accepted) → preflight ✓ → real Greenhouse form → confirmed receipt (opened 12:48 → confirmed 12:49) |
| W5a | 5 · Law & metering (real, D21) | 5–6 | Real metering logic, privacy/terms, GDPR export+delete | A regulator can't hurt us; the meter protects LLM cost | **DONE (2026-08-08)** — GDPR export (one-tap JSON with profile + all 53 facts + CV file, verified live) + account deletion (storage → profile cascade → auth user, unit-tested); `llm_usage` meter recording every Groq call (parse/reasons/tailor); owner-only `/admin` meter (verified live: 1 AI call · 1,033+1,500 tok · €0.0011 after a real tailor); 5 tailor runs/day/user polite cap (EVID-112) |
| W5b · Deploy — FREE stack (founder roadmap) | later | Vercel free + client-side PDF + Supabase free + Hermes cron | The app works from any phone, anywhere, €0/month | **DONE (2026-08-08)** — **LIVE: https://munus.vercel.app** (Hobby plan). PDF export moved fully client-side (pdfmake, engine verified in Node + real Chromium: 22.3KB %PDF); redirect allow-list extended to the live domain (via Management API); Google sign-in E2E verified ON THE DEPLOYED URL (landing → auth → onboarding Q1/5); all API routes live + auth-enforced (401/405). Daily job refresh stays on the local Hermes cron (free). W6 items (PostHog, PWA polish, offline states) still open |
| W5b | 5 · Payments (MOCK per D21) | later | Mock upgrade path, Pro waitlist capture | A tester can simulate Plus; no money moves | MISSING |
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
| CI workflow (typecheck/build/test) | DONE | gh run list: success on fix/a11y-targets-44px (2026-08-05T20:34), main (2026-07-25), claude branch (2026-07-25) | runs on push to main + all PRs (EVID-804) |
| PWA manifest stub | PARTIAL | served at /manifest.webmanifest | icons + service worker in W6 |

## REAL-DATA READINESS (wave 5 — built ahead of credentials)
| Item | Status | Verified how | Notes |
|---|---|---|---|
| Supabase schema (15 tables, migrations) | DONE | APPLIED to prod `ympwynldiykerdclwvba` (eu-west-1) 2026-08-05 via SQL editor: 0001+0002+0003 all green; verified live (EVID-102) | favorites is a real view over the decision log; verifier_drops audit table; D26/D27 columns verified |
| RLS policies on every table | DONE | APPLIED + verified live: `profiles.rls=enabled` (EVID-102) | owner-only user data; NO client write on usage/subscriptions (D21 consequence b) |
| Seed-list config (175 companies) | DONE | 880 per-row data guards + distribution test | Pollfish excluded (unverified slug, rule #1) |
| Ingestion runner (all 5 ATS) | DONE | 10 behavioural tests, in-memory store | transient outage never mass-marks jobs closed |
| Company identity bridge | DONE | 7 tests incl. no-collision across all rows + type-level runner contract | dual-ATS companies share one id |
| Dry-run feed verifier CLI | DONE | ran against live network: correctly reported blocked egress | `npm run ingest:dry` — needs ONLY network policy, not Supabase |
| Supabase JobStore implementation | MISSING | — | UNBLOCKED: creds in .env.local (2026-08-05); W1 slice |

## CORE FLOWS (MVP-blocking)
| Feature | Status | Verified how | Notes |
|---|---|---|---|
| Auth (Google/Apple via Supabase) | DONE | TASK-103 complete 2026-08-07: sign-in gate (browser-verified), OAuth callback w/ open-redirect guards (5 tests), session refresh, POST signout; Google provider ENABLED in Supabase (client `178802871980-...`, test user sejdiniagent@gmail.com); localhost:4318 redirect allow-listed; 995 tests + typecheck + build green | Apple before beta (D16) |
| Onboarding 6-question flow | DONE | wave1: implementer browser-run + integrated build/boot 2026-07-23 | mock persistence; real profile API lands W2+ |
| CV upload → facts extraction (LLM parse) | **DONE — LIVE with Groq (gpt-oss-120b, 2026-08-07)** | facts table = evidence store; /api/cv + /api/cv/facts; manual fallback; mock fallback if Groq errors |
| Job ingestion (all 5 ATS adapters) | PARTIAL | wave2: 50 fixture tests pass (5 adapters) | adapters+normalize+dedupe done incl. ashby/workable/smartrecruiters; cron/seed config/embeddings/real-feed run pending (network policy) |
| Matching (embeddings + rule layer, cached reasons) | MISSING | — | LLM only above threshold, top 30/day polish |
| Discover swipe deck (physics, star, undo, coach) | DONE | wave2: Playwright-driven swipes/undo/buttons/limit/caught-up 2026-07-25 | mock data by design until W1 feeds + matching; star toasts pending studio (see GAPS) |
| Job detail | DONE | wave2: implementer browser-run + integrated boot | mock data; real job API later |
| Favorites + readiness chips + "still open" check | PARTIAL | wave1: seeded-store browser-run, all states | UI done vs mock incl. unsave; still-open check needs real data (W4) |
| Studio: evidence-only tailoring + verifier gate | PARTIAL | wave3: 15 pipeline/compose tests incl. lying-provider + no-free-text-channel; browser-run | deterministic verifier DONE, letter structurally gated (D20b); mock provider until GROQ_API_KEY (D17) |
| Studio: Accept/Keep, tone regen, PDF export | DONE | wave3: browser-driven accept/tone/download, both PDFs verified | client-side PDF per D19 (server render in production) |
| Preflight review | DONE | wave4: browser-run, D3-compliant (no employer questions) | docs counts real; contact details arrive with auth |
| Redirect apply + return-confirm + receipt | DONE | wave4: full journey browser-run incl. popup return + both confirm branches | sample URLs labelled; real URLs with live feeds |
| Applications list + receipt timeline | DONE | wave4: archive/undo/unarchive + real timestamps + real doc counts browser-run | still-open checks need live feeds (W4 leftover) |
| Usage metering (server-side) | PARTIAL | wave5: 11 tests on limits + honest paywall copy | pure logic DONE; API-route enforcement needs auth. RLS already denies client writes to usage/subscriptions |
| Stripe: Plus checkout + portal + webhooks | MISSING | — | €14.99/mo · €6.99/wk · €34.99/q |
| Paywall moments (3rd AI try, 21st swipe) | MISSING | — | |
| Plans screen (Free/Plus/Pro-waitlist) | DONE | wave1: rendered, D9 prices grep-verified, contrast checked | checkout + waitlist capture are W5 stubs (toasts) |
| Privacy, terms | PARTIAL | wave5: real GDPR-accurate content, browser-verified TOC | founder placeholders listed in BACKLOG; needs solicitor review before launch |
| GDPR export/delete flows | MISSING | — | blocked on auth; privacy policy currently points to email fallback |

## REQUIRED BUT NOT CORE (post-boot, pre-launch)
| Feature | Status | Verified how | Notes |
|---|---|---|---|
| Loading/empty/error states on every screen | DONE | auditor 2026-07-26: all 11 dynamic routes verified (statics exempt) | offline state component exists, not yet wired to a network layer (W6) |
| PWA install (manifest, service worker, offline shell) | MISSING | — | |
| PostHog (EU) cookie-less analytics | MISSING | — | KPI events from plan §6 |
| Onboarding funnel measurement | MISSING | — | target >60% completion |
| Alert delivery (email digest at minimum) | BLOCKED | — | plan collects preference, ships no mechanism — BACKLOG item, needs user call |
| Pro waitlist capture | MISSING | — | needs a table; BACKLOG item |
| Profile/settings (prefs edit, plan, career profile) | DONE | wave1: integrated boot | mock-backed; rows link to onboarding/plans |
| "I got hired" pause flow | MISSING | — | BACKLOG; later |

## DISCOVERED GAPS (agent appends here when it finds unstated requirements)
- 2026-07-25 (wave2): deck star fast-track toasts instead of opening the
  studio — RESOLVED in wave3: star → save → studio restored.
- 2026-07-25 (wave2/auditor): vitest was double-counting suites from agent
  worktrees under .claude/ — fixed via vitest.config.ts exclude; earlier
  "80 tests" claims were inflated, true wave-1 count was 34 (82 as of W4).
- 2026-07-23 (wave1 slice3): mock store lacks the `receipt jsonb` docs
  snapshot — receipt document rows are static placeholders until Studio (W3)
  produces real documents.
- 2026-07-23 (wave1 slice3): store `undo()` cannot restore an `unsave` —
  unsave toast is feedback-only until decisions handling grows an inverse.
- 2026-07-23 (wave1 slice4): no `name` field in onboarding/profiles mock —
  profile initials derive from role; real profiles table has name (schema OK,
  mock+onboarding question missing).
- 2026-07-23 (wave1 checkpoint): unlayered element CSS silently defeats
  Tailwind utilities — all future base styles MUST live in @layer base
  (bug shipped in foundation, caught at integration).
- 2026-07-26 (wave4 critic): verdict FIX-FIRST, 12 findings, 5 demo-breaking
  — all fixed and browser-verified. TWO were invisible to my own testing:
  my walkthrough closed the popup and refocused in one motion, masking that
  the confirm dialog fired on DEPARTURE, and an "opened" application had no
  confirm path outside preflight. Standing lesson: verify a state machine by
  asserting WHEN each transition happens, not just that the end state
  eventually appears. Root causes worth remembering: window.open(url,
  "_blank", "noopener") ALWAYS returns null (so blocked-popup detection read
  every success as a block), and two setState calls in one tick race React
  batching — state machines need atomic actions (now lib/mock/transitions).
- 2026-07-23 (wave1 critic): design-critic verdict was FIX-FIRST with 15
  findings (3 demo-breaking honesty violations). 13 fixed and browser-
  verified same session. Deferred: discover placeholder has no error branch
  (screen is rebuilt wholesale in W2 — real deck must ship ALL states);
  favorites "›" job-detail navigation returns when job detail exists (W2),
  overflow menu stays as "⋯". Lesson recorded: implementers reproduce
  prototype copy faithfully even when it fabricates state — every wave spec
  must name the honest-copy variant explicitly.
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
  use (500 swipes/day, 30 gens/day). (plan §1/§2) · Amended 2026-07-25
  (auditor): Pro DISPLAY pricing on the plans screen is €34.99/mo · €12.99/wk
  · €79.99/q per the prototype — display-only, Pro remains waitlist (D8).
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
- D33 · 2026-08-05 · **MODEL RESEARCH COMPLETED (future-layer prep, no MVP
  change).** Brief: `03-architecture/research/MODEL_COST_EFFICIENCY_BRIEF.md`.
  Validates D17: Groq gpt-oss-120b is the sanctioned successor; llama-3.3-70b
  + llama-3.1-8b shut down 2026-08-16. MVP LLM cost ≈ €3/mo at MVP volumes
  (price is not the binding constraint; stability + quality are). Future-layer
  recommendation (working default): dual-tier — Groq gpt-oss-120b workhorse
  (parse/match/tailoring candidate) + OpenAI gpt-5.4-mini quality tier
  (tailoring finalization + agentic form fill), ≈ €20–25/mo; DeepSeek
  v4-flash as spare; pin model IDs behind an interface (Groq churned 5+
  models in 12 mo); every model choice gated on the DE/EN harness eval set
  (ties to TASK-104). Tool-calling reliability scores unverified by fresh
  benchmarks — flagged in brief §5. (delegation deleg_2b8018e4)
- D32 · 2026-08-05 · **BUILD APPROVED (founder): APPROVE_BUILD.** Frozen spec
  (04-spec, 29 REQs / 20 tasks / 29 verification rows) accepted; transitions
  to BUILD_MODE. W0 starts with TASK-101 (CI first run) and TASK-102
  (Supabase EU project + migrations). Founder actions required: merge PR #3
  (a11y fixes) before W0 waves; provide Supabase + Groq credentials (RISK-001).
  Deployment/publishing remains a separate gate. (Discord message
  1534668585308389546)
- D31 · 2026-08-05 · **FUTURE AGENT SHAPE CONFIRMED (founder):** per-user
  Hermes agent instances + one shared anonymized knowledge DB (no PII).
  Each agent grows its own user's abilities from that user's application
  cycles; the shared layer gives cold-start users instant regional/ATS
  knowledge and retrieval-cache cost savings. One-big-agent rejected
  (GDPR isolation, per-user learning validity, failure blast radius).
  Growth-loop preview: source ranking per user, form-fill accuracy, tone
  fit from Accept/Keep, timing patterns; anonymized aggregates shared.
  Model cost-efficiency research = prep for this layer. (Discord message
  1534668224699043970)
- D30 · 2026-08-05 · **MVP SCOPE RE-CONFIRMED (founder):** MVP = job finding,
  tailoring, redirect to the official job post to apply. NO automated applies.
  The background Hermes harness agent + shared knowledge database are a
  POST-MVP layer (consistent with D2/D8). Confirmed future shape: per-user
  agent runtime (owner-only context, RLS-aligned) + one shared anonymized
  knowledge layer (regional job sources, ATS form patterns, aggregated
  outcomes, retrieval caches). Model cost-efficiency research runs in
  parallel as prep for that layer. (Discord message 1534667154815844444)
- D29 · 2026-08-05 · **ARCHITECTURE APPROVED (founder): APPROVE_ARCHITECTURE.**
  Minimalist Architecture Brief verdict APPROVED_WITH_EXPLICIT_RISKS accepted;
  critic REVISE findings resolved (D24–D28); remaining risks owned. Frozen
  build specification authorized; production code remains blocked until
  explicit build approval. (Discord message 1534664052913995996)
- D28 · 2026-08-05 · **CONTRACTS.md synced to the decision log** (architecture
  critic finding): §1 model ID → gpt-oss-120b (D17), Stripe marked MOCKED (D21),
  embeddings deferred (D24), ingestion = Vercel cron (D25); §2
  documents.status + decisions.idempotency_key (D26/D27); §3 verifier
  server-side + swipe atomicity + mock-payments guard + GDPR delete route
  (D27). The binding contract no longer contradicts the architecture it gates.
- D27 · 2026-08-05 · **Architecture critic resolution (boundaries/security):**
  verifier runs SERVER-SIDE in production (client never executes gate nor
  writes verifier_drops); mock-checkout env-gated (`MOCK_PAYMENTS`) and
  unreachable in production; deck decisions = single server transaction with
  client-generated idempotency key (no double-metering); GDPR account deletion
  via dedicated service-role route (RLS cannot self-delete); Supabase region
  EU-Frankfurt; Groq transfer basis (SCCs) in privacy policy; durable PDF
  uploads to Storage land at W4 (receipts), not W5.
- D26 · 2026-08-05 · **Durable generation state:** `documents.status`
  (queued|generating|needs_review|ready) with server-side transitions —
  generation state survives refresh/disconnect without a queue. Schema delta.
- D25 · 2026-08-05 · **Ingestion host:** Vercel cron (Pro) + API routes with
  parallelized bounded pulls (idempotent upsert) in MVP; always-on VPS worker
  deferred until volume exceeds function windows. Replaces "Supabase cron /
  small VPS" (pg_cron is not a TS-worker runtime). Alert digest (D16) lands
  W5a; until then dry-run CLI + manual checks.
- D24 · 2026-08-05 · **No embeddings in MVP:** corpus evidence (175-company
  seed, <1k jobs) sits below the in-process-cosine threshold; matching =
  deterministic rule layer + cached LLM reasons for above-threshold jobs.
  pgvector + bge-small return only at corpus >5k AND a match-quality
  evaluation checkpoint. Removes hidden embedding-runtime dependency and cost
  line.
- D23 · 2026-08-05 · **DESIGN APPROVED (founder): APPROVE_DESIGN.** Munus is the
  approved design base; product-design gate closed; architecture stage
  authorized. PWA-first (D7) confirmed; Munus pink identity confirmed.
  Production implementation remains blocked until explicit build approval.
  (Discord message 1534661167329574943)
- D22 · 2026-08-05 · **OPERATING MODEL (founder): MERGED.** Munus's in-repo
  build machinery executes the build; Hermes owns product gates and independent
  verification; one canonical repo ledger; standing independent audit at every
  wave checkpoint. Consequence A: the independent Playwright harness (393×852 +
  320×568, 44px targets, overflow, console, semantics) is a STANDING gate check —
  every wave checkpoint runs it before APPROVE_*. Consequence B: first audit
  found 9 touch-target violations (Read full job profile links 23–24px,
  Tailor application 40px, Topbar Back 42×42, SegmentedTabs 34px, preflight
  Review changes 21px) — fixed on branch, harness re-run to green. (Discord
  message 1534658397259956324)
- D21 · 2026-07-26 · **USER SCOPE DIRECTIVE: everything real except payments.**
  Real accounts + onboarding, real job ingestion, fully functional app;
  Stripe/checkout stays a mock. Consequences recorded now so they are not
  re-litigated: (a) the LAW half of W5 is NOT deferred — real accounts hold
  real CVs, so privacy policy, GDPR export/delete and RLS become mandatory
  the moment sign-in ships, not at launch; (b) usage METERING must be real
  even with mock payments, or one account can exhaust the Groq free tier —
  the meter protects cost, the checkout only collects money; (c) the mock
  upgrade path must be guarded so it can never reach a public deployment;
  (d) "scrape" = the plan's public ATS JSON APIs (legal, structured,
  free), NOT HTML scraping — unchanged from §2.
  Re-sequenced plan: W0 auth+CV parse and W1 real ingestion come next,
  W5 splits into W5a (metering + law, real) and W5b (checkout, mocked).
- D20 · 2026-07-25 · Studio deviations from the prototype, all sanctioned:
  (a) "Download PDF kit" button added — W3's exit criterion demands an
  in-studio download; (b) the letter is a FIXED FRAME (app-template greeting
  + closing) whose substantive paragraphs are verifier-gated suggestions
  with per-paragraph Accept/Keep — closes the free-text hallucination
  channel the prototype's letter implied (critic W3 #3); (c) grounding-note
  copy states the real guarantee instead of the prototype's sample claims;
  (d) doc toolbar says "Your CV" — prototype's filename was sample personal
  data; (e) suggestions carry a content-vs-instruction kind: instructions
  (reorder) apply as ordering actions and never export as prose.
- D19 · 2026-07-25 · PDF export is CLIENT-SIDE during the mock phase (no
  server infra exists); the plan §2's server-side render + Supabase Storage
  + documents.pdf_path becomes the production path once creds exist —
  receipts require durably stored PDFs, so the client path is temporary.
  (slice B suggestion, adopted)
- D18 · 2026-07-25 · Discover header (title + honest sample-data line) is an
  ADDITION to the prototype (renderDiscover ships no header) — justified by
  the honesty rule; batch dots and swipe-hint were removed as unsanctioned
  (prototype dead code). Critic W2 verdict FIX-FIRST: all 12 findings fixed
  and browser-verified same session.
- D17 · 2026-07-24 · Plan §2 names Groq llama-3.3-70b, but Groq deprecated it
  (June 17 2026; serving stops ~Aug 2026 on free/dev tiers). The plan's real
  decision — Groq for fast cheap inference — stands; the model ID moves to
  Groq's stated replacement openai/gpt-oss-120b. Working default pending user
  override; verify the live model list in the console after signup.
