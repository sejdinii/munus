-- Row Level Security — CONTRACTS.md §2: "RLS on everything; service role
-- only in workers." Under D21 real accounts hold real CVs, so this file is
-- the difference between a private evidence store and a data breach.
--
-- Model:
--   * Every user-owned table is readable/writable ONLY by its owner
--     (profile_id = auth.uid()).
--   * Job data is public-read to any signed-in user; only the ingestion
--     worker (service role) writes it.
--   * The service role bypasses RLS by design — workers use it, the app
--     never ships it to a browser.
--
-- Note on `using` vs `with check`: `using` filters rows you may SEE/affect,
-- `with check` validates rows you may CREATE/leave behind. Both are needed
-- on writes or a user could insert a row owned by someone else.

alter table profiles       enable row level security;
alter table facts          enable row level security;
alter table companies      enable row level security;
alter table jobs           enable row level security;
alter table feed_health    enable row level security;
alter table decisions      enable row level security;
alter table job_matches    enable row level security;
alter table documents      enable row level security;
alter table verifier_drops enable row level security;
alter table applications   enable row level security;
alter table usage          enable row level security;
alter table job_usage      enable row level security;
alter table subscriptions  enable row level security;
alter table waitlist       enable row level security;

-- ── profiles: you, and only you ──────────────────────────────────────────
create policy profiles_select_own on profiles
  for select using (id = (select auth.uid()));
create policy profiles_insert_own on profiles
  for insert with check (id = (select auth.uid()));
create policy profiles_update_own on profiles
  for update using (id = (select auth.uid()))
              with check (id = (select auth.uid()));
create policy profiles_delete_own on profiles
  for delete using (id = (select auth.uid()));

-- ── owner-scoped tables ──────────────────────────────────────────────────
-- facts / decisions / job_matches / documents / applications / job_usage
-- all follow the identical shape: own rows only, on every verb.

create policy facts_own on facts
  for all using (profile_id = (select auth.uid()))
          with check (profile_id = (select auth.uid()));

create policy decisions_own on decisions
  for all using (profile_id = (select auth.uid()))
          with check (profile_id = (select auth.uid()));

create policy job_matches_own on job_matches
  for all using (profile_id = (select auth.uid()))
          with check (profile_id = (select auth.uid()));

create policy documents_own on documents
  for all using (profile_id = (select auth.uid()))
          with check (profile_id = (select auth.uid()));

create policy applications_own on applications
  for all using (profile_id = (select auth.uid()))
          with check (profile_id = (select auth.uid()));

create policy job_usage_own on job_usage
  for all using (profile_id = (select auth.uid()))
          with check (profile_id = (select auth.uid()));

create policy waitlist_own on waitlist
  for all using (profile_id = (select auth.uid()))
          with check (profile_id = (select auth.uid()));

-- ── metering + billing: readable by the owner, WRITABLE ONLY server-side ──
-- The client must never be able to reset its own swipe counter or promote
-- itself to Plus (§3.2: "the client never enforces money logic"). No insert
-- or update policy exists for these, so only the service role can write.
create policy usage_select_own on usage
  for select using (profile_id = (select auth.uid()));

create policy subscriptions_select_own on subscriptions
  for select using (profile_id = (select auth.uid()));

-- ── job data: public-read to signed-in users, worker-write only ──────────
create policy companies_read on companies
  for select to authenticated using (true);
create policy jobs_read on jobs
  for select to authenticated using (true);

-- feed_health and verifier_drops are operational telemetry: no client
-- policy at all, so they are service-role-only in both directions.
-- (Deliberate: verifier drops may quote CV text and must never be
-- browsable, and feed health is our infrastructure, not user data.)
