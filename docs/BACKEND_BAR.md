# MUNUS BACKEND BAR — the engineering standard behind the screens

Created 2026-08-08 as the backend half of the founder's quality directive
(D23/D24 in FEATURES.md): engineering at the standard of a top product
team, with everything automated as far as honesty allows. Method matches
docs/QUALITY_BAR.md: every load-bearing claim below was researched on
2026-08-08 and then **adversarially fact-checked by a second, independent
pass** — 29 claims checked, 28 confirmed, 1 refuted (noted where it
matters). Claims marked *(knowledge)* were not web-verifiable this
session and are flagged rather than dressed up.

Scale posture, stated once: **first 1k users, pre-PMF, solo founder.**
Boring, cheap, low-ops beats impressive. §8 lists the things we
deliberately refuse to build yet.

---

## 1 · Target architecture

```
Browser PWA (Next.js client, offline shell)
   │
   ▼
Vercel — Next.js 16 App Router, functions pinned to fra1 (Frankfurt)
   ├─ Route Handlers  (AI generation, exports — rate-limited, idempotent)
   ├─ Server Actions  (simple authed mutations: swipes, profile edits)
   └─ Cron            (digests, purge jobs — NOT ingestion)
GitHub Actions — scheduled ingestion runner (6h ceiling, open egress)
   │
   ▼
Supabase EU — the single stateful system
   ├─ Postgres + pgvector  (all product data, embeddings, metering, queues-lite)
   ├─ Auth                 (Google OAuth + anonymous sessions, PKCE)
   └─ Storage              (CV uploads, generated PDFs — signed URLs, RLS)
   │
   ▼ (outbound only)
Groq US — LLM inference (ZDR ON, DPA signed)      ← the only non-EU data flow
ATS JSON APIs — Greenhouse/Lever/Ashby/SR/Workable (public feeds, no auth)

Side rails: Sentry (scrubbed), PostHog EU (cookieless), Better Stack
(logs + uptime), heartbeat pings from every cron.
```

One stateful system (Supabase), one compute plane (Vercel), one external
AI dependency (Groq). Anything that wants a second database, a queue
broker, or a long-running server must displace something in §8 first.

---

## 2 · What exists today (audited 2026-08-08)

Already built and reusable server-side:
- **Schema** (`supabase/migrations/0001`): 14 tables — profiles (with
  name, cv_path, plan), facts (the evidence store), companies, jobs
  (**with `embedding vector(384)` already in place**), feed_health,
  decisions (append-only; favorites is a view over it), job_matches,
  documents, verifier_drops, applications, usage, job_usage,
  subscriptions, waitlist. Hot-path indexes exist (jobs open+verified,
  decisions profile+at, matches profile+score).
- **RLS** (`0002`): owner-only with `using`+`with check` everywhere;
  usage/subscriptions are SELECT-only for owners; feed_health and
  verifier_drops are service-role-only. The metering invariant is
  already structural.
- **Ingestion runner** (`workers/ingestion/`): 5 ATS adapters with
  fixtures, per-company isolation, concurrency 4, dual-ATS resolution,
  EU-host fallback, dry-run CLI. It needs exactly one thing to go live:
  a Supabase implementation of the 3-method `JobStore` interface
  (`upsertJobs` / `markMissing` / `recordFeedHealth`) plus a scheduler.
- **AI pipeline** (`lib/studio/`): `TailorProvider` interface,
  `generateKit` as the sole sanctioned path, deterministic blocking
  verifier with drop logging. A `GroqProvider` implementing `tailor()`
  slots in without touching screens.
- **Metering** (`lib/metering/`): pure decision functions with
  Monday-UTC anchoring and honesty-tested copy — needs server wiring.

Missing entirely: Supabase client layer, auth, every server API (the
app runs on a client mock store), embedding generation, the matcher,
GDPR export/delete, observability, email.

---

## 3 · Architecture rulings (contradictions found by the critic, resolved)

R1 **Embeddings are multilingual from day one.** The research default
(bge-small-en-v1.5 / MiniLM) is English-only — fact-check confirmed —
while our feeds are pan-European. Ruling: **intfloat/multilingual-e5-small
(384d)**, same dimension and cost class, so the existing
`vector(384)` column stands. English-only models are banned; a silent
quality cliff for German/French postings is exactly the kind of bug no
user ever reports.

R2 **Embedding inference runs on the WASM backend.** Fact-check caught
that onnxruntime-node's native binaries fail on Vercel (missing
libonnxruntime.so). Ruling: transformers.js pinned to its WASM backend,
in Node runtime functions, background-only (ingest + CV-save time,
never in the swipe request path).

R3 **LLM traces are metadata-only.** Langfuse tracing of prompt/completion
bodies would re-create the CV-text retention store that Groq's
Zero-Data-Retention setting exists to eliminate, and add an untracked
sub-processor. Ruling: we log tokens, latency, model, verifier verdict,
drop counts — never prompt or completion text. If body-level debugging
is ever needed, Langfuse EU gets added to the RoPA + deletion cascade
*first*, by decision, not by npm install.

R4 **salary_fit uses neutral imputation.** Most postings carry no salary.
Estimating violates the honesty invariant; scoring missing-as-zero
buries honest postings. Ruling: missing salary → neutral constant
(0.5), never displayed as a number, never a ranking penalty, "not
listed" in the UI (D4 unchanged). Same neutral-imputation rule as
cold-start swipe affinity.

R5 **Rate limiting: Upstash Ratelimit + Postgres quotas** — chosen for
durable per-plan quotas living next to the data under RLS, with Upstash
as the burst limiter. (The researcher's claim that Vercel WAF *cannot*
do per-user limits was refuted — @vercel/firewall's SDK can — so this
is a preference for fewer moving parts, not a capability gap. Recorded
honestly.)

R6 **Verifier contract is canon.** The critic flagged that everything
references the verifier but nothing specifies it. The spec:
`lib/studio/verifier.ts` — deterministic, blocking, per-suggestion
(drop the suggestion, keep the kit), every drop logged to
verifier_drops with reason. Server-side it runs in the same
`generateKit` path; promptfoo evals grade with THIS module, never an
LLM judge. Partial-failure rule: a kit with zero surviving suggestions
returns an honest "couldn't ground anything" state, not a retry loop.

---

## 4 · The backend things you didn't think of

The gap analysis, same spirit as QUALITY_BAR §3. Each lands in a wave
(§9).

**Correctness & trust**
1. `getSession()` is spoofable — every access decision server-side uses
   `getUser()` (network-verified). Supabase's own docs call this the
   most common auth vuln in the wild.
2. Idempotency keys on every AI-generation endpoint — a double-tap on a
   flaky train connection must not burn two credits and two Groq calls.
   Unique `(user_id, idempotency_key)`, cached result on replay.
3. Anonymous sign-in → account upgrade with the SAME user id (Supabase
   native) — this is what makes QUALITY_BAR's value-before-signup
   onboarding real: guest swipes and draft facts survive signup with
   zero migration code. Must be explicitly tested: anon → generate →
   add email → same rows.
4. Position bias: log the deck position a job was shown at with every
   swipe, or the future weight-fitting learns "users like whatever we
   showed first."
5. Embedding model versioning: version column on every vector, full
   backfill before cutover, never mix spaces. At our scale a full
   re-embed is minutes — so there's no excuse for a mixed state.

**Money & survival**
6. Groq free tier is a THROUGHPUT wall, not a cost wall: 30 req/min,
   8K tokens/min, ~100 kits/day account-wide. A handful of simultaneous
   users hits 429s. The Developer tier unlock is free (card on file, no
   minimum) and ~10x limits — a launch-blocking checkbox, not an
   optimization.
7. A kit costs ≈ $0.001. The meter's real job is abuse-loop prevention,
   not margin protection — this reframes D21b, it does not relax it.
8. Cost kill switch: one env flag that turns every Groq-calling route
   into a friendly 503, plus spend alerts on Groq/Vercel/Upstash.
   Runaway-cron-bankruptcy is a real solo-founder failure mode; the fix
   is one afternoon.
9. Prompt layout for Groq's automatic prefix caching (stable fact-list
   first, job description last = 50% off repeat input tokens) — but the
   PRIMARY cache is our own: Postgres response cache keyed on
   (user, job, kit_version, prompt_hash); a re-opened kit costs zero.

**Law (launch-blocking, not polish)**
10. **Groq retains prompts up to 30 days by default.** Zero-Data-
    Retention is a self-serve console toggle + signed DPA (SCCs built
    in). This is THE single most load-bearing config step before any
    real CV flows — without it, the GDPR deletion story is false.
11. Vercel fra1 pinning is a residency preference, not a jurisdiction
    change — the privacy policy names Vercel Inc. (US) as sub-processor
    under SCCs. Never claim "EU-only infrastructure."
12. Backups outlive deletion: PITR retains purged rows for the backup
    window. The privacy policy says so ("up to N days in encrypted
    backups") instead of promising instant erasure we can't deliver.
13. Deletion cascade spans FOUR systems: Postgres (one FK root,
    ON DELETE CASCADE), Storage (prefix purge), PostHog (async person
    deletion — log request + confirmation timestamps separately because
    their purge lags), and Groq (nothing to purge BECAUSE of #10).
    Soft-delete grace 14-30 days, then a cron hard-purges.
14. Retention windows by purpose: swipe events 12 months, verifier
    drops 90 days, abandoned anonymous users purged on a window.
    Indefinite "just in case" logs are the most common Art. 5 finding.
15. A pre-written breach runbook (72-hour clock, template notification,
    scope query) — a doc, not software.

**Operations**
16. Heartbeats over uptime checks: the dangerous failure is SILENT —
    ingestion stale for a week while the site is green. Every cron
    pings a heartbeat endpoint; no ping in 2× interval = alert. Four
    checks total: site up, ingestion fresh, AI round-trip healthy,
    new-jobs count non-zero.
17. Expand/contract migrations + migrate-then-deploy ordering: Vercel
    rollbacks are instant, dropped columns are not. No drop/rename in
    the same release as the code that stops using it.
18. No staging project AND no per-PR databases: local Supabase stack +
    Vercel preview deploys + SQL-diff review is the whole environment
    story at this scale (§5.7 ruling; both heavier options refused in
    §6 with their triggers).
26. Supabase DB backups don't back up Storage: the CV files themselves
    need a separate scheduled sync, and the Free tier backs up NOTHING
    — Pro before real data. (§5.7.)
19. Sentry with an aggressive beforeSend scrubber (breadcrumbs happily
    capture CV text from a parse error). Free tier is US-hosted;
    scrubbing is the safeguard we can afford — an explicit, recorded
    tradeoff.
20. A restore DRILL, scheduled: restore to a scratch project, verify a
    user's data round-trips. An untested backup is a hypothesis.

**Product data**
21. Transactional email: Supabase Auth's built-in sender is rate-limited
    to a handful per hour — production sign-ups need Resend (EU
    processing terms, added to RoPA) wired into Supabase SMTP, with
    SPF/DKIM/DMARC. Email is auth-only until the digest ships (QW3).
22. Pan-EU normalization: posted_at → UTC, salary currency stored
    as-listed (EUR/GBP/CHF/SEK/PLN — displayed as listed, converted
    only for the private salary_fit comparison, never shown converted),
    detected job language stored per posting (feeds R1 and lets the UI
    say "German-language role").
23. Dead-letter-lite: background work gets status/attempts/last_error
    columns and capped retries; a failed-count alert. A real queue/DLQ
    system is refused (§8).
24. Server-side PDFs reuse `@react-pdf/renderer` in a Node function —
    pure JS, no headless Chromium, same templates as the client (D19's
    planned production path) — rendered into Storage with signed URLs,
    regenerated on kit change, covered by the deletion cascade.
25. PostHog stays cookieless with a no-CV-text-in-events rule: event
    properties carry ids and counts, never fact content or letter text.

---

## 5 · Per-domain standards

### 5.1 Matching engine ("perfect job suggestions", falsifiable)
- Retrieval: hard SQL filters (location/visa/salary-floor/seniority/
  remote/open) → exact pgvector cosine scan over the filtered set →
  weighted linear blend. **No ANN index below ~100k rows** (sequential
  scan is exact and fast; a missed match hurts more than 20ms).
- Score = explicit weighted sum over named [0,1] features:
  semantic_sim, skill_overlap, salary_fit, location_fit, recency_decay,
  swipe_affinity. Weights in a versioned config row. The top terms ARE
  the "why this ranked" sheet from QUALITY_BAR — one number, decomposable
  by construction, auditable by a non-ML engineer.
- Learning: swipes are labels over those same features; a periodic
  offline logistic regression re-fits weights, ships only after beating
  current weights on the golden set. No online learning, no bandits,
  no per-user weight vectors yet.
- Cold start: behavioral features at neutral 0.5 (never 0 — zero
  systematically buries every new user's matches in their most fragile
  session); day-one reasons cite onboarding facts only.
- **Golden set from day one of scoring logic**: 50-150 hand-labeled
  (profile, job, grade) triples as repo fixtures; vitest asserts
  nDCG@10 and recall@20 above a checked-in floor; CI blocks any PR
  touching ranking that regresses. This is the falsifier for "perfect
  suggestions" — without it the promise is vibes.
- Rank on demand (cache the profile embedding + filtered-id set,
  5-15 min TTL); precomputation only if p95 exceeds ~400ms.

### 5.2 AI pipeline (Groq)
- Primary `openai/gpt-oss-120b`, fallback `openai/gpt-oss-20b` — same
  family, and fact-check confirmed strict structured output is ONLY
  supported on the gpt-oss family, which by itself rules out
  cross-family fallbacks. All llama-3.3-70b references are dead as of
  this month (deprecation window closed) — D10/D17 amended; grep-guard
  the literal string in CI.
- Structured output: `json_schema` with `strict: true` (constrained
  decoding, guaranteed shape). Strict mode forces all-required +
  additionalProperties:false, so abstention is an explicit enum
  (`status: "cited" | "insufficient_evidence"`), never an omitted
  field, and `fact_ids` is required with minItems:1 on every content
  suggestion. The verifier then re-checks every fact_id independently —
  the schema shapes output; only the verifier TRUSTS it.
- Prompt injection: job descriptions are attacker-controlled input.
  Delimiters are a speed bump, not a boundary; the structural defense
  is the verifier (injected instructions can't mint fact_ids). CI evals
  are the regression net; a separately refreshed adversarial set
  exercises injection specifically.
- Retry only 429/5xx, honor Retry-After, jittered backoff, client-side
  token bucket sized to our tier so we throttle ourselves before Groq
  does. Requests queue behind the bucket rather than failing user-visibly.
- Evals: promptfoo in CI, graded by the production verifier module
  (R6); gates = verifier pass-rate + citation coverage on a fixed set.

### 5.3 Auth + security
- Three-client @supabase/ssr pattern (middleware refresh + server
  read-only + route-handler read/write); `getUser()` at every gate,
  in-handler, never middleware-only (matcher misses are defense-in-
  depth's problem #1).
- Google OAuth: PKCE, dedicated `/auth/callback` route with
  exchangeCodeForSession; explicit environment-derived `redirectTo` on
  every call (Site-URL fallback drift is the classic prod bug); Google
  Console registers the Supabase project callback.
- Anonymous sessions per #3; manual identity linking enabled;
  email-conflict rule decided before shipping guest mode.
- AI endpoints are Route Handlers (not Server Actions): explicit URL
  for rate limit + idempotency + structured errors. Server Actions
  for simple authed mutations only; `allowedOrigins` never contains
  'null' (CVE-2026-27978, patched in 16.1.7 — pin above it).
- Service-role key: single `lib/supabase/admin.ts` opening with
  `import 'server-only'`; CI greps built client chunks for the key
  string; never a NEXT_PUBLIC_ prefix. One shared conditional client
  file is the canonical leak pattern — two files, always.
- CSP in next.config headers with connect-src allowlisting Supabase
  (incl. wss:), Groq, PostHog EU — and tested against auth refresh +
  analytics, because an over-strict CSP fails silently.
- Mock checkout: `PAYMENTS_MODE` server-env flag scoped per Vercel
  environment + startup assertion (production && !live → checkout
  routes 501). Never branched on a NEXT_PUBLIC_ var. (D21c, now with
  mechanism.)
- Free-tier abuse: server-side Postgres quotas (RLS-denied client
  writes — already structural) + Upstash per-user and per-IP burst
  limits + tiny anonymous teaser quota + disposable-email blocklist +
  fingerprint logging for manual review. (R5.)

### 5.4 GDPR engineering
- Export: one authed route assembling JSON + human-readable summary
  (profile, facts, swipes, applications, letters, CV files via signed
  links), zipped to Storage with 24h-expiry link. Synchronous is fine
  below ~10k rows/user; an async export pipeline is refused for now.
- Deletion: soft-delete + grace window + cron hard-purge across the
  four systems (#13). `deleted_at` ships in the SAME migration as the
  policy updates that hide soft-deleted users, with a test asserting
  invisibility everywhere.
- RoPA lists every sub-processor: Supabase (EU), Vercel (US, SCCs),
  Groq (US, SCCs + ZDR — the highest-risk entry, ahead of everything),
  PostHog (EU), Resend (when added), Sentry (US, scrubbed). The
  privacy-policy placeholders from the marketing pages get filled from
  this list.
- Consent posture: PostHog cookieless mode keeps the banner away;
  matching/profiling lawful-basis mapping is written down (employment-
  adjacent data deserves the paragraph).

### 5.5 Reliability + observability
- Sentry (server+client+edge) with beforeSend scrubbing (#19); free
  tier accepted, revisit EU residency at revenue.
- pino structured logs → Vercel log drain → Better Stack free tier
  (7-day retention accepted and recorded).
- The four checks from #16, alerting Telegram-first for a solo founder.
- AI observability = metadata only (R3): tokens, latency, drop rate,
  acceptance rate, regenerate rate — the four product-quality dials
  from QUALITY_BAR §4 — as PostHog events + a simple internal page.

### 5.6 CI + environments + local dev
- One pipeline: typecheck → vitest (incl. RLS tests against a local
  Supabase stack, golden-set ranking floor, verifier evals) →
  build → secret-scan of client chunks → migrate (expand-only) →
  deploy. Merge-blocking: all of it.
- Environments: local (supabase CLI stack, fixture-seeded) → Vercel
  preview deploys per PR (app only; schema changes reviewed as SQL
  diffs, no per-PR databases — see §5.7 branching ruling) →
  production. No staging project, no Supabase branching yet.
- Seeding: checked-in fixtures from captured ATS responses (they
  already exist under workers/ingestion), fixture users with
  deterministic fake embeddings so matching runs fully offline. CI
  never touches live ATS APIs or Groq.

### 5.7 Data platform (Supabase production practice)
- Data access: plain `supabase-js` (HTTP/PostgREST) for CRUD — it
  sidesteps connection pooling entirely. Any direct Postgres path uses
  the transaction pooler (:6543); the direct connection (:5432) is for
  migrations and admin scripts ONLY — a :5432 string in a serverless
  code path is the canonical "falls over at the first traffic spike"
  bug.
- RLS discipline: policies written as `(select auth.uid()) = user_id`
  (init-plan cached — cheap now, huge later). Tested with **pgTAP via
  `supabase test db`** + supabase_test_helpers (create user /
  authenticate-as), including `tests.rls_enabled()` on EVERY table —
  policies on a table with RLS off are a silent full bypass that no
  logged-in-user test ever catches. Required CI check for any migration
  touching a policy.
- pgvector: 384-dim is comfortably inside the standard limits.
  **Ruling on a genuine researcher disagreement**: the Supabase
  researcher says "HNSW now, defaults, build is trivial"; the matching
  researcher says "no index below ~100k rows, exact scan." The matcher
  wins for OUR query shape — heavy hard filters first + exactness
  priority (a missed match is a product failure, 20ms is not), and
  filtered ANN queries have their own recall traps. No index until the
  §6 trigger; revisit with data.
- Scheduled work: Supabase Cron (pg_cron) ONLY for in-database
  maintenance (purges, refreshes). It must never run the ingestion
  fan-out — Edge-Function-via-pg_cron has documented tight-timeout
  gotchas (~5s reported on the pg_net path, single-source, flagged).
- **Ingestion runs as a GitHub Actions scheduled workflow.** 6-hour max
  job runtime, ~2,000 free minutes/month — the whole 175→2,000-feed
  loop runs in ONE invocation with retries, no chunking gymnastics, $0,
  fully decoupled from app runtime and deploys. Vercel Cron (300s Pro
  cap) and Edge Functions (150-400s) would force batching complexity
  for nothing. Bonus unblock: the dry-run feed verification can run in
  CI **today** — GitHub's runners have open egress, so this no longer
  waits on the sandbox network policy.
- Storage: ONE private `cvs` bucket, folder-per-user
  (`user_id/file.pdf`), RLS on storage.objects via
  `(storage.foldername(name))[1] = auth.uid()::text`, short-TTL signed
  URLs (~60s) generated per request. Same pgTAP suite covers it.
- Backups: **Free tier has NO automated backups — Pro ($25/mo, 7 daily
  backups) is mandatory before real user data exists.** PITR (+$100/mo)
  is refused until revenue. And the most-repeated gotcha in the
  sources: **database backups do not cover Storage files** — the CV
  PDFs need their own scheduled bucket sync to a second location
  (a cron + rclone-class job), or a restore recovers metadata pointing
  at blobs that no longer exist.
- Auth platform facts: built-in email sender = **2 emails/hour** —
  custom SMTP (Resend EU) is a day-one production requirement, not
  polish (§4 #21); default 30 signups/hour rate limit after SMTP is
  configured — raise consciously for launch spikes.
- Migrations: `supabase start` local Docker stack, `db diff` to
  generate, files in `supabase/migrations/` (already our layout),
  applied via CI before deploy. **Per-PR Supabase branching is
  refused for now** — per-branch-hour pricing plus provisioning
  moving parts buy a solo founder little; plain SQL diffs reviewed in
  PRs + the local stack are enough. (This overrides the earlier
  branching-as-staging assumption; §5.6 and §6 updated accordingly.)

### 5.8 Ingestion (production wrapper around the existing runner)
*[Pending: researcher re-run in flight — scheduler choice + chunking,
ATS documented rate limits, conditional-request support, cross-ATS
dedup detail, freshness SLA numbers. The runner contract in §2 and
CONTRACTS.md's 7 rules stand regardless.]*

---

## 6 · Refusals (over-engineering, banned until their trigger fires)

| Refused | Trigger to revisit |
|---|---|
| Collaborative filtering / learned rerankers / CF embeddings | ~10k+ active users with dense swipe history (median user 50+ swipes) |
| HNSW/IVFFlat vector index | >100k live jobs or p95 rank latency > budget |
| Hybrid BM25 side-system (ParadeDB) | exact-code search demand + scale; also not on Supabase's extension allow-list |
| Queue broker / DLQ infra (SQS, pgmq consumers) | chunked cron + failed-rows table stops fitting in timeout ceilings |
| Long-lived staging environment | a team exists |
| Supabase per-PR branching (branch-hour billing, sync races) | a second regular contributor whose PRs need isolated DB state |
| PITR add-on ($100/mo) | paying users make a >24h loss window unacceptable |
| Self-hosted Langfuse (+ its Postgres/ClickHouse/Redis) | body-level tracing becomes necessary AND cloud-EU won't do |
| Async export pipeline | export > ~10k rows/user |
| Microservices, second database, Kafka, k8s | never at this stage; re-argue from zero if ever |

---

## 7 · Cost model (why calm is justified)

Groq ≈ $0.15/M in, $0.60/M out on the 120b → ≈ $0.001 per kit before
caching. Supabase Pro ($25/mo, needed for PITR + no-pause), Vercel
hobby→pro as traffic demands, Upstash/Better Stack/Sentry free tiers.
**Total infra for the first 1k users: on the order of tens of euros a
month.** The kill switch (#8) exists because the tail risk is a bug
loop, not user love.

---

## 8 · Build order — BW waves (backend waves, aligned with QW + D21)

Standing exit bar per wave: tests green (incl. new RLS/eval gates),
FEATURES.md updated, critic pass on anything user-visible.

- **BW0 · Spine** *(needs Supabase project + keys)* — client layer
  (browser/server/admin split per §5.3), @supabase/ssr wiring, Google
  OAuth + anonymous sessions + upgrade path, profiles/facts CRUD under
  RLS, RLS test harness, migrate-then-deploy CI ordering. Exit: a real
  account swipes real rows with the mock store retired for auth'd users.
- **BW1 · Data in** *(needs Supabase only — GitHub Actions provides
  the network!)* — Supabase JobStore for the existing runner, the
  scheduled GH Actions workflow (§5.7), feed-health persistence +
  heartbeat + alerting, pan-EU normalization (#22). The dry-run feed
  verification can run in CI before any of this. Exit: the deck serves
  live, fresh, deduped jobs; staleness labeled.
- **BW2 · Matching v1** — multilingual-e5-small embeddings (WASM,
  background), feature blend + versioned weights, "why ranked" data
  down to the UI chips, **golden set + CI floor in the same wave**,
  position logging (#4). Exit: suggestions are scored, explained, and
  regression-gated.
- **BW3 · AI for real** *(needs Groq key + ZDR toggle + DPA)* —
  GroqProvider behind `generateKit`, strict schema + abstention enum,
  response cache + idempotency keys, token bucket, kill switch, cost
  meter wiring, promptfoo/verifier evals in CI, metadata-only
  observability. Exit: real tailoring, grounded, metered, capped,
  observable.
- **BW4 · Law + lifecycle** — export route, deletion cascade + purge
  crons, retention jobs, Resend for auth email, RoPA + privacy-policy
  fill-in, breach runbook, restore drill #1. Exit: a user can leave
  cleanly, and we can prove it.
- **BW5 · Hardening** — CSP + headers, secret-scan gate, W5b mock
  checkout with deploy guard, Sentry scrub verification (trigger a
  parse error, inspect the event), load smoke on the rank + generate
  paths, spend alerts. Exit: the boring disasters are pre-empted.

BW0/BW1 unblock on your side (Supabase project, network policy);
BW2 is buildable immediately after BW1; BW3 waits on the Groq key.
QW0 (design foundation) remains independent and can start any time.

---

*Maintenance: like QUALITY_BAR.md — this document changes only with new
dated evidence or a founder decision. §5.8 (ingestion practice detail)
is the one sanctioned TODO — researcher in flight as of 2026-08-08.*
