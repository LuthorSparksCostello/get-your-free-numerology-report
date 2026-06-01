import { google, calendar_v3 } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { googleConfig } from '../config/google.config.js';
import { buildGoogleEvent, EVENT_SOURCE, type CycleDay } from './calendar-events.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_SUMMARY = 'Numerology Cycles';

/** Create a fresh OAuth2 client configured for this app. */
export function createOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
  );
}

/** Build the Google consent URL, embedding our signed state. */
export function getAuthUrl(state: string): string {
  return createOAuthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // force a refresh_token every time
    scope: SCOPES,
    state,
  });
}

/** Exchange an authorization code for a refresh token. */
export async function exchangeCodeForRefreshToken(code: string): Promise<string> {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error('Google did not return a refresh token');
  }
  return tokens.refresh_token;
}

/** A Calendar API client bound to a user's refresh token. */
export function calendarClientFor(refreshToken: string): calendar_v3.Calendar {
  const auth = createOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: 'v3', auth });
}

/** Revoke a refresh token at Google (best-effort). */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const auth = createOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  await auth.revokeCredentials();
}

/**
 * Ensure a dedicated "Numerology Cycles" calendar exists.
 * Reuses `existingId` if it still resolves; otherwise creates a new one.
 * Returns the calendar id to use.
 */
export async function ensureNumerologyCalendar(
  cal: calendar_v3.Calendar,
  existingId: string | null
): Promise<string> {
  if (existingId) {
    try {
      await cal.calendarList.get({ calendarId: existingId });
      return existingId;
    } catch (err: any) {
      if (err?.code !== 404) throw err;
      // fall through and recreate
    }
  }
  const created = await cal.calendars.insert({
    requestBody: { summary: CALENDAR_SUMMARY },
  });
  const id = created.data.id;
  if (!id) throw new Error('Failed to create numerology calendar');
  return id;
}

/**
 * Replace this month's numerology events: delete any previously-synced
 * (tagged) events in the month, then insert the new day set.
 * Returns the number of events created.
 */
export async function replaceMonthEvents(
  cal: calendar_v3.Calendar,
  calendarId: string,
  syncMonth: string, // YYYY-MM
  days: CycleDay[]
): Promise<number> {
  const existing = await cal.events.list({
    calendarId,
    privateExtendedProperty: [`source=${EVENT_SOURCE}`, `syncMonth=${syncMonth}`],
    showDeleted: false,
    maxResults: 2500,
  });
  for (const ev of existing.data.items ?? []) {
    if (ev.id) await cal.events.delete({ calendarId, eventId: ev.id });
  }
  for (const day of days) {
    await cal.events.insert({ calendarId, requestBody: buildGoogleEvent(day, syncMonth) });
  }
  return days.length;
}
