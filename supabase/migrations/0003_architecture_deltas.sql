-- Munus architecture deltas — applied on top of 0001/0002.
-- Approved via the Architecture Brief (D24–D28, FEATURES.md DECISIONS LOG):
--   D26 — durable generation state (documents.status)
--   D27 — swipe idempotency (decisions.idempotency_key)
-- D24 (pgvector deferral) is a runtime decision: the embedding column stays,
--   the extension stays, but no embedding writes happen in MVP.

-- ── D26: durable generation state ─────────────────────────────────────────
-- Server-side transitions only (queued → generating → needs_review → ready).
-- The client never writes status directly (CONTRACTS §3.6).
create type document_status as enum ('queued', 'generating', 'needs_review', 'ready');

alter table documents
  add column status document_status not null default 'queued';

-- ── D27: swipe idempotency ────────────────────────────────────────────────
-- Client-generated key; the decisions+usage server transaction (CONTRACTS
-- §3.7) uses it so a retried swipe can never double-count the meter.
alter table decisions
  add column idempotency_key uuid unique;

-- ── indexes supporting the atomic decision route ──────────────────────────
-- Lookup by idempotency key must be fast on retry paths.
create index decisions_idempotency_key_idx on decisions (idempotency_key);
