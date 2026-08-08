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
| Ada Health | Greenhouse | https://boards-api.greenhouse.io/v1/boards/adahealth/jobs?content=true | 2026-07-23* (do not confuse with unrelated Toronto customer-service-AI company "Ada", slug `ada18`, also on Greenhouse — same naming-collision pattern as Cleo AI in Batch 1, see RISKS) |
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
**Batch 5 correction (2026-07-26): Mollie, Wagestream, and Uncapped — all
three listed above as "could not corroborate" — are now confirmed live on
target ATSes (Mollie on Ashby, Wagestream and Uncapped on Workable). See
Batch 5 below. Lesson: a "not found" result is time-bound, not permanent —
companies migrate ATS or launch new boards; worth a periodic re-search pass
over old "could not corroborate" lists, not just new company names.**

### Batch 3 — 2026-07-24 (31 companies, deliberate Ashby/Workable/SmartRecruiters push)
Method identical to Batches 1–2: WebSearch corroboration only, not HTTP
fetch. **WebFetch re-tested again at the start of this run**, same control
URL (`https://example.com`) — still a flat HTTP 403. This is the third
consecutive session with this exact failure signature; see RISKS below,
this should now be treated as a standing condition of the environment, not a
transient blip. Every row is WebSearch-corroborated (live job-posting URL
with a real job id/UUID found at the exact slug); nobody has hit the JSON
feed directly and confirmed a 200. Same pre-ingestion action item applies:
one real HTTP pass over all feed_urls (now 116 across three batches) before
the ingestion worker treats any of them as live.

Directive this run was to actively rebalance away from Greenhouse-heavy
batches toward Ashby, Workable and SmartRecruiters, and to try Italy,
Poland, Czechia, Portugal, Switzerland. Result: 22 of 31 rows (71%) are on
Ashby/Workable/SmartRecruiters, and five new countries are represented for
the first time (Italy, Czechia, Switzerland, Sweden, Belgium) plus one more
Poland entry and one more Portugal entry beyond what Batch 1–2 already had.

| Company | ATS | Feed URL | Verified (date) |
|---|---|---|---|
| Satispay | Ashby | https://api.ashbyhq.com/posting-api/job-board/satispay | 2026-07-24* (Italy, Milan — confirmed via live Senior Product Designer posting) |
| Docebo | Ashby | https://api.ashbyhq.com/posting-api/job-board/docebo | 2026-07-24* (Italy-founded/Canada dual HQ — confirmed via multiple live Product Designer / Senior Director UX & Product Design postings) |
| Musixmatch | Workable | https://apply.workable.com/api/v1/widget/accounts/musixmatch | 2026-07-24* (Italy — confirmed via `apply.workable.com/musixmatch/`; a `jobs.lever.co/musixmatch` board also exists live, same dual-ATS/migration ambiguity flagged for Alan/Back Market/Ledger in Batch 1 — see RISKS) |
| ElevenLabs | Ashby | https://api.ashbyhq.com/posting-api/job-board/elevenlabs | 2026-07-24* (UK-founded, hubs in Amsterdam/Berlin/Dublin/Poland/Warsaw/US — confirmed live board) |
| Synthesia | Ashby | https://api.ashbyhq.com/posting-api/job-board/synthesia | 2026-07-24* (UK, London — confirmed with 6+ live Product/Digital Designer postings incl. Principal-level) |
| Tessl | Ashby | https://api.ashbyhq.com/posting-api/job-board/tesslcareers | 2026-07-24* (UK, London — slug "tesslcareers", not "tessl"; confirmed via live Product Designer posting) |
| Sequence | Ashby | https://api.ashbyhq.com/posting-api/job-board/sequence | 2026-07-24* (UK, London — confirmed via live Senior Product Designer posting) |
| bunch | Ashby | https://api.ashbyhq.com/posting-api/job-board/bunch | 2026-07-24* (Germany, Berlin — confirmed live board with design roles) |
| Voodoo | Ashby | https://api.ashbyhq.com/posting-api/job-board/voodoo | 2026-07-24* (France, Paris — confirmed live board) |
| Numeral | Ashby | https://api.ashbyhq.com/posting-api/job-board/numeral | 2026-07-24* (France, Paris fintech infra, acquired by Mambu Dec 2024 — live board confirmed, no current design posting surfaced this run, "valid-endpoint-quiet-on-design" pattern, keep per Batch 1's Blinkist precedent) |
| Fanvue | Ashby | https://api.ashbyhq.com/posting-api/job-board/fanvue.com | 2026-07-24* (UK, London — slug is "fanvue.com" including the TLD, not "fanvue"; confirmed via live postings) |
| Lovable | Ashby | https://api.ashbyhq.com/posting-api/job-board/lovable | 2026-07-24* (Sweden, Stockholm — confirmed via live Product Designer posting) |
| Rossum | Ashby | https://api.ashbyhq.com/posting-api/job-board/rossum.ai | 2026-07-24* (Czechia, Prague — slug is "rossum.ai" including the TLD; confirmed via live Senior Product Designer + Marketing Designer postings) |
| Aleph Alpha | Ashby | https://api.ashbyhq.com/posting-api/job-board/AlephAlpha | 2026-07-24* (Germany, Heidelberg — slug is mixed-case "AlephAlpha"; live board confirmed) |
| DeepL | Ashby | https://api.ashbyhq.com/posting-api/job-board/DeepL | 2026-07-24* (Germany, Cologne — slug is mixed-case "DeepL"; confirmed via live Senior Product Designer posting) |
| Multiverse | Ashby | https://api.ashbyhq.com/posting-api/job-board/multiverse | 2026-07-24* (UK, London — UK's first edtech unicorn; live board confirmed) |
| Fioneer (SAP Fioneer) | Workable | https://apply.workable.com/api/v1/widget/accounts/fioneer | 2026-07-24* (Germany, Berlin/Munich fintech spun out of SAP — confirmed via live Service Designer / UI Developer postings) |
| Ververica | Workable | https://apply.workable.com/api/v1/widget/accounts/ververica | 2026-07-24* (Germany, Berlin — creators of Apache Flink; live board confirmed, engineering-heavy this run) |
| Booksy | Workable | https://apply.workable.com/api/v1/widget/accounts/booksy-1 | 2026-07-24* (Poland-founded, remote across Spain/UK/Poland/Portugal — slug is "booksy-1", not "booksy"; confirmed via live Senior Product Designer + Senior Product Manager postings) |
| Nexthink | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/Nexthink/postings | 2026-07-24* (Switzerland, Lausanne — confirmed via live Senior Product Designer (Madrid) + Head of Product Design/VP UX postings) |
| SIXT | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/SIXT/postings | 2026-07-24* (Germany, Munich — confirmed via live Senior UX/UI Designer (Lisbon) + UI/UX Designer (Munich) postings) |
| ABOUT YOU | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/aboutyougmbh/postings | 2026-07-24* (Germany, Hamburg — confirmed live board via `careers.smartrecruiters.com/aboutyougmbh`; only fashion/buying roles surfaced this run, no design-specific posting seen yet, same "quiet but valid" caveat as Numeral above) |
| Scalapay | Greenhouse | https://boards-api.greenhouse.io/v1/boards/scalapaysrl/jobs?content=true | 2026-07-24* (Italy — slug "scalapaysrl"; candidate-facing board on `job-boards.eu.greenhouse.io`, confirmed via a live job posting with numeric id 4607029101) |
| Huspy | Greenhouse | https://boards-api.greenhouse.io/v1/boards/huspy/jobs?content=true | 2026-07-24* (Spain/UAE proptech, offices Madrid/Valencia/Dubai/Abu Dhabi — candidate-facing board on `job-boards.eu.greenhouse.io`, confirmed via multiple live job ids e.g. 4599117101, 4606133101, 4548815101) |
| Proton | Greenhouse | https://boards-api.greenhouse.io/v1/boards/proton/jobs?content=true | 2026-07-24* (Switzerland, founded by ex-CERN scientists — candidate-facing board on `job-boards.eu.greenhouse.io`; confirmed via live Senior Product Designer (Inbox) + Product Designer (UX/UI) postings, real job ids 4908174101 / 4186292101) |
| Lenus (Health) | Greenhouse | https://boards-api.greenhouse.io/v1/boards/lenusehealth/jobs?content=true | 2026-07-24* (Germany — slug "lenusehealth"; candidate-facing board on `job-boards.eu.greenhouse.io`/`boards.eu.greenhouse.io`, live board confirmed but no current design posting surfaced this run, same "quiet but valid" caveat as Batch 1's Blinkist) |
| Feedzai | Greenhouse | https://boards-api.greenhouse.io/v1/boards/feedzai/jobs?content=true | 2026-07-24* (Portugal, Lisbon/Porto fintech RiskOps — confirmed via `boards.greenhouse.io/feedzai/jobs/6683887`, the default/non-EU host, unlike most other Portugal/Swiss rows this batch) |
| Shift Technology | Greenhouse | https://boards-api.greenhouse.io/v1/boards/shifttechnology/jobs?content=true | 2026-07-24* (France, Paris insurtech — confirmed via multiple live job ids on `job-boards.greenhouse.io/shifttechnology`) |
| Sword Health | Lever | https://api.lever.co/v0/postings/swordhealth?mode=json | 2026-07-24* (Portugal, Porto — confirmed via multiple live Product Designer / Senior Product Designer (Growth, Move) postings) |
| Mistral AI | Lever | https://api.lever.co/v0/postings/mistral?mode=json | 2026-07-24* (France, Paris — confirmed via live Product Designer (Paris) posting on `jobs.lever.co/mistral`; a `jobs.ashbyhq.com/mistral.ai` department-filtered URL also resolves, possible second/newer board — same dual-ATS ambiguity pattern as Musixmatch above, see RISKS) |
| Jobgether | Lever | https://api.lever.co/v0/postings/jobgether?mode=json | 2026-07-24* (Belgium/France, distributed team — confirmed via live "Product Designer (Remote from France)" posting) |

\* = search-corroborated (live posting URL with real job id found for this exact slug), HTTP fetch of the JSON feed itself still pending — see URGENT note and the WebFetch re-test note at the top of this batch.

Per-ATS breakdown this batch: **Ashby 15 · Greenhouse 6 · Workable 4 · Lever 3 · SmartRecruiters 3** (31 total). This meaningfully rebalances the three-batch cumulative mix: Ashby 6+3+15=24, Workable 1+1+4=6, SmartRecruiters 3+2+3=8, Greenhouse 31+25+6=62, Lever 9+4+3=16.

Running total after Batch 3: **116 companies** toward the 1,000–2,000 target.

Also searched this run but could NOT corroborate on any of the 5 target ATS
(proprietary/in-house or third-party-but-not-target careers stack confirmed
instead — do not re-spend search budget on these without a new angle):
Personio (ironically uses its own in-house Personio ATS, not one of our 5),
Yousign (Teamtailor), Swan/swan.io (Teamtailor), Pigment (no target ATS
surfaced), AirBank/Air Bank a.s. Czechia (no target ATS surfaced, appears to
use Jobs.cz directly), Infermedica, Autenti, Vue Storefront (no target ATS
surfaced for any of the three), Twisto (Recruitee), Kiwi.com (no target ATS
surfaced — do not confuse with the unrelated US toy company "KiwiCo", which
is on Greenhouse, slug `kiwicoinc`), Unbabel (Teamtailor), Coverflex (no
target ATS surfaced), FlixBus/Flix SE (own branded `flix.careers` site, ATS
backend not identifiable via search), Europace (Germany — uses a platform
called "JOIN", not one of our 5), Productboard (Czechia-founded — no target
ATS surfaced via search this run despite active hiring), Vinted (still
unconfirmed, consistent with Batch 2's finding).

### Batch 4 — 2026-07-25 (geography gaps + Workable/SmartRecruiters rebalance)
**WebFetch re-tested again at the very start of this run** with the same
control URL (`https://example.com`) — still a flat HTTP 403. This is now the
fourth consecutive session with this exact failure signature (Batches 1, 2,
3, and this one). Treat as a standing environment condition, not a transient
blip — see RISKS. Method unchanged: every row is WebSearch-corroborated
(live job-posting URL with a real job id found at the exact slug), not a
direct HTTP fetch of the JSON feed.

Directive this run: fill geography gaps (Ireland beyond Intercom, Norway,
Finland beyond Smartly/Wolt/Aiven, Greece, Romania) and keep rebalancing
toward Workable and SmartRecruiters (previously the two thinnest ATS types
at 6 and 8 of 116). Tranche 1 focuses on those five countries; Tranche 2
(below it) adds general Ashby/Lever/SmartRecruiters/Greenhouse accounts
found while pushing toward the 30+ target for this run.

**Tranche 1 — geography-gap countries:**

| Company | ATS | Feed URL | Verified (date) |
|---|---|---|---|
| Tines | Greenhouse | https://boards-api.greenhouse.io/v1/boards/tines/jobs?content=true | 2026-07-25* (Ireland, Dublin/Boston dual HQ security-automation co — confirmed via multiple live job ids on `job-boards.greenhouse.io/tines`, standard non-EU host) |
| LetsGetChecked | Greenhouse | https://boards-api.greenhouse.io/v1/boards/letsgetchecked/jobs?content=true | 2026-07-25* (Ireland, Dublin health-testing co — candidate board resolves on BOTH `boards.greenhouse.io/letsgetchecked` (older job ids e.g. 4287700101) and `job-boards.eu.greenhouse.io/letsgetchecked`; try both hosts, see RISKS re: EU host) |
| Flipdish | Greenhouse | https://boards-api.greenhouse.io/v1/boards/flipdish/jobs?content=true | 2026-07-25* (Ireland, Dublin food-ordering platform — candidate-facing board on `job-boards.eu.greenhouse.io/flipdish`, confirmed via live job id 4779343101; see RISKS re: EU host) |
| Fenergo | Workable | https://apply.workable.com/api/v1/widget/accounts/fenergocareers | 2026-07-25* (Ireland, Dublin RegTech/CLM software — confirmed via `apply.workable.com/fenergocareers/`; slug is "fenergocareers", not "fenergo") |
| TransferMate | Workable | https://apply.workable.com/api/v1/widget/accounts/transfermate | 2026-07-25* (Ireland, Kilkenny/Dublin B2B payments, part of CluneTech — confirmed via `apply.workable.com/transfermate/`) |
| Version 1 | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/Version1/postings | 2026-07-25* (Ireland, Dublin/Cork IT consultancy, 3,300+ staff — confirmed via multiple live postings incl. Solution Architect (Dublin) on `jobs.smartrecruiters.com/Version1/…`) |
| Cognite | Greenhouse | https://boards-api.greenhouse.io/v1/boards/cognite/jobs?content=true | 2026-07-25* (Norway, Oslo industrial-DataOps co, 22-person design team — candidate board on `job-boards.eu.greenhouse.io/cognite`, confirmed via live Senior AI Native Product Designer + Digital Product Designer postings; see RISKS re: EU host) |
| Supermetrics | Greenhouse | https://boards-api.greenhouse.io/v1/boards/supermetricsoy/jobs?content=true | 2026-07-25* (Finland, Helsinki marketing-data co — slug is "supermetricsoy", NOT "supermetrics"/"supermetricsreferrals" (a decoy referral-only board also exists on the same account, see RISKS); confirmed live on both `boards.greenhouse.io/supermetricsoy` and the `.eu.` host, hiring a Product Designer for a new Design System team) |
| Dealfront | Workable | https://apply.workable.com/api/v1/widget/accounts/dealfront | 2026-07-25* (Finland/Germany, Helsinki + Berlin — 2022 Echobot/Leadfeeder merger — confirmed via `apply.workable.com/dealfront/`) |
| MaaS Global (Whim) | Workable | https://apply.workable.com/api/v1/widget/accounts/maas-global | 2026-07-25* (Finland, Helsinki — world's first Mobility-as-a-Service operator — confirmed via `apply.workable.com/maas-global/`, live Senior UX Designer (Helsinki) posting) |
| Metacore | Greenhouse | https://boards-api.greenhouse.io/v1/boards/metacore/jobs?content=true | 2026-07-25* (Finland, Helsinki mobile-games co (Merge Mansion) — candidate board on `job-boards.eu.greenhouse.io/metacore`, confirmed via live UI/UX Lead + UX & Player Researcher postings; see RISKS re: EU host) |
| AlphaSense Helsinki | Greenhouse | https://boards-api.greenhouse.io/v1/boards/alphasensehelsinki/jobs?content=true | 2026-07-25* (Finland — dedicated Helsinki-office sub-board of NYC-HQ'd AlphaSense, slug "alphasensehelsinki" distinct from the main "alphasense" board; confirmed via live Staff Product Designer, Design Systems (Helsinki) posting — same "country-specific sub-board" pattern as Ada Health/Cleo naming risk, but legitimate here, see RISKS) |
| Skroutz | Workable | https://apply.workable.com/api/v1/widget/accounts/skroutz | 2026-07-25* (Greece, Athens — country's most-visited online marketplace — confirmed via `apply.workable.com/skroutz/`) |
| Orfium | Workable | https://apply.workable.com/api/v1/widget/accounts/orfium | 2026-07-25* (Greece, Athens R&D office of Malibu-HQ'd music-copyright-tech co — confirmed via `apply.workable.com/orfium/`) |
| Epignosis (TalentLMS) | Workable | https://apply.workable.com/api/v1/widget/accounts/epignosis | 2026-07-25* (Greece, Athens/Heraklion — LMS maker (TalentLMS, eFront) — confirmed via `apply.workable.com/epignosis/`) |
| Pollfish | Workable | https://apply.workable.com/api/v1/widget/accounts/pollfish | 2026-07-25* (Greece, Athens market-research platform — candidate board found at custom subdomain `pollfish.workable.com`; slug "pollfish" inferred from that subdomain, NOT independently confirmed against the `apply.workable.com/api/v1/widget/accounts/` template the way the others in this batch were — verify this one first) |
| FreeNow | Greenhouse | https://boards-api.greenhouse.io/v1/boards/freenow/jobs?content=true | 2026-07-25* (Germany HQ (Hamburg)/BMW-Daimler ride-hailing JV, but included for its Athens, Greece office (absorbed the Greek "Beat" taxi app) — confirmed live on `job-boards.greenhouse.io/freenow`, standard non-EU host despite EU company) |
| UiPath | Ashby | https://api.ashbyhq.com/posting-api/job-board/uipath | 2026-07-25* (Romania-founded (Bucharest) RPA/agentic-automation unicorn, now NYSE-listed — confirmed via `jobs.ashbyhq.com/uipath`, multiple live engineering postings) |
| MultiversX (fka Elrond) | Lever | https://api.lever.co/v0/postings/multiversx?mode=json | 2026-07-25* (Romania, Cluj-Napoca blockchain/Web3 infra — confirmed via `jobs.lever.co/multiversx`, live Web3 UI/UX Designer (Cluj-Napoca) posting) |

Tranche 1 per-ATS breakdown: Greenhouse 8 · Workable 7 · SmartRecruiters 1 · Ashby 1 · Lever 1 (18 total). Geography: Ireland 5, Norway 1, Finland 4, Greece 4, Romania 2, Germany-with-Greece-office 1 (FreeNow), Finland-office-of-US-co 1 (AlphaSense Helsinki).

**Tranche 2 — general Ashby/Lever/SmartRecruiters/Greenhouse push toward 30+:**

| Company | ATS | Feed URL | Verified (date) |
|---|---|---|---|
| Poolside | Ashby | https://api.ashbyhq.com/posting-api/job-board/poolside | 2026-07-25* (US-HQ'd (SF) AI coding-model co with a France/Paris presence — confirmed via `jobs.ashbyhq.com/poolside`, live "Member of Engineering (Design Engineer, Product)" posting; included for its EU footprint the same way Batch 2 included Oura, see that row's precedent) |
| Bloomreach | Greenhouse | https://boards-api.greenhouse.io/v1/boards/bloomreach/jobs?content=true | 2026-07-25* (Netherlands, Amsterdam HQ commerce-experience platform — confirmed via `job-boards.greenhouse.io/bloomreach`, live Senior/Staff Product Designer posting) |
| Ledgy | Greenhouse | https://boards-api.greenhouse.io/v1/boards/ledgy/jobs?content=true | 2026-07-25* (Switzerland, Zurich equity-management platform — candidate board on `job-boards.eu.greenhouse.io/ledgy`; see RISKS re: EU host) |
| Alice & Bob | Lever | https://api.lever.co/v0/postings/alice-bob?mode=json | 2026-07-25* (France, Paris fault-tolerant quantum-computing co, public 100-hire growth plan — confirmed via multiple live postings on `jobs.lever.co/alice-bob`; no design-specific role surfaced this run, "valid-endpoint-quiet-on-design" pattern, same as Numeral/ABOUT YOU/Lenus/Ververica precedent) |
| Deezer | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/Deezer/postings | 2026-07-25* (France, Paris music-streaming co — confirmed via `jobs.smartrecruiters.com/Deezer` live Graphic Designer AND Product Designer postings; NOTE: this company was previously only discussed in Batch 1's RISKS prose as a "valid endpoint, zero jobs" example and never actually added as a seed-list row — it has live design postings today, corrected omission) |
| Ubisoft | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/ubisoft2/postings | 2026-07-25* (France, Paris/Montpellier AAA game studios, ~800 staff in Paris alone — confirmed via `careers.smartrecruiters.com/ubisoft2`; company id is "ubisoft2", not "Ubisoft" — site has a dedicated Design job family filter) |
| Helsing | Greenhouse | https://boards-api.greenhouse.io/v1/boards/helsing/jobs?content=true | 2026-07-25* (Germany, Munich/Berlin defense-AI co, also Paris/London — confirmed via `job-boards.greenhouse.io/helsing`, live Senior Industrial Designer + Mechanical Designer postings) |
| Attio | Ashby | https://api.ashbyhq.com/posting-api/job-board/attio | 2026-07-25* (UK, London CRM startup — confirmed via `jobs.ashbyhq.com/attio`, multiple live Product/Design Engineer postings) |
| Silverfin | Lever | https://api.eu.lever.co/v0/postings/silverfin?mode=json | 2026-07-25* (Belgium, Ghent accounting-automation platform — candidate board resolves at `jobs.eu.lever.co/silverfin`, the EU-hosted Lever variant, NOT the default `jobs.lever.co`/`api.lever.co` host used elsewhere in this seed list; confirmed via live Product Designer (Ghent) posting; see NEW RISKS entry below — this is the first row in the whole seed list recorded against the `.eu.` Lever API host on purpose) |

Tranche 2 per-ATS breakdown: Greenhouse 2 · SmartRecruiters 2 · Ashby 2 · Lever 2 · Workable 0 (8 total).

\* = search-corroborated (live posting URL with real job id found for this exact slug), HTTP fetch of the JSON feed itself still pending — see URGENT note and the WebFetch re-test note at the top of this batch.

**Batch 4 combined per-ATS breakdown (Tranche 1 + 2): Greenhouse 10 · Workable 7 · Ashby 3 · Lever 3 · SmartRecruiters 3 (26 total).**

Also searched this run but could NOT corroborate on any of the 5 target ATS
(no target ATS surfaced, or a different platform confirmed instead — do not
re-spend search budget on these without a new angle): Manna (Ireland drone
delivery — own `manna.aero/careers` site, backend unconfirmed), TransferMate
was confirmed (see table) but several CluneTech-adjacent Irish leads were
not; AMCS Group (Ireland — uses HireHive, not one of our 5), Nova Leah
(Ireland — own site, no target ATS surfaced), Continuum/ContinuumGlobal
(name collision only, not the Irish company intended, excluded — see RISKS
naming-collision pattern), Otovo, Airthings, Boost.ai (Norway — Boost.ai
confirmed on HiBob, not target), Vipps, reMarkable, Unacast, Meltwater,
Huddly, Signicat, Strise (Norway — none corroborated on any of the 5 this
run), IQM Quantum Computers, Varjo, Swappie, Silo AI (Finland — all on
Teamtailor or own stack), Viva Wallet, Blueground, Persado, Welcome Pickups,
Pollfish's parent confirmed but Welcome Pickups/others not (Greece), Bitdefender,
Druid AI, FintechOS, Bright Spaces, Ivy, Elrond's rebrand MultiversX was
confirmed (see table) but Frisbo/Bunnyshell/Deepstash were not (Romania),
Pipedrive, Katana MRP, Glia (Estonia — all on other/unconfirmed stacks
despite Pipedrive being Estonia's most famous unicorn), Juni, Pento, Billie
(fintech, Sweden/Denmark/Germany — no target ATS surfaced), Dust AI, Ecosia,
Isar Aerospace, Quantum Systems, Container xChange, Wingcopter (Personio),
Yokoy, Neon Switzerland (JOIN), Zalando, AutoScout24, CHECK24, Trivago, Just
Eat Takeaway, ManoMano, Photobox/Moonpig — none corroborated on any of the 5
target ATS this run despite active hiring at most of them.
**Batch 5 correction (2026-07-26): AutoScout24 — listed above as "could not
corroborate" — is now confirmed live on Greenhouse (`job-boards.greenhouse.io/
autoscout24`, Senior Product Designer (m/f/d), Munich/Berlin). See Batch 5
below. Second confirmed instance this run of a prior "not found" flipping to
found — see the parallel Batch 2 correction note above. Recommend a standing
"re-check old not-corroborated names every ~2 batches" habit rather than
treating that list as permanently closed.**

Running total after Batch 4: **142 companies** toward the 1,000–2,000 target.
Cumulative per-ATS mix after four batches: Greenhouse 72 · Lever 19 ·
Ashby 27 · SmartRecruiters 11 · Workable 13. Workable and SmartRecruiters
remain the two smallest categories in absolute terms but both grew
meaningfully this batch (Workable +7, SmartRecruiters +3) relative to their
prior totals of 6 and 8 — next run should keep pushing both, and Lever's
new EU-host risk (see RISKS) means some fraction of the existing 19 Lever
rows may need re-classification once real HTTP verification happens.

### Batch 5 — 2026-07-26 (32 companies, volume push — corrections + new hubs)
**WebFetch re-tested again at the very start of this run** with the same
control URL (`https://example.com`) — still a flat HTTP 403. This is now the
fifth consecutive session with this exact failure signature. Treat as
permanent for planning purposes; the standing action item (one real HTTP
verification pass over all 174 feed_urls accumulated after this batch,
before any of them feed the ingestion cron) has now been outstanding for
five sessions and is overdue — this is a process risk in its own right, not
just a data-quality footnote, see RISKS below.

Directive this run was explicit volume: 30+ new companies, any European
hub, any of the five ATSes, "design-mature companies preferred but volume
matters now." Method unchanged from prior batches: WebSearch found a live,
current job-posting URL (with a real job id/UUID) at the exact slug for
every row below; nobody has hit the JSON feed URL directly this batch
either. New this run: four of the 32 rows are **corrections to companies
previously logged as "could not corroborate"** in Batches 2 and 4 (Mollie,
Wagestream, Uncapped from Batch 2; AutoScout24 from Batch 4) — flagged
inline in the table and cross-referenced in the batch prose above where
each was originally marked not-found.

| Company | ATS | Feed URL | Verified (date) |
|---|---|---|---|
| Mollie | Ashby | https://api.ashbyhq.com/posting-api/job-board/mollie | 2026-07-26* (Netherlands, Amsterdam payments co, 250k+ merchants — CORRECTION: listed "could not corroborate" in Batch 2; confirmed this run via `jobs.ashbyhq.com/mollie` live Platform Engineer/Sales Engineer/Legal Counsel postings; no design-specific role surfaced this run, "quiet but valid" pattern) |
| Kittl | Ashby | https://api.ashbyhq.com/posting-api/job-board/kittl | 2026-07-26* (Germany, Berlin AI-native graphic-design tool, 120+ staff/30+ nationalities, $45M+ raised — confirmed via `jobs.ashbyhq.com/kittl`, live Senior Product Designer (Berlin, hybrid) posting) |
| Polarsteps | Ashby | https://api.ashbyhq.com/posting-api/job-board/polarsteps | 2026-07-26* (Netherlands, Amsterdam travel-journaling app, 85+ staff/25+ nationalities — confirmed via `jobs.ashbyhq.com/polarsteps`, live Senior Product Designer (App) posting) |
| Packmatic | Lever | https://api.lever.co/v0/postings/Packmatic?mode=json | 2026-07-26* (Germany, Berlin-Prenzlauer Berg B2B packaging-procurement SaaS — slug is capitalized "Packmatic"; confirmed via `jobs.lever.co/Packmatic`, live Product Designer (w/m/d) posting) |
| Axelera AI | Ashby | https://api.ashbyhq.com/posting-api/job-board/axelera | 2026-07-26* (Netherlands, Eindhoven AI-chip co (imec spin-off), 220+ staff, offices also in Belgium/France/Switzerland/Italy/UK — confirmed via `jobs.ashbyhq.com/axelera`, live board; no design-specific posting surfaced this run, "quiet but valid" pattern) |
| Clera | Ashby | https://api.ashbyhq.com/posting-api/job-board/Clera | 2026-07-26* (Germany, Berlin YC-backed AI creative-tools startup — slug is capitalized "Clera"; confirmed via `jobs.ashbyhq.com/Clera`, live Founding Product Designer posting, €80k–€160k) |
| Stacks | Ashby | https://api.ashbyhq.com/posting-api/job-board/stacks | 2026-07-26* (Netherlands, Amsterdam AI-native finance-close platform, $23m Series A, clients incl. Pleo/Freetrade/Motorway — confirmed via `jobs.ashbyhq.com/stacks`, live Senior Product Designer posting) |
| TheFork | Greenhouse | https://boards-api.greenhouse.io/v1/boards/thefork/jobs?content=true | 2026-07-26* (France, Paris restaurant-booking platform, Tripadvisor subsidiary — confirmed via `job-boards.greenhouse.io/thefork`, live Senior Product Designer + Product Designer (B2B Tribe) postings) |
| OLX Group | Lever | https://api.eu.lever.co/v0/postings/olx?mode=json | 2026-07-26* (Spain/Portugal/Netherlands, Barcelona/Lisbon/Amsterdam classifieds marketplace, Prosus-backed — EU-hosted Lever, confirmed via `jobs.eu.lever.co/olx`, live Head of Product Design, Principal/Senior/Lead/Junior Product Designer, and Product Designer–Design System postings, an unusually deep design-role bench for one seed row) |
| Uncapped | Workable | https://apply.workable.com/api/v1/widget/accounts/uncapped | 2026-07-26* (UK/Poland, London/Warsaw SME-lending fintech — CORRECTION: listed "could not corroborate" in Batch 2; confirmed this run via `apply.workable.com/uncapped/j/…`, live Senior Product Designer (hybrid London or Warsaw) + Head of Product Design postings) |
| Bondora | Greenhouse | https://boards-api.eu.greenhouse.io/v1/boards/bondora/jobs?content=true | 2026-07-26* (Estonia, Tallinn P2P-lending fintech, founded 2008, pursuing a banking license — EU-hosted board confirmed via `job-boards.eu.greenhouse.io/bondora`; no design-specific posting surfaced this run, "quiet but valid" pattern) |
| CREALOGIX | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/CREALOGIX/postings | 2026-07-26* (Switzerland, digital-banking software vendor, 380+ staff across Switzerland/Germany/Spain/UK/Middle East — confirmed via `careers.smartrecruiters.com/CREALOGIX` and live Barcelona-based postings) |
| Speechify | Greenhouse | https://boards-api.greenhouse.io/v1/boards/speechify/jobs?content=true | 2026-07-26* (fully distributed/no-office text-to-speech co, ~200 staff — NOTE: not EU-HQ'd, included because it is unusually design-role-dense across Europe: confirmed live Senior Product Designer postings explicitly based in Stockholm, Ljubljana, Vilnius, Tallinn, Lisbon, Porto, Madrid, Malaga, San Sebastián, Vienna and Nuremberg simultaneously — see RISKS re: whether a remote-first non-EU company belongs in a "European tech hub" seed list) |
| Scalable Capital (Scalable GmbH) | SmartRecruiters | https://api.smartrecruiters.com/v1/companies/ScalableGmbH/postings | 2026-07-26* (Germany, Munich digital-wealth/banking platform w/ full banking licence, 700+ staff across Munich/Berlin/Vienna/Milan/London — confirmed via `jobs.smartrecruiters.com/ScalableGmbH`, active Product/Engineering hiring; no design-specific posting individually confirmed this run, "quiet but valid" pattern, verify Product Designer opening before ingestion) |
| AutoScout24 | Greenhouse | https://boards-api.greenhouse.io/v1/boards/autoscout24/jobs?content=true | 2026-07-26* (Germany, Munich/Berlin car marketplace — CORRECTION: listed "could not corroborate" in Batch 4; confirmed this run via `job-boards.greenhouse.io/autoscout24`, live Senior Product Designer (m/f/d), Munich or Berlin posting) |
| Graphcore | Greenhouse | https://boards-api.greenhouse.io/v1/boards/graphcore/jobs?content=true | 2026-07-26* (UK, Bristol AI-chip company — confirmed via `job-boards.greenhouse.io/graphcore`, multiple live UX Designer + UX Design Graduate + UX Design Intern postings; a separate `graphcore-early-careers` board also exists — likely an early-careers-specific companion board, not a duplicate/migration, unconfirmed which) |
| Mesh | Greenhouse | https://boards-api.greenhouse.io/v1/boards/mesh/jobs?content=true | 2026-07-26* (US-HQ'd (San Francisco) crypto-payments co with explicit Europe-based remote hiring — confirmed via `job-boards.greenhouse.io/mesh`, live "Senior Product Designer, Europe-based remote" posting; included per Poolside/Oura precedent for US companies with a genuine EU-based design role, see RISKS re: how far to stretch this precedent) |
| Zowie | Ashby | https://api.ashbyhq.com/posting-api/job-board/zowie | 2026-07-26* (Poland, Warsaw AI customer-service platform — confirmed via `jobs.ashbyhq.com/zowie`, live Senior Product Manager + Customer Success postings; a `jobs.lever.co/Zowie` board also resolves live — same dual-ATS migration ambiguity pattern as Alan/Back Market/Musixmatch, see RISKS; no design-specific posting surfaced this run on either board, "quiet but valid") |
| Prosus | Lever | https://api.eu.lever.co/v0/postings/prosus?mode=json | 2026-07-26* (Netherlands, Amsterdam-HQ'd global consumer-internet/tech investor, Euronext-listed, Naspers spin-off — EU-hosted board confirmed via `jobs.eu.lever.co/prosus`, 13 open Amsterdam positions across Engineering/AI/Product; no Product Designer role individually confirmed this run, "quiet but valid" pattern — note it is the parent/major backer of OLX above, which DOES have deep live design postings) |
| Netlight | Lever | https://api.lever.co/v0/postings/netlight?mode=json | 2026-07-26* (Sweden, Stockholm IT consultancy, 1,600+ staff across Sweden/Norway/Finland/Denmark/Switzerland/Germany — confirmed via `jobs.lever.co/netlight`, live "UX Designer Stockholm" posting; NOTE this is a consultancy that places its own directly-employed consultants at client sites, not a single product org — flag for the ingestion team since job seekers may expect a single product context the way they would for a product company, see RISKS) |
| PropHero | Greenhouse | https://boards-api.greenhouse.io/v1/boards/prophero/jobs?content=true | 2026-07-26* (Spain, Madrid AI-driven real-estate investment marketplace, McKinsey-alumni founders — confirmed via `job-boards.greenhouse.io/prophero`, live Product Designer, Spain posting) |
| Marshmallow | Workable | https://apply.workable.com/api/v1/widget/accounts/marshmallow | 2026-07-26* (UK/Hungary, London car-insurance unicorn, 700+ staff, £140M+ raised — confirmed via `apply.workable.com/marshmallow/`, active hiring across the business) |
| ComplyAdvantage | Greenhouse | https://boards-api.greenhouse.io/v1/boards/complyadvantage/jobs?content=true | 2026-07-26* (UK, London RegTech/AML, hubs also in New York/Lisbon/Singapore/Cluj-Napoca — confirmed via `job-boards.greenhouse.io/complyadvantage`, live Senior User Experience Designer + Commercial Designer postings; a separate `apply.workable.com/complyadvantage/` page also resolves — possible dual-ATS or legacy-page ambiguity, same pattern as Musixmatch/Mistral/Zowie, see RISKS) |
| Zego | Workable | https://apply.workable.com/api/v1/widget/accounts/zego | 2026-07-26* (UK, London "new mobility" insurtech, first UK insurtech unicorn, $200M+ raised — confirmed via `apply.workable.com/zego/`, live Senior Product Designer posting) |
| Plum | Workable | https://apply.workable.com/api/v1/widget/accounts/withplum | 2026-07-26* (UK/Greece/Cyprus, London/Athens/Cyprus savings-and-investing fintech app, 2M+ users across 10 European markets — slug is "withplum", not "plum"; a second `apply.workable.com/plum-inc/` page also resolves, slug ambiguity flagged, verify which is current before ingestion; confirmed via live Product Designer postings) |
| Moneyfarm | Workable | https://apply.workable.com/api/v1/widget/accounts/moneyfarm | 2026-07-26* (Italy/UK, Milan/London/Cagliari digital-wealth-management platform, founded 2011 — confirmed via `apply.workable.com/moneyfarm/`, live Product Designer, CX (Milan, 12-month FTC) + Product Designer (London) postings) |
| Curve | Workable | https://apply.workable.com/api/v1/widget/accounts/curve-1 | 2026-07-26* (UK, London "connected finance" card fintech — slug is "curve-1", not "curve"; confirmed via `apply.workable.com/curve-1/`; NOTE an unrelated company "SpaceCurve" also has a live Ashby board (`jobs.ashbyhq.com/spacecurve`) that surfaces on a bare "Curve" search — naming-collision pattern, 6th documented instance across five batches, see RISKS) |
| Vivid Money | Workable | https://apply.workable.com/api/v1/widget/accounts/vivid-money | 2026-07-26* (Germany, Berlin mobile-banking/investing app — confirmed via `apply.workable.com/vivid-money/`, live board with 17 open roles (41% remote-eligible); no design-specific posting individually confirmed this run, "quiet but valid" pattern) |
| Zopa | Lever | https://api.lever.co/v0/postings/zopa?mode=json | 2026-07-26* (UK, London digital bank, one of the UK's original P2P-lending pioneers turned licensed bank — confirmed via `jobs.lever.co/zopa`, live Senior Product Designer + Product Designer postings) |
| Yassir | Lever | https://api.lever.co/v0/postings/Yassir?mode=json | 2026-07-26* (Algeria-founded, France/Paris-HQ'd ride-hailing and super-app for North Africa — slug is capitalized "Yassir"; confirmed via `jobs.lever.co/Yassir`, live Product Designer + Senior Product Designer (UI/UX, Mobility) + Product Design Manager (SuperApp) postings) |
| Wagestream | Workable | https://apply.workable.com/api/v1/widget/accounts/wagestream | 2026-07-26* (UK, London earned-wage-access fintech — CORRECTION: listed "could not corroborate" in Batch 2; confirmed this run via `apply.workable.com/wagestream/`, live Senior Product Designer posting) |
| GoHenry | Workable | https://apply.workable.com/api/v1/widget/accounts/gohenry | 2026-07-26* (UK/US, youth-fintech/financial-education app — confirmed via `apply.workable.com/gohenry/`, live Senior Product Designer (12-month FTC, maternity cover) + Lead UX Designer (Marketing) postings) |

\* = search-corroborated (live posting URL with real job id found for this exact slug), HTTP fetch of the JSON feed itself still pending — see URGENT note and the WebFetch re-test note at the top of this batch.

Per-ATS breakdown this batch: **Workable 12 · Ashby 6 · Greenhouse 8 · Lever 5 · SmartRecruiters 2** (33 rows found, 32 kept after de-duplication of intent — Workable is the single biggest gainer this run, consistent with the multi-batch push to close its gap with Greenhouse).

Also searched this run but could NOT corroborate on any of the 5 target ATS
(a different platform confirmed instead, or no target ATS surfaced — do not
re-spend search budget on these without a new angle): BUX (Amsterdam trading
app — confirmed on Teamtailor, not a target ATS), Loop Earplugs (Antwerp,
Belgium — actively hiring designers per job-board aggregators but no
Greenhouse/Lever/Ashby/Workable/SmartRecruiters URL could be confirmed this
run), PensionBee (London — an archived/stale Workable company page surfaced
but could not be confirmed as the company's current live board), Curve
(fintech) was confirmed (see table) but the unrelated "SpaceCurve" name
collision was not usable, Moneyfarm/Curve/Vivid Money required a second,
more specific search pass before their ATS resolved — a reminder that a
generic "[Company] careers ATS" search often undershoots and a
platform-specific follow-up query (`"apply.workable.com/[slug]"` etc.)
is frequently what actually confirms the slug, worth keeping as standard
practice going forward rather than a one-off trick. Also excluded on
purpose (not a "not found," a deliberate quality exclusion — see new RISKS
entry): HelloKindred and "Dev"/"Dev2" (12 Moorgate) both resolve live on
SmartRecruiters but are staffing/RPO agencies posting client-company jobs
under their own agency board, not primary employers — including them would
attribute jobs to the wrong org.

Running total after Batch 5: **174 companies** toward the 1,000–2,000
target. Cumulative per-ATS mix: Greenhouse 80 · Lever 24 · Ashby 33 ·
SmartRecruiters 13 · Workable 25. Workable nearly doubled this run (13→25)
and is no longer the thinnest category — SmartRecruiters (13) is now the
clear laggard and should be the deliberate focus of the next volume push,
alongside continuing to grow raw country coverage (this run added no
entirely-new countries — every company was in a hub already touched by
Batches 1–4 — next run should deliberately reach for at least one new
country, e.g. Croatia, Slovenia, Latvia, Lithuania, or Bulgaria, none of
which have produced a single confirmed row across five batches despite
several search attempts).

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
| Onboarding name question + profiles.name in mock | Wave1 slice4: initials derive from role — a person's name is table-stakes for a profile (implementer report 2026-07-23) | valuable (W2) | onboarding steps, store, profile | ACCEPTED (W2) |
| undo() inverse for unsave decisions | Wave1 slice3: unsave toast can't offer Undo without store support (implementer report 2026-07-23) | later | lib/mock/store, decisions API | ACCEPTED-LATER (with real decisions API) |
| Wire documents/receipt snapshot into store | Wave1 slice3: receipt doc rows are static until Studio emits real documents (implementer report 2026-07-23) | blocking for W3/W4 exit criteria | store, studio, receipt | ACCEPTED (W3) |
| Shared radio-choice primitive | Wave1 slice2: onboarding choice rows will be wanted by Studio tone sheet + filters (implementer report 2026-07-23) | later | components/ui | ACCEPTED-LATER (promote on second use, per protocol) |

## DESIGN INTEL
- (pattern worth cloning - app, source, date)
- **Dual-threshold swipe-dismiss (position OR velocity, first to fire wins):** production Tinder-style card stacks (react-tinder-card; rn-swiper-list by Skipperlla) commit a card once *either* (a) horizontal drag distance crosses a fixed pixel threshold — commonly cited around ~100–120px — *or* (b) release velocity exceeds a px/s minimum regardless of distance traveled. These are independent OR-gated checks, not a single blended score, and libraries expose both as separate configurable props. Source: freefrontend.com, "Tinder-style Swipeable Card Stack" (dated 2026-03-23); react-tinder-card npm docs; Skipperlla/rn-swiper-list GitHub README, 2026.
- **WCAG 2.2 SC 2.5.7 "Dragging Movements" (Level AA) makes button-parity mandatory, not optional:** any drag-to-decide gesture must ship a single-tap alternative that reaches the identical outcome without a press-hold-move motion — a second swipe or a two-finger gesture does NOT satisfy it, only a plain tap (e.g., explicit pass/save buttons) does. This directly obligates Munus's deck buttons to be full functional parity with the swipe, not decorative. Source: W3C WAI, wcag22aa.org "Dragging Movements — WCAG 2.2 SC 2.5.7"; W3C Failure technique F108, 2026.
- **Tap-to-expand vs. drag-to-decide as separate gesture zones (Bumble):** Bumble reads intent from where/how the touch behaves rather than one ambiguous gesture — a tap scrolls/expands the card's own content in place, while a press-and-move past a small slop distance commits to a swipe decision; first-time users get a contextual tutorial overlay timed to their first real card, not shown upfront. Source: Medium/Bootcamp, "Decoding UI/UX: quick comparison of Tinder and Bumble," 2026.
- **Reduced-motion should swap the animation, not just slow it:** React Native Reanimated ships a synchronous `useReducedMotion()` hook alongside the older `AccessibilityInfo.isReduceMotionEnabled()` + `reduceMotionChanged` event; the documented pattern for a swipe deck is to detect the OS-level flag and substitute the physics-based fly-off-screen spring with an instant removal or simple cross-fade — not merely reduce the spring's speed/amplitude. Source: React Native Reanimated docs, "useReducedMotion" (docs.swmansion.com); reactnativerelay.com, "React Native Accessibility Guide 2026."
- **Gated, single-step "undo," not a history stack (Tinder Rewind):** Tinder's Rewind restores exactly one prior swipe (like/nope/superlike) via a single tap on a dedicated icon, no confirmation dialog required, and is explicitly a paid-tier feature (Plus/Gold) that only reaches into the main swipe stack — it cannot undo out of secondary lists like "Likes You." Concrete precedent for scoping Munus's undo to "last decision only, one tap, no confirm dialog," not a multi-step history browser. Source: Tinder Help Center, "Rewind," help.tinder.com, 2026.
- **Stacked-card peek is the primary "there's more" affordance, not a separate hint:** card UIs in this genre render 1–2 next cards partially visible behind the active one (offset/scaled down), so the browsing affordance is communicated by the stack's own geometry rather than a "swipe for more" label or arrow. Source: Mobbin, "Card UI Design: Best practices, Design variants & Examples," mobbin.com/glossary/card, 2026.
- **2026 job-swipe entrants conflate "swipe right" with "auto-submit" — Munus should explicitly not copy this:** newer job-swipe apps (Sorce, Switch) pair the right-swipe gesture with an AI auto-apply action baked into the same gesture, a materially different contract from Munus's swipe = save-only model. Any copy, iconography, or micro-interaction borrowed from these apps' right-swipe needs rewording so users don't infer auto-submission. Source: sorce.jobs, "Swipe Jobs: Tinder-Style Job Apps (2026)"; switch-inc company/product listings, via search, 2026.

### Orchestrator verdicts on W2 design intel (checkpoint 2026-07-25)
- Velocity-OR-position swipe threshold: ACCEPTED — implemented in
  components/deck/useSwipe.ts this checkpoint.
- WCAG 2.5.7 button parity, Rewind-style single-step undo, stacked-card
  peek, gesture-zone separation: ACCEPTED-CONFIRMED — deck already ships
  these; treated as regression guards for the critic.
- Reduced-motion swap-not-slow: ACCEPTED — BACK stamp static variant done;
  broader animation swaps revisit in W6 polish.
- Right-swipe ≠ auto-apply copy guardrail (Sorce/Switch conflation):
  ACCEPTED as standing copy rule — deck/coach copy says save, never apply.

### AI Studio design intel — evidence-grounded tailoring UI patterns (founder, 2026-07-25)
Directive this run: research current (2026) patterns for AI-assisted document
editing with human approval, since the AI Studio is being built this wave.
Method: WebSearch only (WebFetch still 403, see URGENT/RISKS); every bullet
below cites a source found this run, none from memory.
- **Grammarly's per-suggestion card is the reference accept/reject unit, and it is binary, not a diff-merge:** each flagged span gets an underline plus a separate suggestion card with exactly two actions — "Accept" (applies the rewrite in place) or "Dismiss" (discards, no partial-accept). Certain suggestion categories (e.g. Oxford comma, passive voice) can be muted at the account level so they stop appearing at all, which is a "never show me this class of suggestion again" control Munus's evidence-chip UI doesn't have yet. Source: Grammarly Support, "Grammarly Editor user guide," support.grammarly.com, 2026 (via WebSearch, 2026-07-25).
- **Workable's own Job Ad AI Assistant — same industry, adjacent product — models tone-adjustment as a fixed enum of named tones, not a free-text slider:** Workable's AI writing feature for job ads lets the user regenerate copy against a small closed set of named tone presets rather than an open slider, and explicitly frames the AI's role as "polish/rewrite what's there," not "invent qualifications" — directly relevant prior art for Munus's tone-regeneration step since it's the same category (recruiting-adjacent AI text tooling) making the same trust promise. Source: Workable product pages / "Workable AI" feature documentation, workable.com, via WebSearch, 2026-07-25.
- **The Workable public Postings API itself is a second, independent confirmation of the widget-vs-account-API split this batch already found:** `GET https://apply.workable.com/api/v1/widget/accounts/{clientname}` is the documented, no-auth-required, read-only endpoint (confirms the ingestion feed_url template already in use); Workable's authenticated v3 API is separate and requires OAuth — Munus's ingestion adapter should never accidentally try to hit v3 endpoints expecting the same no-auth pattern. Source: Workable API docs via workable.readme.io "/accounts" reference, fantastic.jobs "Workable Jobs API" summary, via WebSearch, 2026-07-25.
- **"AI cannot invent facts" as a trust guarantee is not yet a named, marketed UI pattern anywhere in mainstream AI writing tools as of this search — this is a gap Munus can own, not follow:** searches for Grammarly's "Responsible AI" page, LinkedIn's AI writing assistant, and Gmail's Help Me Write turned up general responsible-AI position statements (bias mitigation, transparency about AI-generated content) but no product that ships a per-claim "this came from your CV, here's exactly where" provenance chip the way Munus's evidence-chip spec (plan §"Evidence-only studio") describes. The closest adjacent pattern is citation/source chips in AI search products (e.g. Perplexity-style numbered inline citations linking to source documents), which is a good visual reference for HOW to render a chip, but none of them apply it to resume/cover-letter tailoring specifically. Source: Grammarly "Responsible AI" page (grammarly.com/ai/responsible-ai), via WebSearch, 2026-07-25 — treat the absence itself as the finding, re-verify next run since this is a fast-moving space.
- **Numbered inline citation chips (Perplexity-style) are the closest existing visual pattern for an evidence chip, and they are compact, inline, and click-to-expand — not a separate sidebar:** the established citation-chip pattern renders as a small superscript-style numbered marker directly inside the generated text, which expands to show the source snippet on click/hover rather than requiring a persistent side panel; this is a strong candidate pattern for Munus's evidence chips (attach a small numbered/labeled marker next to each tailored CV bullet, expanding to show the source fact) rather than a dedicated adjacent panel that competes for screen space on mobile. Source: general AI-search-citation-UI convention referenced across the "Grammarly AI Review 2026" and "Best AI Grammar Checkers 2026" roundups surfaced this run, via WebSearch, 2026-07-25 — recommend a follow-up run search Perplexity/You.com's own design documentation directly for a stronger primary source.
- **Every mainstream AI writing tool's accept/reject unit operates at the sentence/phrase-span level, never the whole-document level:** Grammarly, and by structural analogy Workable's job-ad AI assistant, both apply suggestions as localized, independently-actionable spans rather than "regenerate the whole document, accept/reject as one block" — this confirms Munus's plan (§"Evidence-only studio": "Accept/Keep per suggestion") is aligned with category convention and should NOT be simplified to a single whole-document accept/reject in a later wave for "simplicity," since that would be a regression from table-stakes UX in this category. Source: Grammarly Editor user guide, support.grammarly.com, 2026, via WebSearch, 2026-07-25.
- **Gap/caveat on this run's research, flagged honestly:** WebSearch results for "Notion AI accept/reject," "Gmail Help Me Write," and "LinkedIn AI writing assistant" returned mostly SEO-farm summaries and pricing-comparison pages rather than primary UI documentation — I was not able to independently confirm Notion AI's or Gmail's exact accept/reject interaction model this run beyond what's broadly known to be true of inline AI-edit tools generally (accept/reject/regenerate buttons appearing on hover near AI-inserted text). Do not cite this paragraph as a sourced claim for any of those three products specifically; re-run with WebFetch (if it recovers) against each product's own help-center pages before treating Notion/Gmail-specific patterns as confirmed.

### Orchestrator verdicts on W3 design intel (checkpoint 2026-07-26)
- Per-claim provenance chips as ownable differentiator: ACCEPTED — evidence
  chips already ship; elevate to marketing copy at W7 (BACKLOG will carry).
- Grammarly binary accept/dismiss card as reference unit: ACCEPTED-CONFIRMED
  (SuggestionCard already matches).
- Named-tone presets over sliders: ACCEPTED-CONFIRMED (ToneSheet chips).
- Workable widget-vs-v3 API split: ACCEPTED as ingestion note (adapter uses
  the no-auth widget endpoint; revisit if v3 needed).
- Notion/Gmail/LinkedIn unconfirmed interaction models: NOTED — no action
  on SEO-farm evidence.

### Apply-loop design intel — redirect-apply return-confirmation patterns (founder, 2026-07-26)
Directive this run: the Apply loop (Preflight → redirect → "Did you apply?"
→ receipt) is being built THIS wave, and the plan explicitly cites the
Handshake pattern by name (plan §1.5). Method: WebSearch only (WebFetch
still 403, fifth consecutive session — see URGENT/RISKS); every bullet below
cites a source found this run.
- **Handshake's exact mechanic is a binary post-redirect modal, not a passive detector, and "No" actively un-does state:** after the user clicks "Apply Externally" and is redirected off-platform, Handshake shows "Did you apply to this job?" with Yes/No buttons on return. Yes stamps the posting "You applied on [DATE]" and files it under My Jobs; No withdraws the application record entirely and restores the "Apply Externally" button so the user can retry. This is the direct precedent the Munus plan already names — the concrete detail worth carrying over is that **"No" is a real state transition (delete/reset), not just a dismiss** — Munus's Preflight→redirect→confirm flow should treat a "No, I didn't apply" answer as reverting the application record to `prepared` (never silently advancing to `opened`/`confirmed`), not just closing a dialog. Source: Handshake Help Center, "Jobs: Apply Externally," support.joinhandshake.com, via WebSearch, 2026-07-26.
- **LinkedIn runs the identical Yes/No confirm-on-return pattern but with a critical failure mode Munus must design around: skipping the prompt leaves the job stuck in limbo forever, with no fallback re-prompt.** If the user closes the tab, dismisses the notification, or the return-detection simply misses the moment, LinkedIn does not re-ask later — the job just keeps reappearing in ordinary search results as if never touched, and the user must manually use a "+ Add" flow to self-report the application after the fact. This is strong evidence that Munus's Applications list needs an always-visible manual "mark as applied" fallback action on any `opened`-but-not-`confirmed` record, not just a one-shot on-return modal, or a missed prompt permanently loses the state. Source: scale.jobs, "How to Track Job Applications on LinkedIn"; job-search guides corroborating LinkedIn's own Applied-jobs help flow, via WebSearch, 2026-07-26.
- **Indeed is the negative precedent — explicitly what NOT to copy:** clicking "Apply on company site" on Indeed permanently exits Indeed's tracking with no return-prompt of any kind, no status sync, and the application cannot even be withdrawn from Indeed's side afterward. User-complaint roundups ("Is Indeed Playing Hide-and-Seek With Your Job Applications?") treat this as a well-known trust/frustration point, not a neutral design choice. Munus's whole value proposition on the receipt/tracking side is the opposite bet — this is corroborating evidence that shipping *any* return-confirmation (even an imperfect one) is a meaningful differentiator versus the largest job board, not a nice-to-have. Source: Indeed Help Center, "My Jobs: Managing Applied Jobs"; stripe.jhu.edu career-office writeup, via WebSearch, 2026-07-26.
- **Welcome to the Jungle / Otta (the plan's likely nearest EU-market comparator) is the weakest of the four precedents researched — no automatic return-prompt at all, self-entry only:** where a job requires an external redirect, Welcome to the Jungle relies on the user manually clicking "Add a job" to log it into their own tracking board after the fact, rather than detecting the return and asking. It positions itself explicitly as a discovery/matching layer rather than an application-tracking product. This confirms Munus should not benchmark its apply-loop UX against the closest EU competitor here — Handshake/LinkedIn's active confirm-on-return is the better pattern to clone, per Rule 3 (clone the best, not the closest). Source: Welcome to the Jungle Help Center, "How to Effectively Track Your Applications on Welcome to the Jungle," help.welcometothejungle.com, via WebSearch, 2026-07-26.
- **Third-party job-tracker extensions (Teal, Huntr, Simplify) all share the same structural gap Munus's confirm-on-return step is designed to close:** these tools auto-fill the first page of an external application and then hand control back to the user for the rest — none of them claim to auto-detect actual submission on the employer's site. This is corroborating evidence (from a completely different product category) that **self-reported confirmation is the honest, current state of the art for this problem** — there is no hidden "just detect it automatically" technique being missed; Munus's design (ask the user, trust but log the answer) is not a compromise, it's the category-standard solution. Source: chromewebstore.google.com listings for Teal/Huntr; bestjobsearchapps.com, "Best Job Search Chrome Extensions in 2026," via WebSearch, 2026-07-26.
- **The Page Visibility API's `visibilitychange` event answers "is this tab visible" but NOT "did the user just come back on purpose" — window/document focus is the sharper signal, and MDN's own guidance is to reserve interrupting UI for when something is actually at stake:** a tab can be visible-but-unfocused (side-by-side windows, picture-in-picture); the documented best practice for "user just returned" semantics is to combine visibility with focus, and to gate any interrupting prompt behind a real pending-state flag rather than firing unconditionally on every return — generic "wait, before you go" modals that fire every time are called out as a fatigue-inducing anti-pattern once a user has seen them a few times. Direct implication for Munus: the "Did you apply?" prompt should fire on window-focus-regained AND only when there is an `opened`-status application actually pending confirmation — never on a bare tab-visibility change with nothing pending. Source: MDN Web Docs, "Page Visibility API" and "Document: visibilitychange event"; dev.to/reactuse, "Browser Tab UX in React," via WebSearch, 2026-07-26.
- **Toast vs. modal vs. badge is a solved decision framework, and it says Munus is right to use a blocking modal for this specific prompt, not a toast:** the standing UX convention is toast = passive, non-blocking, "nice to have" feedback (~3–10s, fine to miss); modal = reserved for decisions that must block progress before the user can proceed; badge = quiet, unseen-activity indicator with no interruption. Because "did you apply?" directly gates a real state transition (receipt generation, `applications.status`, whether the job re-enters the user's active deck) and is explicitly *not* safe to silently miss (per the LinkedIn/Indeed failure modes above), it clears the bar for a modal, matching Handshake/LinkedIn's own choice — this is confirming evidence, not new invention, and the plan should not be second-guessed toward a "softer" toast-only version of this moment during implementation. Source: blog.logrocket.com, "What is a toast notification? Best practices for UX"; carbondesignsystem.com notification pattern docs, via WebSearch, 2026-07-26.

### Orchestrator verdicts on W4 founder questions (checkpoint 2026-07-26)
- **EU scope policy — DECIDED (now CONTRACTS §2 rule 6):** a company qualifies
  when it has an EU/UK entity or office, OR posts roles explicitly scoped to a
  European location or timezone. "Remote — worldwide" roles where Europe is
  incidental are REJECTED: they usually carry US-timezone or payroll/visa
  constraints, so surfacing them would be false hope, and the honesty rules
  bind the deck as much as the documents. Speechify (eleven+ named EU cities)
  and Mesh (explicit "Europe-based, remote") both PASS under this rule.
- **Consultancy job-shape tag — ACCEPTED-LATER (W6 polish):** Netlight-style
  direct-employer consultancies stay in the list; the fix is a company_type
  tag surfaced on the job card, not exclusion. Needs a `companies.type`
  column (product | consultancy | agency) — schema delta recorded, built
  when real ingestion runs. Good catch: an unexpected day-to-day is exactly
  the kind of surprise this product exists to prevent.

### Founder action items from W5 slices (checkpoint 2026-07-26)
- **Legal placeholders needing a human decision** (grep `founder to` in
  app/(marketing)): privacy contact email; legal entity name + registered
  address; company registration number; erasure response window; lead
  supervisory authority; signed Supabase/Groq DPAs; liability cap figure;
  governing law + venue. A solicitor review is required before launch —
  the pages say so on their face.
- **BACKLOG arithmetic drift (slice A):** per-batch prose totals disagreed
  with the literal table rows twice. Founder should tally from the tables,
  not from memory. Config ships 175 rows (174 claimed) — the difference is
  three legitimately-uncaveated Greenhouse rows in Batch 4.
- **Feed verification is now automated:** `npm run ingest:dry` performs the
  real HTTP pass over every feed_url that has been outstanding for five
  sessions. It needs only the network policy. Rows flip verifiedVia
  "search" → "http" once it runs clean.

## RISKS
- (market/competitor/category threats, with source)
- **Plan's LLM is being turned off (orchestrator, 2026-07-24):** Groq
  deprecated llama-3.3-70b-versatile on 2026-06-17; requests stop serving
  ~Aug 2026 (free/developer tiers). Same wave kills llama-3.1-8b-instant and
  qwen3-32b. Replacement per Groq: openai/gpt-oss-120b (D17). Free-tier
  caps are per-model and TPM-bound (~12k tokens/min class) — the CV-parse +
  tailoring pipeline needs 429 retry/backoff and a user-facing busy state
  from day one. Source: Groq docs/console via search, 2026-07-24.
- **WebFetch tool outage this session (2026-07-23, founder):** every WebFetch call failed with HTTP 403, including non-ATS control URLs (`example.com`, `example.org`, `wikipedia.org`, `news.ycombinator.com`), confirming it's a proxy/tool-level failure this run, not sites blocking the agent. No Bash/curl tool was available to me to inspect `/root/.ccr/README.md` or the proxy status endpoint. Net effect: Batch 1 above is WebSearch-corroborated only. **Action needed:** whichever agent has a working fetch tool should run one real HTTP GET against all 50 feed_urls before the ingestion worker treats them as live — this is a 2-minute script, not a research task.
- **Same WebFetch outage confirmed again in the Batch 2 run (2026-07-23, founder):** re-tested with the identical control URL (`https://example.com`) at the start of this run — still a flat 403. Two consecutive sessions now show this as a persistent tool/proxy condition rather than a one-off blip. Whoever eventually gets a working fetch tool should treat verifying the combined 85-company list (Batch 1 + Batch 2) as one batch job, not two.
- **Greenhouse EU data-residency hosts (founder, 2026-07-23):** at least two companies in Batch 1 (TrueLayer, Payhawk) serve their candidate-facing job board from `job-boards.eu.greenhouse.io` instead of the default `job-boards.greenhouse.io`. It is undocumented from search alone whether the public Job Board API for these accounts still lives at the shared `boards-api.greenhouse.io`, or requires an EU-specific API host (e.g. `boards-api.eu.greenhouse.io`). If it's the latter, those two feed_urls (and any future EU-hosted Greenhouse company) will 404 on the standard template. The ingestion adapter should try both hosts and log which one 200s per company, rather than assuming one. **Batch 2 update:** this pattern is more common than a two-off — four more companies (Bitpanda, Wallapop, Darktrace, Livi/Kry) also resolve their candidate-facing board on the `.eu.` host. That's 6 of 85 companies so far (~7%) on the EU host variant; budget real verification time for this specifically, it is not a rare edge case. **Batch 3 update:** now 4 more (Scalapay, Huspy, Proton, Lenus), bringing the running total to 10 of 116 companies (~9%) on the `.eu.` host — still climbing as a share, not shrinking; treat the dual-host adapter fallback as required, not optional, before ingestion goes live. **Batch 4 update:** 6 more this batch (LetsGetChecked, Flipdish, Cognite, Metacore, Ledgy, plus AlphaSense Helsinki's main-vs-sub-board question is a related-but-distinct issue, see below), bringing the cumulative total to 16 of 142 companies (~11%) — the share is still climbing, not stabilizing; budget the dual-host adapter as Phase 1 scope, not a stretch goal. **Batch 5 update:** one more (Bondora, `job-boards.eu.greenhouse.io/bondora`), bringing the cumulative total to 17 of 174 companies (~10%) — the ratio has now held roughly steady across two consecutive batches rather than climbing further, a mild signal the true population share may be settling somewhere near 10%, but still nowhere near rare enough to treat as optional.
- **ATS migrations mid-flight (founder, 2026-07-23):** three companies in Batch 1 (Alan, Back Market, Ledger) currently show live, current job postings on *two different* ATS platforms simultaneously (Lever + Ashby in all three cases). This is evidence of active platform migration in the wild, not a one-off — the seed-list schema needs a way to record "this company may appear under two `(source, external_id)` roots at once" so the dedupe-by-company step in ingestion doesn't create duplicate job cards for the same posting during a migration window. Recommend: when both ATS boards are found for one company, prefer the one with the newer/higher job-count evidence, and re-check quarterly for migration completion. **Batch 2 follow-up (as requested):** for Back Market, this run's search surfaced multiple detailed, clearly-current Ashby postings across several departments at once (Senior Product Designer – after-sales; Senior Product Designer – Design System; Staff Backend Engineer; Senior Product Manager – Lifecycle; a Product Manager Intern role) — the volume, specificity, and cross-department spread of live Ashby listings is circumstantial evidence Ashby is the actively-maintained board for Back Market now, with Lever more likely the stale/legacy mirror. Ledger's Ashby board also resolves with detailed, current-sounding Product Designer requirements, weakly pointing the same direction. **This is inferred from listing richness in search results, not a direct posted-date or job-count comparison** — treat as a hypothesis, not a resolved fact; a real HTTP pull comparing `api.lever.co/v0/postings/{slug}` vs `api.ashbyhq.com/posting-api/job-board/{slug}` job counts and max posted-date for both companies is still the definitive test. For Alan specifically, no distinguishing signal turned up this run either way — still genuinely ambiguous, needs the same direct comparison. **Batch 3 addition:** two more cases surfaced — Musixmatch (Workable + Lever both live) and Mistral AI (Lever confirmed via direct posting, plus a department-filtered Ashby URL that also resolves). That's now 5 of 116 companies (~4%) showing this dual-board signal across three batches; this is a recurring, not rare, category behavior and the dedupe-by-company schema fix should be treated as a Phase 1 requirement, not a nice-to-have. **Batch 5 addition:** two more instances — ComplyAdvantage (Greenhouse board confirmed live, but a separate `apply.workable.com/complyadvantage/` page also resolves) and Zowie (Ashby board confirmed live, but `jobs.lever.co/Zowie` also resolves live). That's now 7 of 174 companies (~4%) across five batches — the rate has held steady rather than climbing, suggesting this is a stable background rate of the population (roughly 1 in 25 companies), not a shrinking one-off category; the dedupe-by-company schema fix remains a hard Phase 1 requirement.
- **Non-obvious/legacy slugs are common, not rare (founder, 2026-07-23):** of the 31 Greenhouse companies found this batch, at least 6 use a slug that is not a simple lowercase of the current brand name (Miro→`realtimeboardglobal`, Trade Republic→`traderepublicbank`, Bolt→`boltv2`, Taxfix→`taxfix2`, Aiven→`aiven36`, Mews→`mewssystems`). A seed-list generator that guesses `slugify(company_name)` and calls it done will silently produce ~15-20% dead/wrong feed_urls at this vertical's company mix. Each company needs an actual search-confirmed slug, not a template guess — budget founder/ingestion time accordingly for the 1,000–2,000 company target. **Batch 2 corroboration:** same rate held up — of 25 Greenhouse companies this batch, at least 5 needed a non-obvious slug (Picnic→`try-picnic`, Smartly.io→`smartlyio`, Darktrace→`darktracelimited`, ManyPets→`manygroup`, Tourlane→`tourlanegmbh`), plus 2 more with brand/sub-brand naming that needs care even though the slug itself is short (Ada Health→`adahealth`, Kry/Livi→`livi`). Treat "~20% of companies need a hand-confirmed slug" as the planning assumption, not the exception. **Batch 4 corroboration:** Supermetrics→`supermetricsoy` (with a decoy `supermetricsreferrals` board that looks plausible but is the wrong one), Fenergo→`fenergocareers` (Workable), Ubisoft→`ubisoft2` (SmartRecruiters) — roughly 3 of 16 new Greenhouse/Workable/SmartRecruiters rows this batch needed a non-obvious slug, consistent with the ~20% planning assumption holding up a fourth batch running. **Batch 5 corroboration:** 5 of 32 rows this batch needed a non-obvious slug — Packmatic and Clera both required exact-case capitalization on Lever/Ashby respectively (lowercasing either breaks the URL), Yassir likewise needed capitalization on Lever, Plum's correct slug is "withplum" (not "plum", with a second "plum-inc" variant also live), and Curve's is "curve-1" (not "curve"). ~16% this batch, holding the multi-batch ~20% assumption steady; case-sensitivity specifically (not just wrong-word slugs) is now a confirmed failure mode for both Lever and Ashby, not just Ashby (previously flagged only for Ashby in Batch 3's AlephAlpha/DeepL finding).
- **"Valid endpoint, zero current jobs" is a real, non-error state (founder, 2026-07-23):** Blinkist (`go1blinkist` on Greenhouse) and Deezer (`deezer` on SmartRecruiters) both appear to be real, correctly-slugged accounts that currently show no open postings in search results. The ingestion normalizer must treat a 200 response with an empty `jobs`/`postings` array as healthy-but-quiet, not as a signal to drop the company from the seed list — hiring volume is seasonal and bursty, especially at smaller companies. **Batch 2:** ManyPets (`manygroup`) is a likely second example — the board resolves and the company is actively hiring generally, but no current design-role posting surfaced this run; keep it in the seed list regardless. **Batch 3:** two more — Numeral (Ashby) and ABOUT YOU (SmartRecruiters) both have confirmed-live boards with active non-design hiring but no current design-specific posting surfaced; Lenus (Greenhouse, EU host) is a third. Now 5 confirmed instances of this pattern across three batches — it is routine, not an edge case, and the normalizer logic above should be treated as a Phase 1 blocking requirement, not a nice-to-have. **Batch 4:** Ververica (Workable, Germany, tranche 1 note) and Alice & Bob (Lever, France, tranche 2) are a sixth and seventh instance — both live boards, active non-design hiring, no design posting surfaced this run. **Correction to this risk's own history:** Deezer itself, cited above since Batch 1 as the canonical "quiet" example, actually has LIVE design postings as of this run (Graphic Designer, Product Designer) and was never even added as a seed-list row until Batch 4 Tranche 2 — a reminder that "quiet" companies should be periodically re-checked, not permanently written off, since hiring volume changes. **Batch 5:** seven more instances in one batch — Mollie, Axelera AI, Bondora, Scalable Capital, Prosus, Vivid Money, and Zowie all have confirmed-live boards with active non-design hiring but no design-specific posting individually confirmed this run. That brings the cumulative count to 14+ across five batches — this is now unambiguously routine (roughly 1 in 6-7 companies in any given batch), and a normalizer that drops or deprioritizes "currently quiet" companies would silently shrink the seed list every batch as this keeps recurring.
- **Wise is on SmartRecruiters, not Greenhouse (founder, 2026-07-23):** worth flagging because Wise (fka TransferWise) has a well-known public case study with Greenhouse ("Wise transforms hiring to meet speed of growth," greenhouse.com/customer-stories) that could mislead a seed-list builder working from memory or from Greenhouse's own marketing pages into guessing `boards-api.greenhouse.io/v1/boards/wise` — that slug does not appear to exist; their live candidate-facing postings (confirmed via search, e.g. Staff Product Designer, London) are on `jobs.smartrecruiters.com/Wise/…`. A customer-story mention is not evidence of the *current* ATS.
- **Company-name collisions across unrelated companies on the same ATS (founder, Batch 2, 2026-07-23):** this is now a recurring failure mode, not a one-off (Batch 1 already flagged Cleo AI vs. unrelated US "Cleo" supply-chain software). Batch 2 found two more: (1) "Ada Health" (Berlin, health AI, slug `adahealth`) vs. an unrelated Toronto customer-service-AI company that is simply named "Ada" (slug `ada18`) — both post Product Designer roles on Greenhouse, easy to mix up. (2) The Danish neobank "Lunar" has no confirmed ATS this run, but search kept surfacing an unrelated US company called "Lunar Energy" on Greenhouse (slug `lunarenergy`) — a careless slugify pass would wire the wrong company's jobs into a "Lunar" seed-list row. **Recommendation: any seed-list entry generated from a bare company name, without a same-search job-posting sanity check on team/location/product description, is a live landmine for this vertical.** Also found a US-based mental-health-insurance startup called "Alma" (on Greenhouse) that is unrelated to Batch 1's French health-insurer "Alan" — similar-sounding names, different companies, different countries; excluded from this batch specifically to avoid the mix-up. **Batch 3 addition:** same pattern again — "Kiwi.com" (the Czech travel booking company we searched for) kept surfacing an unrelated US toy-subscription company "KiwiCo" (slug `kiwicoinc`) on Greenhouse; neither was usable this run (Kiwi.com's actual ATS could not be confirmed on any of the 5 targets), but the near-miss is now a 4th documented instance of this exact failure mode across three batches. **Batch 4 addition:** a "Continuum" search intended for an Irish company kept surfacing two different, unrelated US companies instead — "Continuum Resource Network" (Workable, US staffing) and "ContinuumGlobal, Inc" (Lever, US marketing agency) — neither usable, 5th documented instance; this vertical's company-name space is genuinely collision-prone and every bare-name lead needs a job-posting sanity check before being trusted. **Batch 5 addition:** a "Curve" search (the London card-fintech, confirmed and added this batch) kept surfacing an unrelated company called "SpaceCurve" with its own live Ashby board (`jobs.ashbyhq.com/spacecurve`) — 6th documented instance across five batches; this failure mode has now appeared in every single batch run so far without exception and should be treated as a standing, permanent verification step (not an occasional gotcha) for any seed-list entry sourced from a short or generic company name.
- **Workable now has (at least) two live URL schemes for the same company (founder, Batch 2, 2026-07-23):** Wallbox's careers surfaced under both a legacy scheme (`apply.workable.com/wallbox/j/{jobId}/`, subdomain-less but slug-based) and a newer hash-ID scheme (`jobs.workable.com/company/{opaque-hash}/jobs-at-wallbox`). Batch 1's Onfido row used the legacy slug-based form for its feed_url (`apply.workable.com/api/v1/widget/accounts/{slug}`), and Wallbox's legacy URL confirms that pattern still resolves for at least this company — but if a future company only exposes the hash-ID form (no legacy slug discoverable via search), the public widget-API feed_url template used in this seed list will not have an equivalent, and a different Workable API path may be needed. Flag any Workable company where only the hash-ID form can be found as needing manual API-path research, not a template guess. **Batch 3 note:** Booksy's slug turned out to be `booksy-1`, not `booksy` — the same "obvious slug is taken/wrong" problem already documented for Greenhouse (see below) also applies to Workable; do not assume a clean company-name slug is correct without a confirmed job-posting URL. **Batch 4 addition — third URL scheme found:** Pollfish's board resolves at a *company-owned subdomain* (`pollfish.workable.com`) rather than either the legacy `apply.workable.com/{slug}/` or hash-ID (`jobs.workable.com/company/{hash}/...`) forms. It's unconfirmed whether the widget API slug for a subdomain-style account is simply the subdomain prefix ("pollfish") or something else entirely — this row is flagged lower-confidence than the rest of Batch 4 and should be the first one double-checked when real HTTP verification finally happens. **Batch 5 addition:** Plum surfaced under two different Workable slugs simultaneously — `apply.workable.com/withplum/` and `apply.workable.com/plum-inc/` — both resolve live; it is unconfirmed which (if not both) is the company's actual current board versus a legacy/duplicate registration, the same ambiguity as the Alan/Back Market/Ledger dual-ATS pattern but *within* a single ATS this time. Logged "withplum" as the primary row since it had more/fresher-looking postings in search, but flag for direct verification.
- **Mirakl (and possibly others) run multiple regional Greenhouse boards under one brand (founder, Batch 2, 2026-07-23):** search surfaced `mirakl` (main/Paris), `mirakllabs`, `japan`, and `miraklamer` as separate Greenhouse board tokens all under the Mirakl brand — the same duplicate-board pattern Batch 1 flagged for Bolt (`boltv2` vs `bolt42`). Ingestion needs a policy for "one brand, multiple regional ATS boards": either merge all of a brand's regional boards into one company record (tagging each job with its source board for dedupe), or deliberately pick only the board most relevant to the target market (EU) and document why the others are excluded. Guessing "the board with the plain name is the only one" will silently under-count or duplicate jobs for multi-region companies. **Batch 4 corroboration, a legitimate/benign version of the same shape:** AlphaSense runs a dedicated `alphasensehelsinki` Greenhouse board distinct from its main `alphasense` board — this one is NOT ambiguous/duplicate (Helsinki-specific reqs only post to the Helsinki board), but the seed list should still record both as separate rows if both are wanted, rather than assuming the "main" board covers every office. Same applies to FreeNow's single `freenow` board covering many countries incl. Greece (opposite pattern: one board, many countries) — ingestion's location field, not the company/board mapping, is what has to carry the country signal in that case. **Batch 5 addition, same benign shape again:** Graphcore has both `graphcore` and a separate `graphcore-early-careers` board live — unconfirmed whether the second is purely graduate/intern postings (benign, like AlphaSense Helsinki) or a genuine duplicate/migration risk; flag for verification alongside the other dual-board rows.
- **WebFetch outage confirmed a fourth consecutive session (2026-07-25, founder, Batch 4):** re-tested again with the identical control URL (`https://example.com`) at the very start of this run — still a flat HTTP 403, exactly as in Batches 1, 2, and 3. Four-for-four across separate sessions now strongly confirms this is a standing condition of this particular environment/proxy configuration, not an intermittent fault. Recommend the orchestrator stop treating "WebFetch might come back" as a planning assumption and instead schedule a dedicated one-time verification pass (curl/script, not agent research) for all feed_urls accumulated so far (142 after this batch) before any of them are wired into a live ingestion cron.
- **Ashby slugs are sometimes not clean lowercase identifiers, more aggressively than Greenhouse's (founder, Batch 3, 2026-07-24):** two companies this batch embed what looks like a domain TLD directly in the slug itself — Fanvue → `fanvue.com`, Rossum → `rossum.ai` — and two more use load-bearing mixed case that a lowercase-slugify pass would break — Aleph Alpha → `AlephAlpha`, DeepL → `DeepL`. Combined with Batch 1/2's already-documented Greenhouse non-obvious-slug rate (~20%), this means **no ATS in this seed list is safe to auto-generate slugs for** — every row needs a human/search-confirmed slug, and the ingestion adapter should not silently lowercase or strip suffixes from an Ashby slug before calling the API, since that could turn a working URL into a 404.
- **Lever also has an EU-hosted variant, exactly parallel to Greenhouse's `.eu.` host issue (founder, Batch 4, 2026-07-25):** Silverfin (Belgium) resolves its candidate board at `jobs.eu.lever.co/silverfin`, not the default `jobs.lever.co`. Confirmed via Lever's own public postings-api documentation (github.com/lever/postings-api): "Some accounts are hosted in the EU region and answer on `https://api.eu.lever.co/v0/postings/{site_slug}` instead. EU accounts use `api.eu.lever.co` and `jobs.eu.lever.co`." This has been undocumented risk in this seed list for four batches — every Lever row accumulated so far (19 companies across Batches 1–3, now 22 with Batch 4's Silverfin/Alice & Bob/MultiversX) was recorded against the default `api.lever.co` host, and only Silverfin has actually been confirmed to need the `.eu.` variant so far — the other 21 have NOT been individually checked either way. Unlike the Greenhouse EU-host situation (where the API-host equivalence was merely "undocumented, needs testing"), this is now a **confirmed, documented dual-host requirement** straight from Lever's own docs — the ingestion adapter's dual-host fallback logic (already flagged as required for Greenhouse) must also cover Lever, and this should be treated as slightly higher-confidence/higher-priority than the Greenhouse case specifically because Lever's own documentation confirms the split rather than it being inferred from candidate-facing URLs alone. **Batch 5 corroboration:** two more confirmed `.eu.` Lever rows — OLX (`jobs.eu.lever.co/olx`) and Prosus (`jobs.eu.lever.co/prosus`) — bringing the confirmed-EU-host Lever count to 3 of 24 (~13%), still a small sample but no longer a single-company anecdote; the dual-host fallback remains a hard Phase 1 requirement, not a nice-to-have.
- **WebFetch outage now confirmed a FIFTH consecutive session, and the standing "verify before ingestion" action item is now itself overdue (founder, Batch 5, 2026-07-26):** re-tested again with the identical control URL at the start of this run — still a flat HTTP 403, five-for-five across five separate sessions. Every prior batch has logged "someone with a working fetch tool should verify these feed_urls before the ingestion cron treats them as live" as a 5-minute-to-2-minute action item; five sessions later, that verification pass still has not happened, and 174 unverified feed_urls have now accumulated. This has quietly shifted from a minor caveat to a real go-live blocker for Phase 1 — recommend the orchestrator treat "run one scripted HTTP GET over all 174 URLs, log status codes" as an explicit, scheduled task for whichever agent/session has shell or working-fetch access, rather than continuing to note it as an aside in each batch.
- **Staffing/RPO agencies surface on SmartRecruiters (and likely other ATSes) posting client-company jobs under their own board — these must be excluded from the seed list, not added (founder, Batch 5, 2026-07-26):** two clear examples found and deliberately NOT added this batch — HelloKindred (a staffing/recruiting agency, London/Toronto/New York) and a company called "Dev"/"Dev2" (12 Moorgate address) — both have live, real SmartRecruiters boards with genuine Product Designer postings, but the postings are for the agency's *clients*, not the agency itself; the "company" field in Munus's job cards would then misattribute the employer. This is a new, distinct failure mode from the naming-collision risk above (there the company is simply wrong; here the company is "right" but is a middleman, not the actual employer) — the seed-list vetting step needs an explicit check for "is this a staffing/RPO/consultancy relationship where the real employer is someone else," not just "is this the company we meant."
- **Open scope question: does a non-EU-HQ'd, remote-first company with heavy Europe-based hiring belong in a "European tech hub" seed list? (founder, Batch 5, 2026-07-26):** two rows this batch stress-test the existing Poolside/Oura precedent harder than before — Speechify (fully distributed, no office anywhere, but simultaneously posting Senior Product Designer roles explicitly based in eleven-plus different European cities) and Mesh (US/San-Francisco-HQ'd crypto-payments co with one explicit "Europe-based, remote" Product Designer opening). Both were included this batch on the reasoning that the *job itself* is Europe-based even though the *company* isn't, but this reasoning could scale to include a large fraction of every well-funded remote-first US company with any EU hiring at all, diluting what "beachhead: product/UX designers in Europe" is supposed to mean. Recommend the orchestrator make an explicit, written policy call at the next checkpoint (e.g. "company HQ or a real EU office required" vs. "job location is EU is sufficient") before this ambiguity compounds further across future batches.
- **Consultancy/staffing-adjacent employers that directly employ designers but place them at client sites are a different job "shape" than product companies, and Munus's job-card UI/copy may need to account for it (founder, Batch 5, 2026-07-26):** Netlight (Stockholm, 1,600+ staff IT consultancy) directly employs its own consultants — unlike the staffing-agency exclusion above, this is a legitimate direct-employer relationship, not a misattribution risk — but a job seeker swiping on a "UX Designer, Stockholm" card from Netlight should reasonably expect a different day-to-day (bouncing between client engagements) than the same title at a product company like Zopa or Curve. This is not a reason to exclude Netlight, but it may be worth a light "consultancy" tag or copy treatment in the job card so users aren't surprised — a product/copy decision for the orchestrator, not a data-quality problem.

## REJECTED (with reasons - do not re-propose without new evidence)
-
