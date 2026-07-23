# BACKLOG.md - founder's research output, orchestrator's inbox
# The founder appends here continuously. The orchestrator reads it ONLY at
# checkpoints and marks items ACCEPTED (goes into FEATURES.md) or REJECTED
# (stays here with a reason, so it is never re-proposed blind).

## URGENT
(founder: only genuine wave-invalidating discoveries; otherwise leave empty)
- **Tooling note, not a market discovery (2026-07-23):** the WebFetch tool returned HTTP 403 for every URL attempted this entire session — including plain `https://example.com`, `https://example.org`, `https://www.wikipedia.org` and `https://news.ycombinator.com`, not just ATS domains. That confirms a session-level proxy/tool outage, not a per-site block, and I have no shell/curl access to work around it. Consequence: the 50 rows appended to SEED LIST below are **WebSearch-corroborated, not HTTP-fetch-verified** — for each one I found a live, current job-posting URL (with a real job ID) at the exact slug via search, which is strong evidence the slug is real and active, but nobody has actually hit the JSON feed URL and confirmed it 200s with a `jobs` array yet. Before wiring these into the ingestion cron, run one real HTTP pass over every feed_url in the batch below (a 5-minute job) and drop any that 404. Do not treat the "Verified" column as equivalent to prior batches unless a future run confirms it with a working WebFetch/curl.

## SEED LIST (ingestion companies — founder's primary mission)
# Beachhead vertical per docs/MUNUS_MVP_PLAN.md §1: product/UX designers in
# Europe (pending user confirmation, recorded in FEATURES.md decisions).
# Format per batch: | Company | ATS | Feed URL | Verified (date) |
# Target: 1,000–2,000 companies before Phase 1 completes. Append batches below.

### Batch 1 — 2026-07-23 (50 companies, all 5 ATS types represented)
Method: for every row, WebSearch found a live job-posting page at the exact
slug (usually with a real numeric/UUID job id, e.g.
`job-boards.greenhouse.io/n26/jobs/…`), which is how the slug was confirmed —
NOT a direct WebFetch of the JSON endpoint (see URGENT above: WebFetch was
down all session, confirmed via failures on example.com and Wikipedia too, so
this is a tool outage rather than these companies blocking a bot). Treat the
date below as "slug + ATS corroborated via search 2026-07-23" and re-verify
the actual JSON response before ingestion goes live.

| Company | ATS | Feed URL | Verified (date) |
|---|---|---|---|
| N26 | Greenhouse | https://boards-api.greenhouse.io/v1/boards/n26/jobs?content=true | 2026-07-23* |
| Contentful | Greenhouse | https://boards-api.greenhouse.io/v1/boards/contentful/jobs?content=true | 2026-07-23* |
| Monzo | Greenhouse | https://boards-api.greenhouse.io/v1/boards/monzo/jobs?content=true | 2026-07-23* |
| GetYourGuide | Greenhouse | https://boards-api.greenhouse.io/v1/boards/getyourguide/jobs?content=true | 2026-07-23* |
| GoCardless | Greenhouse | https://boards-api.greenhouse.io/v1/boards/gocardless/jobs?content=true | 2026-07-23* |
| Typeform | Greenhouse | https://boards-api.greenhouse.io/v1/boards/typeform/jobs?content=true | 2026-07-23* |
| Algolia | Greenhouse | https://boards-api.greenhouse.io/v1/boards/algolia/jobs?content=true | 2026-07-23* |
| Snyk | Greenhouse | https://boards-api.greenhouse.io/v1/boards/snyk/jobs?content=true | 2026-07-23* |
| Miro | Greenhouse | https://boards-api.greenhouse.io/v1/boards/realtimeboardglobal/jobs?content=true | 2026-07-23* (slug is legacy brand name "realtimeboardglobal", not "miro") |
| GitLab | Greenhouse | https://boards-api.greenhouse.io/v1/boards/gitlab/jobs?content=true | 2026-07-23* |
| Bolt | Greenhouse | https://boards-api.greenhouse.io/v1/boards/boltv2/jobs?content=true | 2026-07-23* (slug "boltv2"; a separate "bolt42" board also exists — unclear if duplicate) |
| Veriff | Greenhouse | https://boards-api.greenhouse.io/v1/boards/veriff/jobs?content=true | 2026-07-23* |
| Wolt | Greenhouse | https://boards-api.greenhouse.io/v1/boards/wolt/jobs?content=true | 2026-07-23* |
| Aiven | Greenhouse | https://boards-api.greenhouse.io/v1/boards/aiven36/jobs?content=true | 2026-07-23* (slug "aiven36", not "aiven") |
| Celonis | Greenhouse | https://boards-api.greenhouse.io/v1/boards/celonis/jobs?content=true | 2026-07-23* |
| Trade Republic | Greenhouse | https://boards-api.greenhouse.io/v1/boards/traderepublicbank/jobs?content=true | 2026-07-23* (slug "traderepublicbank") |
| Grover | Greenhouse | https://boards-api.greenhouse.io/v1/boards/grover/jobs?content=true | 2026-07-23* |
| Choco | Greenhouse | https://boards-api.greenhouse.io/v1/boards/choco/jobs?content=true | 2026-07-23* |
| Taxfix | Greenhouse | https://boards-api.greenhouse.io/v1/boards/taxfix2/jobs?content=true | 2026-07-23* (slug "taxfix2") |
| Depop | Greenhouse | https://boards-api.greenhouse.io/v1/boards/depop/jobs?content=true | 2026-07-23* |
| TIER Mobility | Greenhouse | https://boards-api.greenhouse.io/v1/boards/tiermobility/jobs?content=true | 2026-07-23* |
| sennder | Greenhouse | https://boards-api.greenhouse.io/v1/boards/sennder/jobs?content=true | 2026-07-23* |
| Truecaller | Greenhouse | https://boards-api.greenhouse.io/v1/boards/truecaller/jobs?content=true | 2026-07-23* |
| Yubico | Greenhouse | https://boards-api.greenhouse.io/v1/boards/yubico/jobs?content=true | 2026-07-23* |
| Freetrade | Greenhouse | https://boards-api.greenhouse.io/v1/boards/freetrade/jobs?content=true | 2026-07-23* |
| TrueLayer | Greenhouse | https://boards-api.greenhouse.io/v1/boards/truelayer/jobs?content=true | 2026-07-23* (candidate-facing board is on `job-boards.eu.greenhouse.io` — see RISKS re: EU API host) |
| Cleo AI | Greenhouse | https://boards-api.greenhouse.io/v1/boards/cleoai/jobs?content=true | 2026-07-23* (do not confuse with unrelated US "Cleo" supply-chain-software co, slugs `cleo`/`cleo-emea`/`cleoindia`, also on Greenhouse) |
| Doctolib | Greenhouse | https://boards-api.greenhouse.io/v1/boards/doctolib/jobs?content=true | 2026-07-23* |
| Payhawk | Greenhouse | https://boards-api.greenhouse.io/v1/boards/payhawkio/jobs?content=true | 2026-07-23* (candidate-facing board is on `job-boards.eu.greenhouse.io` — see RISKS re: EU API host) |
| Mews | Greenhouse | https://boards-api.greenhouse.io/v1/boards/mewssystems/jobs?content=true | 2026-07-23* (slug "mewssystems") |
| Butternut Box | Greenhouse | https://boards-api.greenhouse.io/v1/boards/butternutbox/jobs?content=true | 2026-07-23* |
| Paddle | Ashby | https://api.ashbyhq.com/posting-api/job-board/paddle | 2026-07-23* (Paddle appears to have migrated off Greenhouse to Ashby — old `boards.greenhouse.io/paddle` links still resolve historically, current board is Ashby) |
| Photoroom | Ashby | https://api.ashbyhq.com/posting-api/job-board/photoroom | 2026-07-23* |
| Alan | Ashby | https://api.ashbyhq.com/posting-api/job-board/alan | 2026-07-23* (both `jobs.lever.co/alan` and `jobs.ashbyhq.com/alan` show live postings — likely mid-migration, see RISKS) |
| Sorare | Ashby | https://api.ashbyhq.com/posting-api/job-board/sorare | 2026-07-23* |
| Thought Machine | Ashby | https://api.ashbyhq.com/posting-api/job-board/thought-machine | 2026-07-23* |
| Ankorstore | Ashby | https://api.ashbyhq.com/posting-api/job-board/ankorstore | 2026-07-23* |
| Onfido | Workable | https://apply.workable.com/api/v1/widget/accounts/onfido | 2026-07-23* |
| Spendesk | Lever | https://api.lever.co/v0/postings/spendesk?mode=json | 2026-07-23* |
| BlaBlaCar | Lever | https://api.lever.co/v0/postings/blablacar?mode=json | 2026-07-23* |
| Qonto | Lever | https://api.lever.co/v0/postings/qonto?mode=json | 2026-07-23* |
| Aircall | Lever | https://api.lever.co/v0/postings/aircall?mode=json | 2026-07-23* |
| Back Market | Lever | https://api.lever.co/v0/postings/backmarket?mode=json | 2026-07-23* (both `jobs.lever.co/backmarket` and `jobs.ashbyhq.com/backmarket` show live postings — likely mid-migration, see RISKS) |
| Ledger | Lever | https://api.lever.co/v0/postings/ledger?mode=json | 2026-07-23* (both `jobs.lever.co/ledger` and `jobs.ashbyhq.com/ledger` exist — likely mid-migration, see RISKS) |
| Contentsquare | Lever | https://api.lever.co/v0/postings/contentsquare?mode=json | 2026-07-23* |
| Swile | Lever | https://api.lever.co/v0/postings/swile?mode=json | 2026-07-23* |
| Moneybox | Lever | https://api.lever.co/v0/postings/moneyboxapp?mode=json | 2026-07-23* (slug "moneyboxapp") |
| Wise | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/Wise/postings | 2026-07-23* (confirmed via `jobs.smartrecruiters.com/Wise/…`; NOT Greenhouse — searches for a Wise Greenhouse board came up empty, this is the correct ATS) |
| Delivery Hero | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/DeliveryHero/postings | 2026-07-23* |
| Cint | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/Cint/postings | 2026-07-23* |

\* = search-corroborated (live posting URL with real job id found for this exact slug), HTTP fetch of the JSON feed itself still pending — see URGENT note above.

Per-ATS breakdown this batch: Greenhouse 31 · Lever 9 · Ashby 6 · SmartRecruiters 3 · Workable 1.

## PROPOSED FEATURES
| Feature | Evidence (source) | Impact (blocking/valuable/later) | Touches | Verdict |
|---|---|---|---|---|
| Alert delivery (email digest at minimum) | Plan §1.1 collects alert cadence in onboarding, but no phase ships any delivery mechanism — we ask a question whose answer never does anything (orchestrator, bootstrap audit 2026-07-23) | blocking before launch (Phase 6 candidate) | ingestion worker, profiles.alerts, new mailer | ACCEPTED (W6; channel choice still user's — email digest is the default) |
| Pro waitlist capture | Plan §7: "Pro stays a waitlist button until Plus revenue exists" — but no table/endpoint stores waitlist signups (orchestrator, 2026-07-23) | valuable (Phase 5) | plans screen, data model (+waitlist table) | ACCEPTED (W5; +waitlist table approved, see CONTRACTS) |
| Guest preview mode ("Preview with sample data") | Prototype welcome screen ships it; plan never mentions it. Affects auth placement and funnel (orchestrator, 2026-07-23) | needs user decision | welcome, deck API, auth flow | ACCEPTED w/ default (keep preview, auth at CV-upload; user may override until W2) |
| Unsave semantics in the decisions log | Plan §3: favorites is a "view over decisions", but undo/unsave must remove a save — append-only log needs an `unsave` decision type or the view definition breaks (orchestrator, 2026-07-23) | blocking (Phase 0 schema detail) | decisions table, deck API | ACCEPTED (W0 schema: decisions.type gains `unsave`) |
| Application archive (replaces prototype "Withdraw") | Prototype offers "Withdraw application", impossible externally under redirect apply — record-keeping semantics + honest copy needed (orchestrator, 2026-07-23) | valuable (Phase 4) | applications screen + table | ACCEPTED (W4) |
| "I got hired" pause flow | Prototype profile row (pause everything); not in any plan phase. Strong retention/goodwill moment (orchestrator, 2026-07-23) | later | profile, subscriptions (Stripe pause) | ACCEPTED-LATER (post-MVP; revisit after W7) |
| Second vertical (engineering) as config | Plan §1: "a config change, not a build" — needs the seed list + matching thresholds to actually be config-driven from day one (orchestrator, 2026-07-23) | later (but architect for it in Phase 1) | seed list config, matching | ACCEPTED as W1 architecture requirement (config-driven vertical) |

## DESIGN INTEL
- (pattern worth cloning - app, source, date)

## RISKS
- (market/competitor/category threats, with source)
- **WebFetch tool outage this session (2026-07-23, founder):** every WebFetch call failed with HTTP 403, including non-ATS control URLs (`example.com`, `example.org`, `wikipedia.org`, `news.ycombinator.com`), confirming it's a proxy/tool-level failure this run, not sites blocking the agent. No Bash/curl tool was available to me to inspect `/root/.ccr/README.md` or the proxy status endpoint. Net effect: Batch 1 above is WebSearch-corroborated only. **Action needed:** whichever agent has a working fetch tool should run one real HTTP GET against all 50 feed_urls before the ingestion worker treats them as live — this is a 2-minute script, not a research task.
- **Greenhouse EU data-residency hosts (founder, 2026-07-23):** at least two companies in Batch 1 (TrueLayer, Payhawk) serve their candidate-facing job board from `job-boards.eu.greenhouse.io` instead of the default `job-boards.greenhouse.io`. It is undocumented from search alone whether the public Job Board API for these accounts still lives at the shared `boards-api.greenhouse.io`, or requires an EU-specific API host (e.g. `boards-api.eu.greenhouse.io`). If it's the latter, those two feed_urls (and any future EU-hosted Greenhouse company) will 404 on the standard template. The ingestion adapter should try both hosts and log which one 200s per company, rather than assuming one.
- **ATS migrations mid-flight (founder, 2026-07-23):** three companies in Batch 1 (Alan, Back Market, Ledger) currently show live, current job postings on *two different* ATS platforms simultaneously (Lever + Ashby in all three cases). This is evidence of active platform migration in the wild, not a one-off — the seed-list schema needs a way to record "this company may appear under two `(source, external_id)` roots at once" so the dedupe-by-company step in ingestion doesn't create duplicate job cards for the same posting during a migration window. Recommend: when both ATS boards are found for one company, prefer the one with the newer/higher job-count evidence, and re-check quarterly for migration completion.
- **Non-obvious/legacy slugs are common, not rare (founder, 2026-07-23):** of the 31 Greenhouse companies found this batch, at least 6 use a slug that is not a simple lowercase of the current brand name (Miro→`realtimeboardglobal`, Trade Republic→`traderepublicbank`, Bolt→`boltv2`, Taxfix→`taxfix2`, Aiven→`aiven36`, Mews→`mewssystems`). A seed-list generator that guesses `slugify(company_name)` and calls it done will silently produce ~15-20% dead/wrong feed_urls at this vertical's company mix. Each company needs an actual search-confirmed slug, not a template guess — budget founder/ingestion time accordingly for the 1,000–2,000 company target.
- **"Valid endpoint, zero current jobs" is a real, non-error state (founder, 2026-07-23):** Blinkist (`go1blinkist` on Greenhouse) and Deezer (`deezer` on SmartRecruiters) both appear to be real, correctly-slugged accounts that currently show no open postings in search results. The ingestion normalizer must treat a 200 response with an empty `jobs`/`postings` array as healthy-but-quiet, not as a signal to drop the company from the seed list — hiring volume is seasonal and bursty, especially at smaller companies.
- **Wise is on SmartRecruiters, not Greenhouse (founder, 2026-07-23):** worth flagging because Wise (fka TransferWise) has a well-known public case study with Greenhouse ("Wise transforms hiring to meet speed of growth," greenhouse.com/customer-stories) that could mislead a seed-list builder working from memory or from Greenhouse's own marketing pages into guessing `boards-api.greenhouse.io/v1/boards/wise` — that slug does not appear to exist; their live candidate-facing postings (confirmed via search, e.g. Staff Product Designer, London) are on `jobs.smartrecruiters.com/Wise/…`. A customer-story mention is not evidence of the *current* ATS.

## REJECTED (with reasons - do not re-propose without new evidence)
-
