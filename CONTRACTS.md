# CONTRACTS.md — binding technical contracts for Munus
# Compiled 2026-07-23 from docs/MUNUS_MVP_PLAN.md (§2 architecture, §3 data model).
# The plan has authority. Changes here require a DECISIONS LOG entry in FEATURES.md.

## 0. Product identity
- Product name: **Munus** (Latin: the job/post; also gift).
- The prototype and its filename still say "Scout" — that is historical. Every
  user-facing string ships as **Munus**. The prototype file itself is NOT edited.

## 1. Stack (verbatim from plan §2)

```
Next.js 16 (Vercel) ──► Supabase (Auth · Postgres + pgvector · Storage)
   │                        ▲
   │ API routes             │
   ▼                        │
LLM: Groq llama-3.3-70b (parse · reasons · tailoring · verifier)
Embeddings: MiniLM/bge-small (job + profile vectors)
   ▲
   │ every 30–60 min
Ingestion worker (Supabase cron / small VPS):
  Greenhouse boards API · Lever postings API · Ashby · Workable · SmartRecruiters
Payments: Stripe (checkout + customer portal + webhooks)
Analytics: PostHog (EU cloud)
```

- TypeScript strict. Tailwind + shadcn/ui primitives restyled to the token set below.
- Web-first PWA. No native build in MVP (plan §1 + §7: Capacitor only after PMF).

## 2. Data shapes (verbatim from plan §3 — these are the contracts)

```sql
profiles        (id=auth.uid, name, email, role_target, level, locations text[],
                 remote_ok, salary_min, currency, alerts, cv_path, plan free|plus,
                 stripe_customer_id, created_at)
facts           (id, profile_id, kind role|skill|outcome|education, content,
                 source_span, created_at)                       -- evidence store
companies       (id, name, slug, ats greenhouse|lever|ashby|…, feed_url, active)
jobs            (id, company_id, external_id, title, location, remote, salary_min,
                 salary_max, currency, description, apply_url, posted_at,
                 verified_at, open bool, embedding vector)
decisions       (id, profile_id, job_id, type save|pass|star, at)   -- swipe log
favorites       (profile_id, job_id, saved_at)                       -- view over decisions
job_matches     (profile_id, job_id, score, reasons jsonb, concern, cached_at)
documents       (id, profile_id, job_id, kind cv|letter, content jsonb,
                 accepted jsonb, tone, pdf_path, updated_at)
applications    (id, profile_id, job_id, status prepared|opened|confirmed,
                 confirmed_at, receipt jsonb)                        -- docs snapshot
usage           (profile_id, week_start, swipes int, gens_today int, day date)
subscriptions   (profile_id, stripe_sub_id, plan, period, status, renews_at)
```

- RLS on everything; service role only in workers.
- Every table lives in `supabase/migrations/` from day one. No dashboard-only schema.
- Dedupe key for jobs: `(source, external_id)`. `verified_at` powers the freshness
  pill; a 404 on the posting flips `open=false` and the job leaves every deck.
- Approved schema deltas (checkpoint 2026-07-23, FEATURES D14–D15):
  `decisions.type` gains `unsave` (undo support — favorites stays a view);
  a `waitlist (profile_id, tier, created_at)` table lands in W5 for the Pro
  waitlist button.

### Ingestion adapter contract (checkpoint 2026-07-23, from founder batch 1 — FEATURES D13)
1. Never guess slugs: every `companies.slug` must be evidence-confirmed
   (~20% of Greenhouse slugs are legacy names — miro=realtimeboardglobal etc.).
2. Greenhouse adapter tries `boards-api.greenhouse.io` then
   `boards-api.eu.greenhouse.io`, records which host 200s per company.
   Lever likewise has a documented EU variant (`api.eu.lever.co`) — the
   Lever adapter needs the same fallback before real-feed runs (founder
   batch 4, first affected row: Silverfin).
3. A 200 with an empty jobs array is healthy-but-quiet, never an error and
   never a reason to drop the company.
4. A company may be live on two ATS platforms mid-migration (Alan, Back
   Market, Ledger today) — company-level dedupe must tolerate two
   `(source, external_id)` roots; prefer the fresher/larger board.
5. The beachhead vertical is CONFIG, not code — seed list + matching
   thresholds load from config so vertical #2 is a data change (FEATURES D13).

## 3. Non-negotiable invariants
1. **Evidence-only AI.** Tailoring input = facts + job description, nothing else.
   Every output claim maps to a fact id. The **verifier is a blocking gate**:
   unmapped claims are dropped and logged, never shown. Zero escapes is a KPI.
2. **Server-side metering.** All Free/Plus limit checks live in API routes.
   The client never enforces money logic. Limits: Free = 20 swipes/week
   (weekly cron reset) + 2 AI tries per job after the free first kit per saved
   job. Plus fair use = 500 swipes/day, 30 generations/day.
3. **Redirect apply, honestly.** MVP never submits to employers. "Open official
   application" → track → return-confirm ("Did you apply?", Handshake pattern)
   → application record + receipt. Timeline states: **Prepared → Opened listing
   → Confirmed applied** (plan §1.5–1.6). The prototype's direct-submit strings
   ("Submitted", "Confirmed by employer portal", "Viewed by a human") are
   post-MVP Pro material and MUST NOT ship in MVP copy.
4. **Never estimate salary silently.** Parse when present; otherwise show
   "not listed" (plan §7).
5. **Pro is a waitlist button** until Plus revenue exists (plan §7).

## 4. Binding visual spec
**`prototypes/scout-pink-v2.html` is the binding visual spec for all UI.**
Pixel-exact is the default; deviations require a written reason in FEATURES.md
DECISIONS LOG. The **pink theme** (`body[data-theme="pink"]`) is the shipped
theme — the indigo variant is prototype-only exploration.

### Design tokens (pink theme, resolved — becomes `styles/tokens.css`)
```css
--rose: #f20c78;      /* forward motion + saving. Never decorative filler. */
--rose-ink: #b90056;
--rose-soft: #fff0f6;
--sky: #78d9ff;  --tangerine: #ff8b5c;  --butter: #ffe36e;
--ink: #18181b;  --muted: #6f6f75;
--paper: #fffdfd;  --canvas: #ebe7e8;  --phone: #f8f6f6;
--line: #e6e0e2;   --quiet: #f0ecee;
--green: #16794b;  --amber: #a35b00;  --red: #c42c43;
```
- Type: system stack (-apple-system / SF Pro Text). Display sizes use tight
  letter-spacing (−.04em to −.065em); overlines 11px/760 weight/uppercase.
- Radii: swipe cards 28px, sheets 26px, buttons 15px (small 12px), chips 7–8px.
- Pink-theme structural overrides that ARE the spec: welcome-orbit hidden,
  card-top blob hidden, save button = solid rose (not lime), SAVE stamp =
  rose outline.
- Design rules (from the prototype's own notes, carried by plan footer):
  pink marks forward movement only · swipe is optional (buttons/detail/undo
  always available) · AI may reframe verified experience, never invent it ·
  Free is metered by swipes and polish tries, never by honesty (first tailored
  kit per saved job is always free).
- Copy rule: wherever the prototype renders "Scout", ship "Munus". Sample
  personal data in the prototype (name, email, CV filename) is placeholder,
  not spec.
- Required states shipped by the prototype and therefore by every build phase:
  no-fresh-roles (caught up), offline, unsupported application, out-of-free-swipes.
  Every screen additionally ships loading/empty/error states (CLAUDE.md rule).

## 5. Folder structure (Next.js App Router)

```
app/
  (marketing)/            landing, /privacy, /terms
  (auth)/sign-in/         Google + Apple OAuth via Supabase Auth
  (app)/                  authenticated PWA shell (tabbar: Discover · Favorites · Applications · Profile)
    onboarding/           6-question flow + CV upload
    discover/             swipe deck
    jobs/[id]/            job detail
    favorites/
    studio/[jobId]/       AI Application Studio (CV + letter tabs)
    preflight/[jobId]/    review → redirect apply
    applications/         list
    applications/[id]/    receipt + timeline
    plans/                Free / Plus / Pro-waitlist
    profile/
  api/
    deck/                 ranked deck (reads job_matches, enforces swipe meter)
    decisions/            save | pass | star | unsave
    profile/              onboarding answers, CV upload → facts extraction
    studio/               generate · accept · tone · export (enforces gen meter)
    applications/         create · opened · confirm · receipt
    stripe/               checkout session + webhook
    gdpr/                 export · delete
components/
  ui/                     primitives restyled from tokens (shadcn base)
  deck/                   SwipeCard, DeckActions, stamps, coach overlay
  studio/                 Suggestion, EvidenceChip, ToneSheet, readiness bar
  states/                 Loading / Empty / Error / Offline (shared, mandatory)
lib/
  supabase/               server/client helpers
  llm/                    groq client · prompts (parse, reasons, tailor) · verifier
  matching/               embedding similarity + rule layer
  metering/               server-side usage checks
  stripe/  pdf/  analytics/
styles/tokens.css         §4 tokens — single source of visual truth
workers/ingestion/        adapters: greenhouse · lever · ashby · workable ·
                          smartrecruiters + normalizer, dedupe, embedder
supabase/migrations/
docs/                     MUNUS_MVP_PLAN.md (authority) · PRICING.md (MISSING — flagged)
prototypes/scout-pink-v2.html   binding visual spec (read-only)
```

## 6. FILE OWNERSHIP map (per CLAUDE.md Rule 7)

| Area | Owner | Notes |
|---|---|---|
| `supabase/migrations/` (schema) | **orchestrator** | architecture — never delegated |
| `styles/tokens.css` + `components/ui/` | **orchestrator** | the design system |
| `components/deck/` + `app/(app)/discover` + `api/deck` + `api/decisions` | **orchestrator** | core loop screens + state machine |
| `lib/llm/verifier` + studio generate pipeline | **orchestrator** | the trust moat |
| `lib/matching/` scoring | **orchestrator** | taste-sensitive ranking |
| `workers/ingestion/` adapters | implementer | per-source, well-specifiable |
| `app/(auth)/`, `app/(marketing)/` | implementer | standard patterns |
| favorites, applications list/receipt UI | implementer | spec includes prototype refs |
| `app/(app)/plans` + `lib/stripe` + `api/stripe` | implementer | orchestrator reviews webhook logic |
| `lib/pdf/` export | implementer | |
| `api/gdpr`, analytics wiring, profile | implementer | |
| `BACKLOG.md` | founder (append-only) | |
| everything (read-only audits) | auditor | |

Every implementer diff is reviewed by the orchestrator before commit.
One feature = one commit. FEATURES.md updates land in the same commit as the
status change they record.
