import { useCallback } from 'react';
import { useOptionalAuth0 } from '@/auth/useOptionalAuth0';
import { auth0Config } from '@/auth/auth0-config';
import { buildMonthlyCycleEvents } from '@/utils/calendarCycles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface SyncResult {
  created: number;
  calendarId: string;
}

/** Client for the backend /api/calendar endpoints. */
export function useGoogleCalendar() {
  const { getAccessTokenSilently } = useOptionalAuth0();

  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getAccessTokenSilently({
      authorizationParams: { audience: auth0Config.audience },
    });
    return { Authorization: `Bearer ${token}` };
  }, [getAccessTokenSilently]);

  const status = useCallback(async (): Promise<boolean> => {
    const res = await fetch(`${API_URL}/api/calendar/status`, { headers: await authHeaders() });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.connected;
  }, [authHeaders]);

  const connect = useCallback(async (): Promise<void> => {
    const res = await fetch(`${API_URL}/api/calendar/connect`, { headers: await authHeaders() });
    if (!res.ok) throw new Error('Failed to start Google connection');
    const { url } = await res.json();
    window.location.href = url; // top-level redirect to Google consent
  }, [authHeaders]);

  const sync = useCallback(async (birthDate: string): Promise<SyncResult> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const syncMonth = `${year}-${String(month).padStart(2, '0')}`;
    const days = buildMonthlyCycleEvents(birthDate, year, month);

    const res = await fetch(`${API_URL}/api/calendar/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ syncMonth, days }),
    });
    if (res.status === 409) {
      const err = new Error('Google Calendar not connected') as Error & { code?: string };
      err.code = 'NOT_CONNECTED';
      throw err;
    }
    if (!res.ok) throw new Error('Calendar sync failed');
    return res.json();
  }, [authHeaders]);

  const disconnect = useCallback(async (): Promise<void> => {
    const res = await fetch(`${API_URL}/api/calendar/disconnect`, {
      method: 'POST',
      headers: await authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to disconnect');
  }, [authHeaders]);

  return { status, connect, sync, disconnect };
}
