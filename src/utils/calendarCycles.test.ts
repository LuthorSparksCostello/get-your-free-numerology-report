import { describe, it, expect } from 'vitest';
import { buildMonthlyCycleEvents } from './calendarCycles';

describe('buildMonthlyCycleEvents', () => {
  // birthDate 1990-05-15, June 2026.
  // PY = reduce(5 + 15 + 2026) = reduce(2046) = 2+0+4+6=12 -> 3
  // PM = reduce(PY 3 + month 6) = 9
  // PD(day d) = reduce(9 + d)
  it('produces one entry per day of the month', () => {
    const events = buildMonthlyCycleEvents('1990-05-15', 2026, 6);
    expect(events).toHaveLength(30); // June has 30 days
  });

  it('computes Personal Day numbers in 1-9 with correct dates', () => {
    const events = buildMonthlyCycleEvents('1990-05-15', 2026, 6);
    expect(events[0].date).toBe('2026-06-01');
    expect(events[0].dayNumber).toBe(1);   // reduce(9+1)=10->1
    expect(events[8].dayNumber).toBe(9);   // reduce(9+9)=18->9
    events.forEach((e) => {
      expect(e.dayNumber).toBeGreaterThanOrEqual(1);
      expect(e.dayNumber).toBeLessThanOrEqual(9);
    });
  });

  it('attaches title and description from numberMeanings', () => {
    const events = buildMonthlyCycleEvents('1990-05-15', 2026, 6);
    expect(events[0].title).toBe('The Leader'); // dayNumber 1
    expect(events[0].description.length).toBeGreaterThan(0);
  });

  it('zero-pads months and days', () => {
    const events = buildMonthlyCycleEvents('1990-05-15', 2026, 1);
    expect(events[0].date).toBe('2026-01-01');
    expect(events).toHaveLength(31);
  });
});
