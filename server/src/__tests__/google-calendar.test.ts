import { describe, it, expect, vi } from 'vitest';

// google.config.ts calls process.exit(1) at import when Google env vars are
// unset. Mock it so the module under test imports cleanly without real env.
// (vi.mock is hoisted above the imports below.)
vi.mock('../config/google.config.js', () => ({
  googleConfig: {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3001/api/calendar/callback',
    stateSecret: 'test-state-secret-1234567890',
    tokenKey: 'a'.repeat(64),
    appUrl: 'http://localhost:8080',
  },
}));

import { ensureNumerologyCalendar, replaceMonthEvents } from '../lib/google-calendar.js';
import type { CycleDay } from '../lib/calendar-events.js';

function fakeCalendar(overrides: any = {}) {
  return {
    calendars: { insert: vi.fn().mockResolvedValue({ data: { id: 'new-cal' } }) },
    calendarList: { get: vi.fn().mockResolvedValue({ data: { id: 'existing' } }) },
    events: {
      list: vi.fn().mockResolvedValue({ data: { items: [] } }),
      delete: vi.fn().mockResolvedValue({}),
      insert: vi.fn().mockResolvedValue({}),
    },
    ...overrides,
  } as any;
}

describe('ensureNumerologyCalendar', () => {
  it('returns the existing id when it still resolves', async () => {
    const cal = fakeCalendar();
    const id = await ensureNumerologyCalendar(cal, 'existing');
    expect(id).toBe('existing');
    expect(cal.calendars.insert).not.toHaveBeenCalled();
  });

  it('creates a calendar when none cached', async () => {
    const cal = fakeCalendar();
    const id = await ensureNumerologyCalendar(cal, null);
    expect(id).toBe('new-cal');
    expect(cal.calendars.insert).toHaveBeenCalled();
  });

  it('recreates when the cached id 404s', async () => {
    const cal = fakeCalendar({
      calendarList: { get: vi.fn().mockRejectedValue({ code: 404 }) },
    });
    const id = await ensureNumerologyCalendar(cal, 'gone');
    expect(id).toBe('new-cal');
    expect(cal.calendars.insert).toHaveBeenCalled();
  });
});

describe('replaceMonthEvents', () => {
  const days: CycleDay[] = [
    { date: '2026-06-01', dayNumber: 1, title: 'The Leader', description: 'x' },
    { date: '2026-06-02', dayNumber: 2, title: 'The Diplomat', description: 'y' },
  ];

  it('deletes existing tagged events then inserts the new ones', async () => {
    const cal = fakeCalendar({
      events: {
        list: vi.fn().mockResolvedValue({ data: { items: [{ id: 'old1' }, { id: 'old2' }] } }),
        delete: vi.fn().mockResolvedValue({}),
        insert: vi.fn().mockResolvedValue({}),
      },
    });
    const count = await replaceMonthEvents(cal, 'cal1', '2026-06', days);
    expect(cal.events.delete).toHaveBeenCalledTimes(2);
    expect(cal.events.insert).toHaveBeenCalledTimes(2);
    expect(count).toBe(2);
  });
});
