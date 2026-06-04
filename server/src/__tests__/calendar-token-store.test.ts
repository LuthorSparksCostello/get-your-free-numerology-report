import { describe, it, expect, vi, beforeEach } from 'vitest';

const single = vi.fn();
const upsert = vi.fn();
const update = vi.fn();
const del = vi.fn();

vi.mock('../config/supabase.config.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: single })) })),
      upsert,
      update: vi.fn(() => ({ eq: update })),
      delete: vi.fn(() => ({ eq: del })),
    })),
  },
}));

import { getToken, saveRefreshToken, saveCalendarId, deleteToken } from '../lib/calendar-token-store.js';

describe('calendar-token-store', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getToken returns the row when present', async () => {
    single.mockResolvedValue({ data: { user_sub: 'auth0|abc', refresh_token_enc: 'enc', numerology_calendar_id: 'cal1' }, error: null });
    const row = await getToken('auth0|abc');
    expect(row?.refresh_token_enc).toBe('enc');
  });

  it('getToken returns null when absent', async () => {
    single.mockResolvedValue({ data: null, error: null });
    expect(await getToken('nobody')).toBeNull();
  });

  it('saveRefreshToken upserts', async () => {
    upsert.mockResolvedValue({ error: null });
    await saveRefreshToken('auth0|abc', 'enc');
    expect(upsert).toHaveBeenCalled();
  });

  it('saveCalendarId updates', async () => {
    update.mockResolvedValue({ error: null });
    await saveCalendarId('auth0|abc', 'cal1');
    expect(update).toHaveBeenCalledWith('user_sub', 'auth0|abc');
  });

  it('deleteToken deletes', async () => {
    del.mockResolvedValue({ error: null });
    await deleteToken('auth0|abc');
    expect(del).toHaveBeenCalledWith('user_sub', 'auth0|abc');
  });
});
