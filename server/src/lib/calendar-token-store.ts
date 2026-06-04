import { supabase } from '../config/supabase.config.js';

const TABLE = 'google_calendar_tokens';

export interface CalendarTokenRow {
  user_sub: string;
  refresh_token_enc: string;
  numerology_calendar_id: string | null;
}

/** Fetch the stored token row for a user, or null if none. */
export async function getToken(userSub: string): Promise<CalendarTokenRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('user_sub, refresh_token_enc, numerology_calendar_id')
    .eq('user_sub', userSub)
    .maybeSingle();
  if (error) throw new Error(`Failed to load calendar token: ${error.message}`);
  return (data as CalendarTokenRow) ?? null;
}

/** Insert or replace the encrypted refresh token for a user. */
export async function saveRefreshToken(userSub: string, refreshTokenEnc: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { user_sub: userSub, refresh_token_enc: refreshTokenEnc, updated_at: new Date().toISOString() },
      { onConflict: 'user_sub' }
    );
  if (error) throw new Error(`Failed to save refresh token: ${error.message}`);
}

/** Cache the dedicated calendar id for a user. */
export async function saveCalendarId(userSub: string, calendarId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ numerology_calendar_id: calendarId, updated_at: new Date().toISOString() })
    .eq('user_sub', userSub);
  if (error) throw new Error(`Failed to save calendar id: ${error.message}`);
}

/** Remove the stored token (on disconnect). */
export async function deleteToken(userSub: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('user_sub', userSub);
  if (error) throw new Error(`Failed to delete calendar token: ${error.message}`);
}
