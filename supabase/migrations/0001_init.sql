-- Scout schema v1 — docs/SCOUT_MVP_PLAN.md §3.
-- Every table lives in migrations from day one. RLS on everything;
-- workers and money logic use the service role from API routes only.

create extension if not exists pgcrypto;
create extension if not exists vector;

-- ---------------------------------------------------------------- profiles
create table profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  name               text,
  email              text not null,
  role_target        text,
  level              text,
  locations          text[] not null default '{}',
  remote_ok          boolean not null default true,
  salary_min         integer,
  currency           text not null default 'EUR',
  alerts             text,
  cv_path            text,
  plan               text not null default 'free' check (plan in ('free', 'plus')),
  stripe_customer_id text,
  created_at         timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "own profile: select" on profiles for select using (id = auth.uid());
create policy "own profile: insert" on profiles for insert with check (id = auth.uid());
create policy "own profile: update" on profiles for update using (id = auth.uid());

-- A profiles row must exist the moment a user signs up — CV upload (and its
-- facts FK) happens before onboarding finishes, so don't rely on the app.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------- facts
-- The evidence store: every AI claim must trace back to a row here.
create table facts (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles (id) on delete cascade,
  kind        text not null check (kind in ('role', 'skill', 'outcome', 'education')),
  content     text not null,
  source_span text,
  created_at  timestamptz not null default now()
);
create index facts_profile_idx on facts (profile_id);

alter table facts enable row level security;
create policy "own facts: select" on facts for select using (profile_id = auth.uid());
create policy "own facts: insert" on facts for insert with check (profile_id = auth.uid());
create policy "own facts: delete" on facts for delete using (profile_id = auth.uid());

-- --------------------------------------------------------------- companies
create table companies (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  slug     text not null unique,
  ats      text not null check (ats in ('greenhouse', 'lever', 'ashby', 'workable', 'smartrecruiters')),
  feed_url text not null,
  active   boolean not null default true
);

alter table companies enable row level security;
create policy "companies: readable when signed in" on companies
  for select using (auth.role() = 'authenticated');
-- writes: ingestion worker via service role only (no user policy on purpose)

-- -------------------------------------------------------------------- jobs
create table jobs (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies (id) on delete cascade,
  external_id text not null,
  title       text not null,
  location    text not null default '',
  remote      boolean not null default false,
  salary_min  integer,
  salary_max  integer,
  currency    text,
  description text not null default '',
  apply_url   text not null,
  posted_at   timestamptz,
  verified_at timestamptz not null default now(),
  open        boolean not null default true,
  embedding   vector(384),
  unique (company_id, external_id)          -- dedupe key: (source, external_id)
);
create index jobs_open_fresh_idx on jobs (open, verified_at desc);

alter table jobs enable row level security;
create policy "jobs: readable when signed in" on jobs
  for select using (auth.role() = 'authenticated');
-- writes: ingestion worker via service role only

-- --------------------------------------------------------------- decisions
-- Append-only swipe log. Favorites derive from it.
create table decisions (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  job_id     uuid not null references jobs (id) on delete cascade,
  type       text not null check (type in ('save', 'pass', 'star')),
  at         timestamptz not null default now()
);
create index decisions_profile_idx on decisions (profile_id, at desc);

alter table decisions enable row level security;
create policy "own decisions: select" on decisions for select using (profile_id = auth.uid());
create policy "own decisions: insert" on decisions for insert with check (profile_id = auth.uid());
create policy "own decisions: delete" on decisions for delete using (profile_id = auth.uid());

-- favorites = the user's latest decision per job, when it saved/starred
create view favorites with (security_invoker = true) as
select distinct on (profile_id, job_id)
  profile_id,
  job_id,
  at as saved_at
from decisions
where type in ('save', 'star')
order by profile_id, job_id, at desc;

-- ------------------------------------------------------------- job_matches
create table job_matches (
  profile_id uuid not null references profiles (id) on delete cascade,
  job_id     uuid not null references jobs (id) on delete cascade,
  score      real not null,
  reasons    jsonb not null default '[]',
  concern    text,
  cached_at  timestamptz not null default now(),
  primary key (profile_id, job_id)
);

alter table job_matches enable row level security;
create policy "own matches: select" on job_matches for select using (profile_id = auth.uid());
-- writes: matcher via service role only (scores are computed, never client-set)

-- --------------------------------------------------------------- documents
create table documents (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  job_id     uuid not null references jobs (id) on delete cascade,
  kind       text not null check (kind in ('cv', 'letter')),
  content    jsonb not null default '{}',
  accepted   jsonb not null default '[]',
  tone       text,
  pdf_path   text,
  updated_at timestamptz not null default now(),
  unique (profile_id, job_id, kind)
);

alter table documents enable row level security;
create policy "own documents: select" on documents for select using (profile_id = auth.uid());
create policy "own documents: insert" on documents for insert with check (profile_id = auth.uid());
create policy "own documents: update" on documents for update using (profile_id = auth.uid());
create policy "own documents: delete" on documents for delete using (profile_id = auth.uid());

-- ------------------------------------------------------------ applications
create table applications (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles (id) on delete cascade,
  job_id       uuid not null references jobs (id) on delete cascade,
  status       text not null default 'prepared'
               check (status in ('prepared', 'opened', 'confirmed')),
  confirmed_at timestamptz,
  receipt      jsonb not null default '{}'
);
create index applications_profile_idx on applications (profile_id);

alter table applications enable row level security;
create policy "own applications: select" on applications for select using (profile_id = auth.uid());
create policy "own applications: insert" on applications for insert with check (profile_id = auth.uid());
create policy "own applications: update" on applications for update using (profile_id = auth.uid());

-- ------------------------------------------------------------------- usage
-- Server-side metering. Users can see their meter, never write it.
create table usage (
  profile_id uuid not null references profiles (id) on delete cascade,
  week_start date not null,
  swipes     integer not null default 0,
  gens_today integer not null default 0,
  day        date not null default current_date,
  primary key (profile_id, week_start)
);

alter table usage enable row level security;
create policy "own usage: select" on usage for select using (profile_id = auth.uid());
-- writes: API routes via service role only — the client never enforces money logic

-- ---------------------------------------------------------- subscriptions
create table subscriptions (
  profile_id    uuid not null references profiles (id) on delete cascade,
  stripe_sub_id text not null primary key,
  plan          text not null check (plan in ('plus')),
  period        text not null check (period in ('week', 'month', 'quarter')),
  status        text not null,
  renews_at     timestamptz
);

alter table subscriptions enable row level security;
create policy "own subscription: select" on subscriptions for select using (profile_id = auth.uid());
-- writes: Stripe webhook via service role only

-- ----------------------------------------------------------------- storage
-- Private buckets: raw CVs and exported PDFs, path convention {profile_id}/...
insert into storage.buckets (id, name, public) values
  ('cvs', 'cvs', false),
  ('exports', 'exports', false);

create policy "own cv files" on storage.objects
  for all
  using (bucket_id in ('cvs', 'exports') and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id in ('cvs', 'exports') and (storage.foldername(name))[1] = auth.uid()::text);
