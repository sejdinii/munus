-- W2 onboarding rework (founder feedback 2026-08-07): work-type preference.
-- Profiles gain work_types (remote/hybrid/onsite); remote_ok + salary_min
-- stay for backward compatibility (deck API moves to work_types; salary
-- question removed — column remains nullable and unused).
alter table profiles
  add column work_types text[] not null default '{remote,hybrid,onsite}';
