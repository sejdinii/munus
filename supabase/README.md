# Supabase

Migrations are the schema's single source of truth — never edit the database
by hand. Apply with the Supabase CLI:

```sh
supabase link --project-ref <ref>
supabase db push
```

Environment variables the app reads (see `src/lib/env.ts`):

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | project URL; unset → keyless dev mode |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | workers, metering, webhooks |

Without these set, the app runs in **dev mode**: a local dev session replaces
auth and a file-backed store replaces the database, exercising the exact same
screens and states. No production code path fakes success.
