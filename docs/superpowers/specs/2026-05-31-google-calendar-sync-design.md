# Google Calendar Sync — Personal Day Cycles (Current Month)

**Date:** 2026-05-31
**Status:** Approved design (pre-implementation)

## Summary

Add a "Sync to Google Calendar" feature that lets a signed-in user push their
numerology **Personal Day** cycles for the **current month** into a dedicated
**"Numerology Cycles"** calendar in their own Google account. Uses server-side
Google OAuth 2.0 (Approach A — self-rolled with `googleapis`), with Google
refresh tokens stored per-user keyed to the Auth0 identity.

## Decisions (locked)

- **Delivery:** Server-side Google OAuth (not `.ics` download, not "add to
  calendar" links).
- **OAuth flow:** Approach A — roll our own with `googleapis` on the Express
  backend. (Not Auth0 Token Vault brokering.)
- **Scope of sync:** Current month only, into a **dedicated** calendar
  (not full year, not the primary calendar).
- **Math location:** Frontend computes the per-day payload using existing
  utils; backend only talks to Google.

## ⚠️ External gate: Google OAuth verification

The `https://www.googleapis.com/auth/calendar` scope is **sensitive**. The
OAuth consent screen must be **verified** by Google before the general public
can use it without an "unverified app" warning (requires published privacy
policy, homepage, scope justification; review takes days–weeks). In **Testing**
mode the feature works immediately for up to 100 manually-added test users (who
see the warning). The code can ship before verification; full public rollout
cannot.

## High-level flow

Two phases, both initiated from the Dashboard:

1. **Connect** (one-time): user clicks *Connect Google Calendar* → Google
   consent → backend stores a refresh token tied to their Auth0 identity.
2. **Sync** (repeatable): user clicks *Sync this month* → backend ensures the
   dedicated "Numerology Cycles" calendar exists, then creates ~30 all-day
   events for the current month. Re-running **replaces** that month's events
   (idempotent), never duplicates.

## Numerology math location (key simplification)

The **frontend** computes the per-day payload using the existing utils in
`src/utils/numerology.ts` — `calculatePersonalYearNumber` →
`calculatePersonalMonthNumber` → `calculatePersonalDayNumber` for each day of
the month — plus `numberMeanings[n]` from `src/utils/numerologyMeanings.ts` for
the title/description copy. It POSTs an array of
`{ date, dayNumber, title, description }`.

The **backend stays "dumb"** about numerology — it only performs Google API
mechanics. This keeps a single source of truth for the math (no duplication
into the separate server package) and reuses tested logic. Writing content into
the user's own calendar carries no security risk.

> Note: the formula in the original proposal — `(PY + PM + day) % 9` — is
> **incorrect** and is explicitly rejected. The app reduces `personalMonth + day`
> to a single digit (1–9, where 9 stays 9); `% 9` would turn every 9 into 0.
> We reuse the existing `calculatePersonalDayNumber` logic.

## Backend — new `server/src/routes/calendar.ts` (mounted at `/api/calendar`)

Follows the existing Router + Zod + service-role-Supabase pattern (ESM `.js`
import specifiers, mounted in `server/src/index.ts`).

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /status` | ✓ | `{ connected: boolean }` |
| `GET /connect` | ✓ | Returns Google consent URL as JSON (frontend then redirects) |
| `GET /callback?code&state` | — | Google redirects here; exchange code, store refresh token, redirect to `${APP_URL}/dashboard?calendar=connected` |
| `POST /sync` | ✓ | Body `{ days: [...] }`; ensure calendar, replace this month's events, return `{ created, calendarId }` |
| `POST /disconnect` | ✓ | Revoke token at Google + delete row |

## Auth — new `requireAuth` middleware

The backend currently has no auth. Add middleware that **validates the Auth0
access-token JWT** via Auth0's JWKS (using `jose`) and extracts `sub`.

**Config prerequisite:** register an *API* in Auth0 (an "audience") so the SPA
receives a verifiable JWT access token. The frontend then calls
`getAccessTokenSilently({ audience })` and sends `Authorization: Bearer <jwt>`.

Because a top-level browser redirect to Google cannot carry an `Authorization`
header, `/connect` returns the consent URL via `fetch` (authenticated) and the
browser then navigates to it.

## OAuth security details

- **State / CSRF:** `state` = HMAC-SHA256-signed `{ sub, nonce, exp(10min) }`
  using `CALENDAR_STATE_SECRET`. The callback verifies it — this is also how
  the callback identifies the user, since Google's redirect carries no Auth0
  token.
- **Token at rest:** refresh token stored **AES-256-GCM encrypted**
  (`CALENDAR_TOKEN_KEY`), decrypted only at use.
- **Scope:** `https://www.googleapis.com/auth/calendar`, with
  `access_type=offline` and `prompt=consent` to guarantee a refresh token.

## Supabase table

```sql
create table google_calendar_tokens (
  user_sub               text primary key,   -- Auth0 sub
  refresh_token_enc      text not null,       -- AES-256-GCM ciphertext
  numerology_calendar_id text,                -- cached dedicated calendar id
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);
```

Accessed via the existing service-role Supabase client (`server/src/config/supabase.config.ts`).

## Event shape & idempotency

- **All-day** events (`start.date` / `end.date`), one per day of the current
  month.
- Title e.g. `✨ Personal Day 7 — {theme}`; description from `numberMeanings`.
- Each event tagged
  `extendedProperties.private = { source: 'cosmic-blueprint', syncMonth: 'YYYY-MM' }`.
- **Sync = replace:** list this month's events filtered by that private
  property (`privateExtendedProperty` + `timeMin`/`timeMax`) → delete them →
  insert the fresh ~30. ~30 sequential inserts is well within Google rate
  limits.
- If `numerology_calendar_id` is missing or returns 404, create the calendar
  (`calendars.insert`, summary "Numerology Cycles") and re-cache the id.

## Frontend

- `useGoogleCalendar` hook: `status()`, `connect()`, `sync(days)`,
  `disconnect()` — all attach the Auth0 bearer token.
- Pure `buildMonthlyCycleEvents(birthDate, year, month)` helper (unit-testable)
  that produces the payload array from existing utils.
- UI: a card/button on the Dashboard with connected/disconnected states, a
  "Sync this month" action, and success/error toasts. On return, reads
  `?calendar=connected` to confirm.

## New dependencies & env

- **Server deps:** `googleapis`, `jose`.
- **Server env:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GOOGLE_OAUTH_REDIRECT_URI`, `CALENDAR_STATE_SECRET`, `CALENDAR_TOKEN_KEY`,
  `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `APP_URL`.
- **External setup (manual, by the owner):** Google Cloud project → OAuth
  consent screen + OAuth client credentials; register the redirect URI; add
  test user(s); register an Auth0 API for the audience.

## Error handling

- Token revoked/expired → `/status` returns `connected: false`; `/sync` returns
  a "reconnect needed" error the UI surfaces as a prompt to reconnect.
- Google rate limits → surfaced as a retryable error (small count makes this
  unlikely).
- Missing/404 calendar → recreate and re-cache id.

## Testing (vitest, matching `server/src/__tests__/`)

- State sign/verify round-trip.
- Token AES-GCM encrypt/decrypt round-trip.
- Day-payload → Google-event object mapping.
- Idempotent-replace logic with `googleapis` mocked.
- Frontend: pure `buildMonthlyCycleEvents` helper.

## Out of scope (YAGNI)

- Auto re-sync / cron scheduling.
- Multi-month or full-year population.
- Calendar providers other than Google.
- Timed (non-all-day) events.
- Push notifications / webhooks for calendar changes.
