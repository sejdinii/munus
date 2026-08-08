-- W5a (2026-08-08): LLM cost meter. One row per server-side AI call.
-- The meter is the admin's water meter (visibility + cap input); users
-- never see it. cost_eur is computed at write time from the model's
-- published per-1M-token rates (gpt-oss-120b: $0.15/$0.60, treated as EUR).

create table if not exists llm_usage (
  id bigint generated always as identity primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null,          -- 'cv-parse' | 'reasons' | 'tailor'
  model text not null,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  cost_eur numeric(8, 4) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists llm_usage_profile_created_idx
  on llm_usage (profile_id, created_at desc);

create index if not exists llm_usage_endpoint_created_idx
  on llm_usage (endpoint, created_at desc);
