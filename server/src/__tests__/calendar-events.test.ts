import { describe, it, expect } from 'vitest';
import { buildGoogleEvent, EVENT_SOURCE, type CycleDay } from '../lib/calendar-events.js';

const day: CycleDay = {
  date: '2026-06-07',
  dayNumber: 7,
  title: 'The Seeker',
  description: 'Reflection and wisdom.',
};

describe('buildGoogleEvent', () => {
  it('builds an all-day event with exclusive end date', () => {
    const ev = buildGoogleEvent(day, '2026-06');
    expect(ev.summary).toBe('✨ Personal Day 7 — The Seeker');
    expect(ev.description).toBe('Reflection and wisdom.');
    expect(ev.start).toEqual({ date: '2026-06-07' });
    expect(ev.end).toEqual({ date: '2026-06-08' }); // exclusive
    expect(ev.transparency).toBe('transparent');
  });

  it('tags the event for idempotent cleanup', () => {
    const ev = buildGoogleEvent(day, '2026-06');
    expect(ev.extendedProperties?.private).toEqual({
      source: EVENT_SOURCE,
      syncMonth: '2026-06',
    });
  });

  it('rolls over month boundaries for the end date', () => {
    const ev = buildGoogleEvent({ ...day, date: '2026-06-30' }, '2026-06');
    expect(ev.end).toEqual({ date: '2026-07-01' });
  });
});
