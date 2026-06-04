import type { calendar_v3 } from 'googleapis';

export const EVENT_SOURCE = 'cosmic-blueprint';

export interface CycleDay {
  date: string;        // YYYY-MM-DD
  dayNumber: number;   // 1-9
  title: string;
  description: string;
}

/** Add one day to a YYYY-MM-DD string (UTC), returning YYYY-MM-DD. */
function nextDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Map one numerology day to a Google all-day event resource. */
export function buildGoogleEvent(day: CycleDay, syncMonth: string): calendar_v3.Schema$Event {
  return {
    summary: `✨ Personal Day ${day.dayNumber} — ${day.title}`,
    description: day.description,
    start: { date: day.date },
    end: { date: nextDate(day.date) }, // all-day end is exclusive
    transparency: 'transparent',
    extendedProperties: {
      private: { source: EVENT_SOURCE, syncMonth },
    },
  };
}
