-- Munus profile auto-creation — applied on top of 0001..0004.
-- TASK-104: owner-scoped tables (facts, decisions, ...) FK to profiles.id,
-- but nothing created the profile row on signup — the first facts insert
-- died on the foreign key. Standard Supabase trigger + backfill.

-- ── trigger: create the profile row at signup ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── backfill: profile rows for users who signed up before the trigger ────
insert into profiles (id, email, name)
select id, email, coalesce(raw_user_meta_data ->> 'name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;
