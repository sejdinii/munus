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
| Back Market | Lever | https://api.lever.co/v0/postings/backmarket?mode=json | 2026-07-23* (both `jobs.lever.co/backmarket` and `jobs.ashbyhq.com/backmarket` show live postings — likely mid-migration, see RISKS; Batch 2 found further evidence Ashby is the fresher board here) |
| Ledger | Lever | https://api.lever.co/v0/postings/ledger?mode=json | 2026-07-23* (both `jobs.lever.co/ledger` and `jobs.ashbyhq.com/ledger` exist — likely mid-migration, see RISKS) |
| Contentsquare | Lever | https://api.lever.co/v0/postings/contentsquare?mode=json | 2026-07-23* |
| Swile | Lever | https://api.lever.co/v0/postings/swile?mode=json | 2026-07-23* |
| Moneybox | Lever | https://api.lever.co/v0/postings/moneyboxapp?mode=json | 2026-07-23* (slug "moneyboxapp") |
| Wise | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/Wise/postings | 2026-07-23* (confirmed via `jobs.smartrecruiters.com/Wise/…`; NOT Greenhouse — searches for a Wise Greenhouse board came up empty, this is the correct ATS) |
| Delivery Hero | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/DeliveryHero/postings | 2026-07-23* |
| Cint | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/Cint/postings | 2026-07-23* |

\* = search-corroborated (live posting URL with real job id found for this exact slug), HTTP fetch of the JSON feed itself still pending — see URGENT note above.

Per-ATS breakdown this batch: Greenhouse 31 · Lever 9 · Ashby 6 · SmartRecruiters 3 · Workable 1.

### Batch 2 — 2026-07-23 (35 companies, widened beyond fintech/mobility)
Method identical to Batch 1: WebSearch corroboration only, not HTTP fetch.
**WebFetch tool re-tested at the start of this run** with the same control
URL as before (`https://example.com`) — it still returned a flat HTTP 403.
Same conclusion as Batch 1: this is a session/proxy-level tool outage, not a
per-site block, and no shell/curl was available to route around it. Every
row below is WebSearch-corroborated only (live job-posting URL with a real
job id found at the exact slug); nobody has hit the JSON feed and confirmed a
200 with a `jobs`/`postings` array. Same pre-ingestion action item as Batch 1
applies: one real HTTP pass over all feed_urls before trusting them live.

Deliberately widened beyond Batch 1's fintech/mobility skew this round:
design tools/dev tools (n8n), health (Oura, Ada Health, Livi/Kry), education
(GoStudent), e-commerce/marketplace (Glovo, Cabify, Wallapop, Back-Market-
adjacent Vestiaire Collective, Farfetch), grocery/food (Picnic, HelloFresh,
Too Good To Go, Deliveroo), B2B SaaS (Collibra, Showpad, Templafy, Mirakl,
Smartly.io, TravelPerk), payments/banking (Adyen, Trustly), insurtech/cyber
(Darktrace), logistics (Deliverect), EV hardware (Wallbox), and consumer
subscription-adjacent (Pleo, Intercom, ManyPets, Tourlane, Bitpanda,
Docplanner, Wayflyer, Improbable). Regions covered: Netherlands, Belgium,
Denmark, Sweden, Finland, Spain, France, Germany, Austria, UK, Ireland.

| Company | ATS | Feed URL | Verified (date) |
|---|---|---|---|
| Adyen | Greenhouse | https://boards-api.greenhouse.io/v1/boards/adyen/jobs?content=true | 2026-07-23* |
| Picnic | Greenhouse | https://boards-api.greenhouse.io/v1/boards/try-picnic/jobs?content=true | 2026-07-23* (slug "try-picnic", not "picnic") |
| Pleo | Greenhouse | https://boards-api.greenhouse.io/v1/boards/pleo/jobs?content=true | 2026-07-23* |
| Too Good To Go | Greenhouse | https://boards-api.greenhouse.io/v1/boards/toogoodtogo/jobs?content=true | 2026-07-23* |
| Oura | Greenhouse | https://boards-api.greenhouse.io/v1/boards/oura/jobs?content=true | 2026-07-23* (Finnish-founded, EU/US dual HQ — strong design team, health wearable) |
| Cabify | Greenhouse | https://boards-api.greenhouse.io/v1/boards/cabify/jobs?content=true | 2026-07-23* |
| Glovo | Greenhouse | https://boards-api.greenhouse.io/v1/boards/glovo/jobs?content=true | 2026-07-23* |
| TravelPerk | Greenhouse | https://boards-api.greenhouse.io/v1/boards/travelperk/jobs?content=true | 2026-07-23* |
| Bitpanda | Greenhouse | https://boards-api.greenhouse.io/v1/boards/bitpanda/jobs?content=true | 2026-07-23* (candidate-facing board is on `job-boards.eu.greenhouse.io` — see RISKS re: EU API host, same open question as TrueLayer/Payhawk in Batch 1) |
| GoStudent | Greenhouse | https://boards-api.greenhouse.io/v1/boards/gostudent/jobs?content=true | 2026-07-23* |
| Babbel | Greenhouse | https://boards-api.greenhouse.io/v1/boards/babbel/jobs?content=true | 2026-07-23* |
| Intercom | Greenhouse | https://boards-api.greenhouse.io/v1/boards/intercom/jobs?content=true | 2026-07-23* (Dublin-founded, EU/US dual HQ) |
| HelloFresh | Greenhouse | https://boards-api.greenhouse.io/v1/boards/hellofresh/jobs?content=true | 2026-07-23* |
| Collibra | Greenhouse | https://boards-api.greenhouse.io/v1/boards/collibra/jobs?content=true | 2026-07-23* |
| Showpad | Greenhouse | https://boards-api.greenhouse.io/v1/boards/showpad/jobs?content=true | 2026-07-23* |
| Smartly.io | Greenhouse | https://boards-api.greenhouse.io/v1/boards/smartlyio/jobs?content=true | 2026-07-23* (slug "smartlyio") |
| Mirakl | Greenhouse | https://boards-api.greenhouse.io/v1/boards/mirakl/jobs?content=true | 2026-07-23* (confirmed with live Freelance Product/Brand Designer postings; a separate "mirakllabs" board also exists — see RISKS, same duplicate-board pattern as Bolt in Batch 1) |
| Deliveroo | Greenhouse | https://boards-api.greenhouse.io/v1/boards/deliveroo/jobs?content=true | 2026-07-23* |
| Ada Health | Greenhouse | https://boards-api.greenhouse.io/v1/boards/adahealth/jobs?content=true | 2026-07-23* (do not confuse with unrelated Toronto customer-service-AI company "Ada", slug "ada18", also on Greenhouse — same naming-collision pattern as Cleo AI in Batch 1, see RISKS) |
| Templafy | Greenhouse | https://boards-api.greenhouse.io/v1/boards/templafy/jobs?content=true | 2026-07-23* |
| Wallapop | Greenhouse | https://boards-api.greenhouse.io/v1/boards/wallapop/jobs?content=true | 2026-07-23* (candidate-facing board is on `boards.eu.greenhouse.io` — see RISKS re: EU API host) |
| Darktrace | Greenhouse | https://boards-api.greenhouse.io/v1/boards/darktracelimited/jobs?content=true | 2026-07-23* (slug "darktracelimited"; candidate-facing board is on `boards.eu.greenhouse.io` — see RISKS re: EU API host) |
| Livi (Kry) | Greenhouse | https://boards-api.greenhouse.io/v1/boards/livi/jobs?content=true | 2026-07-23* (Kry operates as "Livi" in UK/France, slug "livi"; candidate-facing board is on `boards.eu.greenhouse.io` — see RISKS re: EU API host) |
| ManyPets | Greenhouse | https://boards-api.greenhouse.io/v1/boards/manygroup/jobs?content=true | 2026-07-23* (slug "manygroup"; formerly Bought By Many) |
| Tourlane | Greenhouse | https://boards-api.greenhouse.io/v1/boards/tourlanegmbh/jobs?content=true | 2026-07-23* (slug "tourlanegmbh", confirmed with live Senior Product Designer posting) |
| Farfetch | Lever | https://api.lever.co/v0/postings/farfetch?mode=json | 2026-07-23* |
| Vestiaire Collective | Lever | https://api.lever.co/v0/postings/vestiairecollective?mode=json | 2026-07-23* |
| Trustly | Lever | https://api.lever.co/v0/postings/trustly?mode=json | 2026-07-23* |
| Deliverect | Lever | https://api.lever.co/v0/postings/deliverect?mode=json | 2026-07-23* |
| Wayflyer | Ashby | https://api.ashbyhq.com/posting-api/job-board/wayflyer | 2026-07-23* |
| n8n | Ashby | https://api.ashbyhq.com/posting-api/job-board/n8n | 2026-07-23* (confirmed with live Senior/Staff Product Designer + Senior Brand Designer postings) |
| Improbable | Ashby | https://api.ashbyhq.com/posting-api/job-board/improbable | 2026-07-23* |
| Gousto | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/Gousto1/postings | 2026-07-23* (company id "Gousto1", not "Gousto"; confirmed via a live Product Designer posting) |
| Docplanner | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/Docplanner/postings | 2026-07-23* (confirmed via a live Lead Product Designer / Product Design Manager posting) |
| Wallbox | Workable | https://apply.workable.com/api/v1/widget/accounts/wallbox | 2026-07-23* (confirmed via legacy-format posting `apply.workable.com/wallbox/j/…`; see RISKS re: Workable's two URL schemes) |

\* = search-corroborated (live posting URL with real job id found for this exact slug), HTTP fetch of the JSON feed itself still pending — see URGENT note above and the WebFetch re-test note at the top of this batch.

Per-ATS breakdown this batch: Greenhouse 25 · Lever 4 · Ashby 3 · SmartRecruiters 2 · Workable 1. (35 total)

Running total after Batch 2: **85 companies** toward the 1,000–2,000 target.

Also searched this run but could NOT corroborate on any of the 5 target ATS
(either they run a proprietary/in-house careers stack, or search didn't
surface a matching slug — do not re-spend search budget on these without a
new angle): Klarna, Trustpilot, Factorial, Personio, Wefox, Zalando, Bunq,
Framer, Mollie, PayFit, Brevo/Sendinblue, Alma (a *different*, US-based
mental-health-insurance "Alma" turned up on Greenhouse — not to be confused
with Batch 1's French health-insurer "Alan" — excluded, not the target
company), Vinted (careers.vinted.com does not reveal its underlying ATS via
search), Voi Technology (own careers.voi.com site appears Greenhouse-embedded
per Greenhouse's own support-doc results, but no slug could be confirmed),
Lunar — the Danish neobank (search only surfaced an unrelated US company
"Lunar Energy" on Greenhouse, slug `lunarenergy` — do not use that slug for
the neobank, see RISKS), Cuvva, Wagestream, Uncapped, Preply, Forto, Clark,
Einride, Jobandtalent, Kahoot!, Epidemic Sound, Malt, ManoMano.

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
- **Same WebFetch outage confirmed again in the Batch 2 run (2026-07-23, founder):** re-tested with the identical control URL (`https://example.com`) at the start of this run — still a flat 403. Two consecutive sessions now show this as a persistent tool/proxy condition rather than a one-off blip. Whoever eventually gets a working fetch tool should treat verifying the combined 85-company list (Batch 1 + Batch 2) as one batch job, not two.
- **Greenhouse EU data-residency hosts (founder, 2026-07-23):** at least two companies in Batch 1 (TrueLayer, Payhawk) serve their candidate-facing job board from `job-boards.eu.greenhouse.io` instead of the default `job-boards.greenhouse.io`. It is undocumented from search alone whether the public Job Board API for these accounts still lives at the shared `boards-api.greenhouse.io`, or requires an EU-specific API host (e.g. `boards-api.eu.greenhouse.io`). If it's the latter, those two feed_urls (and any future EU-hosted Greenhouse company) will 404 on the standard template. The ingestion adapter should try both hosts and log which one 200s per company, rather than assuming one. **Batch 2 update:** this pattern is more common than a two-off — four more companies (Bitpanda, Wallapop, Darktrace, Livi/Kry) also resolve their candidate-facing board on the `.eu.` host. That's 6 of 85 companies so far (~7%) on the EU host variant; budget real verification time for this specifically, it is not a rare edge case.
- **ATS migrations mid-flight (founder, 2026-07-23):** three companies in Batch 1 (Alan, Back Market, Ledger) currently show live, current job postings on *two different* ATS platforms simultaneously (Lever + Ashby in all three cases). This is evidence of active platform migration in the wild, not a one-off — the seed-list schema needs a way to record "this company may appear under two `(source, external_id)` roots at once" so the dedupe-by-company step in ingestion doesn't create duplicate job cards for the same posting during a migration window. Recommend: when both ATS boards are found for one company, prefer the one with the newer/higher job-count evidence, and re-check quarterly for migration completion. **Batch 2 follow-up (as requested):** for Back Market, this run's search surfaced multiple detailed, clearly-current Ashby postings across several departments at once (Senior Product Designer – after-sales; Senior Product Designer – Design System; Staff Backend Engineer; Senior Product Manager – Lifecycle; a Product Manager Intern role) — the volume, specificity, and cross-department spread of live Ashby listings is circumstantial evidence Ashby is the actively-maintained board for Back Market now, with Lever more likely the stale/legacy mirror. Ledger's Ashby board also resolves with detailed, current-sounding Product Designer requirements, weakly pointing the same direction. **This is inferred from listing richness in search results, not a direct posted-date or job-count comparison** — treat as a hypothesis, not a resolved fact; a real HTTP pull comparing `api.lever.co/v0/postings/{slug}` vs `api.ashbyhq.com/posting-api/job-board/{slug}` job counts and max posted-date for both companies is still the definitive test. For Alan specifically, no distinguishing signal turned up this run either way — still genuinely ambiguous, needs the same direct comparison.
- **Non-obvious/legacy slugs are common, not rare (founder, 2026-07-23):** of the 31 Greenhouse companies found this batch, at least 6 use a slug that is not a simple lowercase of the current brand name (Miro→`realtimeboardglobal`, Trade Republic→`traderepublicbank`, Bolt→`boltv2`, Taxfix→`taxfix2`, Aiven→`aiven36`, Mews→`mewssystems`). A seed-list generator that guesses `slugify(company_name)` and calls it done will silently produce ~15-20% dead/wrong feed_urls at this vertical's company mix. Each company needs an actual search-confirmed slug, not a template guess — budget founder/ingestion time accordingly for the 1,000–2,000 company target. **Batch 2 corroboration:** same rate held up — of 25 Greenhouse companies this batch, at least 5 needed a non-obvious slug (Picnic→`try-picnic`, Smartly.io→`smartlyio`, Darktrace→`darktracelimited`, ManyPets→`manygroup`, Tourlane→`tourlanegmbh`), plus 2 more with brand/sub-brand naming that needs care even though the slug itself is short (Ada Health→`adahealth`, Kry/Livi→`livi`). Treat "~20% of companies need a hand-confirmed slug" as the planning assumption, not the exception.
- **"Valid endpoint, zero current jobs" is a real, non-error state (founder, 2026-07-23):** Blinkist (`go1blinkist` on Greenhouse) and Deezer (`deezer` on SmartRecruiters) both appear to be real, correctly-slugged accounts that currently show no open postings in search results. The ingestion normalizer must treat a 200 response with an empty `jobs`/`postings` array as healthy-but-quiet, not as a signal to drop the company from the seed list — hiring volume is seasonal and bursty, especially at smaller companies. **Batch 2:** ManyPets (`manygroup`) is a likely second example — the board resolves and the company is actively hiring generally, but no current design-role posting surfaced this run; keep it in the seed list regardless.
- **Wise is on SmartRecruiters, not Greenhouse (founder, 2026-07-23):** worth flagging because Wise (fka TransferWise) has a well-known public case study with Greenhouse ("Wise transforms hiring to meet speed of growth," greenhouse.com/customer-stories) that could mislead a seed-list builder working from memory or from Greenhouse's own marketing pages into guessing `boards-api.greenhouse.io/v1/boards/wise` — that slug does not appear to exist; their live candidate-facing postings (confirmed via search, e.g. Staff Product Designer, London) are on `jobs.smartrecruiters.com/Wise/…`. A customer-story mention is not evidence of the *current* ATS.
- **Company-name collisions across unrelated companies on the same ATS (founder, Batch 2, 2026-07-23):** this is now a recurring failure mode, not a one-off (Batch 1 already flagged Cleo AI vs. unrelated US "Cleo" supply-chain software). Batch 2 found two more: (1) "Ada Health" (Berlin, health AI, slug `adahealth`) vs. an unrelated Toronto customer-service-AI company that is simply named "Ada" (slug `ada18`) — both post Product Designer roles on Greenhouse, easy to mix up. (2) The Danish neobank "Lunar" has no confirmed ATS this run, but search kept surfacing an unrelated US company called "Lunar Energy" on Greenhouse (slug `lunarenergy`) — a careless slugify pass would wire the wrong company's jobs into a "Lunar" seed-list row. **Recommendation: any seed-list entry generated from a bare company name, without a same-search job-posting sanity check on team/location/product description, is a live landmine for this vertical.** Also found a US-based mental-health-insurance startup called "Alma" (on Greenhouse) that is unrelated to Batch 1's French health-insurer "Alan" — similar-sounding names, different companies, different countries; excluded from this batch specifically to avoid the mix-up.
- **Workable now has (at least) two live URL schemes for the same company (founder, Batch 2, 2026-07-23):** Wallbox's careers surfaced under both a legacy scheme (`apply.workable.com/wallbox/j/{jobId}/`, subdomain-less but slug-based) and a newer hash-ID scheme (`jobs.workable.com/company/{opaque-hash}/jobs-at-wallbox`). Batch 1's Onfido row used the legacy slug-based form for its feed_url (`apply.workable.com/api/v1/widget/accounts/{slug}`), and Wallbox's legacy URL confirms that pattern still resolves for at least this company — but if a future company only exposes the hash-ID form (no legacy slug discoverable via search), the public widget-API feed_url template used in this seed list will not have an equivalent, and a different Workable API path may be needed. Flag any Workable company where only the hash-ID form can be found as needing manual API-path research, not a template guess.
- **Mirakl (and possibly others) run multiple regional Greenhouse boards under one brand (founder, Batch 2, 2026-07-23):** search surfaced `mirakl` (main/Paris), `mirakllabs`, `japan`, and `miraklamer` as separate Greenhouse board tokens all under the Mirakl brand — the same duplicate-board pattern Batch 1 flagged for Bolt (`boltv2` vs `bolt42`). Ingestion needs a policy for "one brand, multiple regional ATS boards": either merge all of a brand's regional boards into one company record (tagging each job with its source board for dedupe), or deliberately pick only the board most relevant to the target market (EU) and document why the others are excluded. Guessing "the board with the plain name is the only one" will silently under-count or duplicate jobs for multi-region companies.

## REJECTED (with reasons - do not re-propose without new evidence)
-
