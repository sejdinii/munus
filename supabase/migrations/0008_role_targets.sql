-- W2 onboarding rework (founder direction 2026-08-07): MULTIPLE roles per
-- profile (LinkedIn-style tag bar). role_target keeps the primary role for
-- back-compat; role_targets holds the full list the matcher uses.
alter table profiles
  add column role_targets text[] not null default '{}';
