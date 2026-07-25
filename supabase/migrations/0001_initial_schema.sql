-- Munus initial schema — CONTRACTS.md §2 (verbatim from plan §3) plus the
-- approved deltas (D14 decisions.unsave, D15 waitlist, companies.type).
-- Every table lives in migrations from day one; nothing is created by hand
-- in the dashboard (the talk.cv lesson, plan §3).
--
-- Ordering matters: extensions → enums → tables → indexes → views.
-- RLS policies live in 0002; they are big enough to read on their own.

create extension if not exists "vector" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- ── enums ────────────────────────────────────────────────────────────────
create type fact_kind as enum ('role', 'skill', 'outcome', 'education');
create type ats_source as enum (
  'greenhouse', 'lever', 'ashby', 'workable', 'smartrecruiters'
);
create type company_type as enum ('product', 'consultancy', 'agency');
-- 'unsave' is the inverse of a save so `favorites` can stay a pure view
-- over an append-only log (D14).
create type decision_type as enum ('save', 'pass', 'star', 'unsave');
create type document_kind as enum ('cv', 'letter');
-- Redirect-apply only (D2): Munus never submits, so there is deliberately
-- no 'submitted' state. Confirmed = the USER told us they applied.
create type application_status as enum ('prepared', 'opened', 'confirmed');
create type plan_tier as enum ('free', 'plus');

-- ── profiles ─────────────────────────────────────────────────────────────
create table profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  name               text,
  email              text,
  role_target        text,
  level              text,
  locations          text[] not null default '{}',
  remote_ok          boolean not null default true,
  salary_min         integer,
  currency           text,
  alerts             text,
  cv_path            text,
  plan               plan_tier not null default 'free',
  stripe_customer_id text,
  created_at         timestamptz not null default now()
);

-- ── facts: the evidence store (§3.1 — the AI may use nothing else) ────────
create table facts (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles (id) on delete cascade,
  kind        fact_kind not null,
  content     text not null,
  source_span text,
  created_at  timestamptz not null default now()
);
create index facts_profile_idx on facts (profile_id);

-- ── companies + jobs (ingestion) ─────────────────────────────────────────
create table companies (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  slug      text not null,
  ats       ats_source not null,
  -- Evidence-confirmed, never generated from the name (contract rule #1).
  feed_url  text not null,
  -- Which host actually answered; Greenhouse/Lever have EU variants (#2).
  feed_host text,
  type      company_type not null default 'product',
  active    boolean not null default true,
  unique (ats, slug)
);

create table jobs (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies (id) on delete cascade,
  source      ats_source not null,
  external_id text not null,
  title       text not null,
  location    text,
  remote      boolean not null default false,
  -- Null means "not listed". We never estimate (§3.4).
  salary_min  integer,
  salary_max  integer,
  currency    text,
  description text,
  apply_url   text not null,
  posted_at   timestamptz,
  -- Powers the honest freshness pill.
  verified_at timestamptz not null default now(),
  open        boolean not null default true,
  embedding   extensions.vector(384),
  -- The dedupe key from the plan.
  unique (source, external_id)
);
create index jobs_open_verified_idx on jobs (open, verified_at desc);
create index jobs_company_idx on jobs (company_id);

-- Feed health per run: an empty-but-200 feed is healthy, not an error (#3).
create table feed_health (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  ok         boolean not null,
  host       text,
  job_count  integer not null default 0,
  error      text,
  at         timestamptz not null default now()
);
create index feed_health_company_idx on feed_health (company_id, at desc);

-- ── decisions + favorites view ───────────────────────────────────────────
create table decisions (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  job_id     uuid not null references jobs (id) on delete cascade,
  type       decision_type not null,
  at         timestamptz not null default now()
);
create index decisions_profile_at_idx on decisions (profile_id, at desc);

-- favorites is a VIEW over the log (plan §3): the latest decision per
-- (profile, job) wins, and it counts as a favorite only when that decision
-- is a save/star — an 'unsave' removes it without deleting history.
create view favorites as
select profile_id, job_id, at as saved_at
from (
  select distinct on (profile_id, job_id)
         profile_id, job_id, type, at
  from decisions
  order by profile_id, job_id, at desc
) latest
where type in ('save', 'star');

-- ── matching cache ───────────────────────────────────────────────────────
create table job_matches (
  profile_id uuid not null references profiles (id) on delete cascade,
  job_id     uuid not null references jobs (id) on delete cascade,
  score      real not null,
  reasons    jsonb not null default '[]'::jsonb,
  concern    text,
  cached_at  timestamptz not null default now(),
  primary key (profile_id, job_id)
);
create index job_matches_profile_score_idx on job_matches (profile_id, score desc);

-- ── documents (studio output) ────────────────────────────────────────────
create table documents (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  job_id     uuid not null references jobs (id) on delete cascade,
  kind       document_kind not null,
  content    jsonb not null default '{}'::jsonb,
  accepted   jsonb not null default '[]'::jsonb,
  tone       text,
  pdf_path   text,
  updated_at timestamptz not null default now(),
  unique (profile_id, job_id, kind)
);

-- Audit trail behind "zero verifier escapes" (plan §6 KPI): every dropped
-- suggestion is logged, so escapes are measurable rather than assumed.
create table verifier_drops (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references profiles (id) on delete set null,
  job_id       uuid references jobs (id) on delete set null,
  reason       text not null,
  payload      jsonb,
  at           timestamptz not null default now()
);

-- ── applications (redirect-apply receipts) ───────────────────────────────
create table applications (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles (id) on delete cascade,
  job_id       uuid not null references jobs (id) on delete cascade,
  status       application_status not null default 'prepared',
  opened_at    timestamptz,
  confirmed_at timestamptz,
  archived     boolean not null default false,
  -- Immutable snapshot of exactly what the user approved.
  receipt      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  unique (profile_id, job_id)
);
create index applications_profile_idx on applications (profile_id, created_at desc);

-- ── metering (server-side only — the client never enforces money) ────────
create table usage (
  profile_id uuid not null references profiles (id) on delete cascade,
  week_start date not null,
  day        date not null,
  swipes     integer not null default 0,
  gens_today integer not null default 0,
  primary key (profile_id, week_start, day)
);

-- Per-job generation counter: Free gets a free first kit per saved job,
-- then 2 AI tries (D9) — that is per job, not per week.
create table job_usage (
  profile_id  uuid not null references profiles (id) on delete cascade,
  job_id      uuid not null references jobs (id) on delete cascade,
  generations integer not null default 0,
  primary key (profile_id, job_id)
);

create table subscriptions (
  profile_id    uuid primary key references profiles (id) on delete cascade,
  stripe_sub_id text,
  plan          plan_tier not null default 'free',
  period        text,
  status        text,
  renews_at     timestamptz
);

-- Pro stays a waitlist until Plus revenue exists (D8/D15).
create table waitlist (
  profile_id uuid not null references profiles (id) on delete cascade,
  tier       text not null default 'pro',
  created_at timestamptz not null default now(),
  primary key (profile_id, tier)
);
