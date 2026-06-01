-- Stores Google Calendar OAuth refresh tokens, keyed to the Auth0 user sub.
create table if not exists google_calendar_tokens (
  user_sub               text primary key,
  refresh_token_enc      text not null,
  numerology_calendar_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
