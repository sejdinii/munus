# Munus

Swipe-based job discovery for people who review everything before it's sent.
Fresh jobs from company ATS feeds, ranked around a verified career profile;
AI that may reframe your experience but can never invent it.

- **Plan / scope:** `docs/SCOUT_MVP_PLAN.md` (approved MVP definition)
- **Design spec:** `prototypes/scout-pink-v2.html` — pink theme is pixel truth
- **Live state:** `FEATURES.md` (statuses), `CONTRACTS.md` (tokens, shapes, ownership), `BACKLOG.md` (research inbox)

## Stack

Next.js (App Router, TypeScript strict, Tailwind v4) · Supabase (auth,
Postgres + pgvector, storage) · Groq for CV fact extraction · Stripe (later
phase). Schema lives in `supabase/migrations/` — see `supabase/README.md`.

## Run it

```sh
npm install
npm run dev
```

With no env vars set the app runs in **dev mode**: sign-in creates a local dev
session, data persists to `.dev-data/`, and CV parsing uses the deterministic
heuristic extractor. Same screens, same states as production — no fake
success paths.

To run against real services set (see `src/lib/env.ts`):

```
NEXT_PUBLIC_SUPABASE_URL=…       # + apply supabase/migrations first
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…      # server-only (workers, metering)
GROQ_API_KEY=…                   # optional: LLM fact extraction w/ verifier
```

Google/Apple sign-in additionally requires enabling those providers in the
Supabase dashboard.

## Checks

`npm run lint` · `npx tsc --noEmit` · `npm run build` — same three steps CI
runs (`.github/workflows/ci.yml`).
