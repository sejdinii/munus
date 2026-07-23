# BACKLOG.md - founder's research output, orchestrator's inbox
# The founder appends here continuously. The orchestrator reads it ONLY at
# checkpoints and marks items ACCEPTED (goes into FEATURES.md) or REJECTED
# (stays here with a reason, so it is never re-proposed blind).

## URGENT
(founder: only genuine wave-invalidating discoveries; otherwise leave empty)

## SEED LIST (ingestion companies — founder's primary mission)
# Beachhead vertical per docs/MUNUS_MVP_PLAN.md §1: product/UX designers in
# Europe (pending user confirmation, recorded in FEATURES.md decisions).
# Format per batch: | Company | ATS | Feed URL | Verified (date) |
# Target: 1,000–2,000 companies before Phase 1 completes. Append batches below.

## PROPOSED FEATURES
| Feature | Evidence (source) | Impact (blocking/valuable/later) | Touches | Verdict |
|---|---|---|---|---|
| Alert delivery (email digest at minimum) | Plan §1.1 collects alert cadence in onboarding, but no phase ships any delivery mechanism — we ask a question whose answer never does anything (orchestrator, bootstrap audit 2026-07-23) | blocking before launch (Phase 6 candidate) | ingestion worker, profiles.alerts, new mailer | |
| Pro waitlist capture | Plan §7: "Pro stays a waitlist button until Plus revenue exists" — but no table/endpoint stores waitlist signups (orchestrator, 2026-07-23) | valuable (Phase 5) | plans screen, data model (+waitlist table) | |
| Guest preview mode ("Preview with sample data") | Prototype welcome screen ships it; plan never mentions it. Affects auth placement and funnel (orchestrator, 2026-07-23) | needs user decision | welcome, deck API, auth flow | |
| Unsave semantics in the decisions log | Plan §3: favorites is a "view over decisions", but undo/unsave must remove a save — append-only log needs an `unsave` decision type or the view definition breaks (orchestrator, 2026-07-23) | blocking (Phase 0 schema detail) | decisions table, deck API | |
| Application archive (replaces prototype "Withdraw") | Prototype offers "Withdraw application", impossible externally under redirect apply — record-keeping semantics + honest copy needed (orchestrator, 2026-07-23) | valuable (Phase 4) | applications screen + table | |
| "I got hired" pause flow | Prototype profile row (pause everything); not in any plan phase. Strong retention/goodwill moment (orchestrator, 2026-07-23) | later | profile, subscriptions (Stripe pause) | |
| Second vertical (engineering) as config | Plan §1: "a config change, not a build" — needs the seed list + matching thresholds to actually be config-driven from day one (orchestrator, 2026-07-23) | later (but architect for it in Phase 1) | seed list config, matching | |

## DESIGN INTEL
- (pattern worth cloning - app, source, date)

## RISKS
- (market/competitor/category threats, with source)

## REJECTED (with reasons - do not re-propose without new evidence)
-
