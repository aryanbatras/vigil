-- Vigil / Supabase audit ledger
-- Run this in the Supabase SQL editor for the project you want to use.
--
-- The browser never talks to Supabase. The Next.js server uses the
-- service-role key, which bypasses RLS. RLS is enabled with no policies so
-- anon/authenticated keys cannot read or write this table even if leaked.

create extension if not exists pgcrypto;

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  event_type text not null,
  totp_enabled boolean not null default false,
  backup_code_enabled boolean not null default false,
  two_factor_enabled boolean not null default false,
  session_id text,
  source text not null,
  detail jsonb not null default '{}'::jsonb,
  clerk_event_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists security_events_user_created_idx
  on public.security_events (user_id, created_at desc);

create index if not exists security_events_type_idx
  on public.security_events (event_type);

alter table public.security_events enable row level security;

-- Deliberately no policies: anon and authenticated roles get nothing.
revoke all on public.security_events from anon, authenticated;

-- The server only ever reads and appends. Remove the default write grants so
-- an application bug cannot rewrite history with the service-role key.
revoke update, delete on public.security_events from service_role;
grant select, insert on public.security_events to service_role;

-- Enforce the append-only contract in Postgres as well as in application code.
create or replace function public.security_events_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'security_events is append-only';
end;
$$;

drop trigger if exists security_events_no_update on public.security_events;
create trigger security_events_no_update
  before update or delete on public.security_events
  for each row execute function public.security_events_append_only();

comment on table public.security_events is
  'Server-verified MFA state snapshots. No TOTP secrets, backup codes, or email bodies are stored here.';

comment on column public.security_events.user_id is
  'Clerk user id (user_...). Not a Supabase auth uid.';
