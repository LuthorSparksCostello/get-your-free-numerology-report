-- Stores Google Calendar OAuth refresh tokens, keyed to the Auth0 user sub.
-- Accessed only via the service-role key (which bypasses RLS). RLS is enabled
-- with no policies so the anon/authenticated public API cannot read it.
create table if not exists public.google_calendar_tokens (
  user_sub               text primary key,
  refresh_token_enc      text not null,
  numerology_calendar_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.google_calendar_tokens is 'Google Calendar OAuth refresh tokens (AES-GCM encrypted), keyed to Auth0 user sub.';

alter table public.google_calendar_tokens enable row level security;
