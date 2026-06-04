import { reduceToSingleDigit } from './numerology';
import { numberMeanings } from './numerologyMeanings';

export interface CycleDay {
  date: string;        // YYYY-MM-DD
  dayNumber: number;   // 1-9
  title: string;
  description: string;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Build the per-day Personal Day payload for one calendar month.
 *
 * Personal Year  = reduce(birthMonth + birthDay + year)
 * Personal Month = reduce(personalYear + month)
 * Personal Day   = reduce(personalMonth + dayOfMonth)
 *
 * These formulas mirror src/utils/numerology.ts but take the year/month
 * explicitly (the calculate* helpers there read `new Date()` internally and
 * only ever yield "today").
 */
export function buildMonthlyCycleEvents(
  birthDate: string, // YYYY-MM-DD
  year: number,
  month: number // 1-12
): CycleDay[] {
  const [, bMonthStr, bDayStr] = birthDate.split('-');
  const bMonth = Number(bMonthStr);
  const bDay = Number(bDayStr);

  const personalYear = reduceToSingleDigit(bMonth + bDay + year).final;
  const personalMonth = reduceToSingleDigit(personalYear + month).final;

  const daysInMonth = new Date(year, month, 0).getDate();
  const events: CycleDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayNumber = reduceToSingleDigit(personalMonth + d).final;
    const meaning = numberMeanings[dayNumber];
    events.push({
      date: `${year}-${pad(month)}-${pad(d)}`,
      dayNumber,
      title: meaning?.title ?? `Number ${dayNumber}`,
      description: meaning?.description ?? '',
    });
  }
  return events;
}
