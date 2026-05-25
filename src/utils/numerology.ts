/**
 * Chaldean Numerology Calculation Engine
 *
 * Implements the ancient Chaldean system where letters are assigned
 * values 1-8 (no 9 in the base mapping). Supports master numbers
 * 11, 22, 33, 44, 55, 66, 77, 88, 99.
 */

import { hiddenPassionCareers } from './numerologyMeanings';
import type { PinnacleData, ChallengeData } from '../hooks/useReportStore';

/** Chaldean letter-to-number mapping (1-8 system, per user's chart)
 *  1: A, I, J, Q, Y
 *  2: B, K, R
 *  3: C, G, L, S
 *  4: D, M, T
 *  5: E, H, N, X
 *  6: U, V, W
 *  7: O, Z
 *  8: F, P
 */
const chaldeanValues: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
  N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7
};

const MASTER_NUMBERS = new Set([11, 22, 33, 44, 55, 66, 77, 88, 99]);

/** Check if a number is a master number */
export const isMasterNumber = (num: number): boolean => MASTER_NUMBERS.has(num);

/** Reduce to single digit while preserving master numbers.
 *  Also captures the compound (double-digit) number before final reduction
 *  — in Chaldean numerology this reveals inner/hidden influences. */
const reduceWithMasterNumbers = (num: number): { final: number; compound: number | null; steps: string[] } => {
  const steps: string[] = [];

  // Reduce three-digit+ numbers down to two digits first
  while (num > 99) {
    const digits = num.toString().split('');
    const sum = digits.reduce((acc, d) => acc + parseInt(d), 0);
    steps.push(`${num} → ${digits.join(' + ')} = ${sum}`);
    num = sum;
  }

  // Capture the compound (double-digit) number before final reduction
  const compound = num > 9 ? num : null;

  if (MASTER_NUMBERS.has(num)) {
    steps.push(`${num} is a Master Number — preserved`);
    return { final: num, compound, steps };
  }

  while (num > 9) {
    const digits = num.toString().split('');
    const sum = digits.reduce((acc, d) => acc + parseInt(d), 0);
    steps.push(`${num} → ${digits.join(' + ')} = ${sum}`);
    num = sum;

    if (MASTER_NUMBERS.has(num)) {
      steps.push(`${num} is a Master Number — preserved`);
      return { final: num, compound, steps };
    }
  }

  return { final: num, compound, steps };
};

/** Standard reduction to single digit (no master number preservation) */
const reduceToSingleDigit = (num: number): { final: number; steps: string[] } => {
  const steps: string[] = [];
  while (num > 9) {
    const digits = num.toString().split('');
    const sum = digits.reduce((acc, d) => acc + parseInt(d), 0);
    steps.push(`${num} → ${digits.join(' + ')} = ${sum}`);
    num = sum;
  }
  return { final: num, steps };
};

/** Calculate the Chaldean value sum of a name string with breakdown */
const calculateNameValue = (name: string): { sum: number; breakdown: string[] } => {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  const breakdown: string[] = [];

  for (const char of cleanName) {
    if (chaldeanValues[char]) {
      sum += chaldeanValues[char];
      breakdown.push(`${char} = ${chaldeanValues[char]}`);
    }
  }

  return { sum, breakdown };
};

/** Parse a date string (YYYY-MM-DD) into components */
const parseDateString = (dateStr: string): { year: number; month: number; day: number } => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
};

// ===== CORE NUMBER CALCULATIONS =====

/** Life Path Number: month + day + full year → reduce */
export const calculateLifePathNumber = (birthDate: string): { number: number; compound: number | null; breakdown: string[] } => {
  const { year, month, day } = parseDateString(birthDate);
  const totalSum = month + day + year;
  const breakdown = [`Month: ${month}`, `Day: ${day}`, `Year: ${year}`, `Total: ${month} + ${day} + ${year} = ${totalSum}`];
  const reduction = reduceWithMasterNumbers(totalSum);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, compound: reduction.compound, breakdown };
};

/** Expression Number: sum of all letter values in full name */
export const calculateExpressionNumber = (fullName: string): { number: number; compound: number | null; breakdown: string[] } => {
  const nameCalc = calculateNameValue(fullName);
  const breakdown = [`Letters: ${nameCalc.breakdown.join(', ')}`, `Sum: ${nameCalc.sum}`];
  const reduction = reduceWithMasterNumbers(nameCalc.sum);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, compound: reduction.compound, breakdown };
};

/** Soul Urge (Heart's Desire) Number: sum of vowel values only */
export const calculateSoulUrgeNumber = (fullName: string): { number: number; compound: number | null; breakdown: string[] } => {
  const vowels = fullName.toUpperCase().replace(/[^AEIOU]/g, '');
  const nameCalc = calculateNameValue(vowels);
  const breakdown = [`Vowels: ${vowels}`, `Values: ${nameCalc.breakdown.join(', ')}`, `Sum: ${nameCalc.sum}`];
  const reduction = reduceWithMasterNumbers(nameCalc.sum);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, compound: reduction.compound, breakdown };
};

/** Personality Number: sum of consonant values only */
export const calculatePersonalityNumber = (fullName: string): { number: number; compound: number | null; breakdown: string[] } => {
  const consonants = fullName.toUpperCase().replace(/[AEIOU\s]/g, '');
  const nameCalc = calculateNameValue(consonants);
  const breakdown = [`Consonants: ${consonants}`, `Values: ${nameCalc.breakdown.join(', ')}`, `Sum: ${nameCalc.sum}`];
  const reduction = reduceWithMasterNumbers(nameCalc.sum);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, compound: reduction.compound, breakdown };
};

/** Birthday Number: the day of birth reduced */
export const calculateBirthdayNumber = (birthDate: string): { number: number; compound: number | null; breakdown: string[] } => {
  const { day } = parseDateString(birthDate);
  const breakdown = [`Birth Day: ${day}`];
  const reduction = reduceWithMasterNumbers(day);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, compound: reduction.compound, breakdown };
};

/** Maturity Number: Life Path + Expression → reduce */
export const calculateMaturityNumber = (lifePathNumber: number, expressionNumber: number): { number: number; compound: number | null; breakdown: string[] } => {
  const sum = lifePathNumber + expressionNumber;
  const breakdown = [`Life Path (${lifePathNumber}) + Expression (${expressionNumber}) = ${sum}`];
  const reduction = reduceWithMasterNumbers(sum);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, compound: reduction.compound, breakdown };
};

/** Achievement Number: month + day → reduce */
export const calculateAchievementNumber = (birthDate: string): { number: number; compound: number | null; breakdown: string[] } => {
  const { month, day } = parseDateString(birthDate);
  const sum = month + day;
  const breakdown = [`Month (${month}) + Day (${day}) = ${sum}`];
  const reduction = reduceWithMasterNumbers(sum);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, compound: reduction.compound, breakdown };
};

/** Hidden Passion Number: most frequently occurring Chaldean value in the name */
export const calculateHiddenPassionNumber = (fullName: string): { numbers: number[]; breakdown: string[]; careers: string[] } => {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  const frequency: Record<number, number> = {};
  const letterBreakdown: string[] = [];

  for (const char of cleanName) {
    if (chaldeanValues[char]) {
      const value = chaldeanValues[char];
      frequency[value] = (frequency[value] || 0) + 1;
      letterBreakdown.push(`${char} = ${value}`);
    }
  }

  const maxFrequency = Math.max(...Object.values(frequency));
  const hiddenPassionNumbers = Object.keys(frequency)
    .filter(num => frequency[parseInt(num)] === maxFrequency)
    .map(num => parseInt(num));

  const allCareers: string[] = [];
  hiddenPassionNumbers.forEach(num => {
    if (hiddenPassionCareers[num]) {
      allCareers.push(...hiddenPassionCareers[num]);
    }
  });

  const breakdown = [
    `Letters: ${letterBreakdown.join(', ')}`,
    `Frequency: ${Object.entries(frequency).map(([num, count]) => `${num} appears ${count}×`).join(', ')}`,
    `Most frequent: ${hiddenPassionNumbers.join(', ')} (${maxFrequency}×)`
  ];

  return { numbers: hiddenPassionNumbers, breakdown, careers: allCareers };
};

/** Karmic Lesson Numbers: which Chaldean values 1-8 are missing from the name */
export const calculateKarmicLessonNumbers = (fullName: string): { numbers: number[]; breakdown: string[] } => {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  const presentNumbers = new Set<number>();
  const letterBreakdown: string[] = [];

  for (const char of cleanName) {
    if (chaldeanValues[char]) {
      presentNumbers.add(chaldeanValues[char]);
      letterBreakdown.push(`${char} = ${chaldeanValues[char]}`);
    }
  }

  const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8].filter(n => !presentNumbers.has(n));

  const breakdown = [
    `Letters: ${letterBreakdown.join(', ')}`,
    `Present: ${Array.from(presentNumbers).sort().join(', ')}`,
    `Missing (Karmic Lessons): ${missingNumbers.length > 0 ? missingNumbers.join(', ') : 'None — all numbers present'}`
  ];

  return { numbers: missingNumbers, breakdown };
};

// ===== NEW CALCULATIONS =====

/** Personal Year Number: birth month + birth day + current year → reduce */
export const calculatePersonalYearNumber = (birthDate: string): { number: number; breakdown: string[] } => {
  const { month, day } = parseDateString(birthDate);
  const currentYear = new Date().getFullYear();
  const sum = month + day + currentYear;
  const breakdown = [
    `Birth Month (${month}) + Birth Day (${day}) + Current Year (${currentYear})`,
    `${month} + ${day} + ${currentYear} = ${sum}`
  ];
  const reduction = reduceToSingleDigit(sum);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, breakdown };
};

/** Personal Month Number: personal year + current month → reduce */
export const calculatePersonalMonthNumber = (personalYear: number): { number: number; breakdown: string[] } => {
  const currentMonth = new Date().getMonth() + 1;
  const sum = personalYear + currentMonth;
  const breakdown = [
    `Personal Year (${personalYear}) + Current Month (${currentMonth})`,
    `${personalYear} + ${currentMonth} = ${sum}`
  ];
  const reduction = reduceToSingleDigit(sum);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, breakdown };
};

/** Personal Day Number: personal month + current day → reduce */
export const calculatePersonalDayNumber = (personalMonth: number): { number: number; breakdown: string[] } => {
  const currentDay = new Date().getDate();
  const sum = personalMonth + currentDay;
  const breakdown = [
    `Personal Month (${personalMonth}) + Today (${currentDay})`,
    `${personalMonth} + ${currentDay} = ${sum}`
  ];
  const reduction = reduceToSingleDigit(sum);
  breakdown.push(...reduction.steps);
  return { number: reduction.final, breakdown };
};

/**
 * Pinnacle Numbers: 4 life periods calculated from the birth date.
 * - 1st Pinnacle: month + day, ages 0 to (36 - Life Path)
 * - 2nd Pinnacle: day + year(reduced), next 9 years
 * - 3rd Pinnacle: 1st + 2nd pinnacle numbers, next 9 years
 * - 4th Pinnacle: month + year(reduced), remainder of life
 */
export const calculatePinnacleNumbers = (birthDate: string, lifePathNumber: number): PinnacleData[] => {
  const { year, month, day } = parseDateString(birthDate);

  const monthReduced = reduceToSingleDigit(month).final;
  const dayReduced = reduceToSingleDigit(day).final;
  const yearReduced = reduceToSingleDigit(year).final;
  const lpReduced = lifePathNumber > 9 ? reduceToSingleDigit(lifePathNumber).final : lifePathNumber;

  const firstEnd = 36 - lpReduced;

  const p1Sum = monthReduced + dayReduced;
  const p1 = reduceWithMasterNumbers(p1Sum);

  const p2Sum = dayReduced + yearReduced;
  const p2 = reduceWithMasterNumbers(p2Sum);

  const p3Sum = p1.final + p2.final;
  const p3 = reduceWithMasterNumbers(p3Sum);

  const p4Sum = monthReduced + yearReduced;
  const p4 = reduceWithMasterNumbers(p4Sum);

  return [
    {
      number: p1.final,
      period: `Birth to Age ${firstEnd}`,
      startAge: 0,
      endAge: firstEnd,
      breakdown: [`Month (${monthReduced}) + Day (${dayReduced}) = ${p1Sum}`, ...p1.steps],
    },
    {
      number: p2.final,
      period: `Age ${firstEnd + 1} to ${firstEnd + 9}`,
      startAge: firstEnd + 1,
      endAge: firstEnd + 9,
      breakdown: [`Day (${dayReduced}) + Year (${yearReduced}) = ${p2Sum}`, ...p2.steps],
    },
    {
      number: p3.final,
      period: `Age ${firstEnd + 10} to ${firstEnd + 18}`,
      startAge: firstEnd + 10,
      endAge: firstEnd + 18,
      breakdown: [`1st Pinnacle (${p1.final}) + 2nd Pinnacle (${p2.final}) = ${p3Sum}`, ...p3.steps],
    },
    {
      number: p4.final,
      period: `Age ${firstEnd + 19} onward`,
      startAge: firstEnd + 19,
      endAge: null,
      breakdown: [`Month (${monthReduced}) + Year (${yearReduced}) = ${p4Sum}`, ...p4.steps],
    },
  ];
};

/**
 * Challenge Numbers: 4 challenges from the birth date (differences).
 * - 1st Challenge: |month(reduced) - day(reduced)|
 * - 2nd Challenge: |day(reduced) - year(reduced)|
 * - 3rd Challenge: |1st - 2nd|
 * - 4th Challenge: |month(reduced) - year(reduced)|
 */
export const calculateChallengeNumbers = (birthDate: string): ChallengeData[] => {
  const { year, month, day } = parseDateString(birthDate);

  const monthReduced = reduceToSingleDigit(month).final;
  const dayReduced = reduceToSingleDigit(day).final;
  const yearReduced = reduceToSingleDigit(year).final;

  const c1 = Math.abs(monthReduced - dayReduced);
  const c2 = Math.abs(dayReduced - yearReduced);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(monthReduced - yearReduced);

  return [
    {
      number: c1,
      period: "First Challenge (Youth)",
      breakdown: [`|Month (${monthReduced}) − Day (${dayReduced})| = ${c1}`],
    },
    {
      number: c2,
      period: "Second Challenge (Middle Age)",
      breakdown: [`|Day (${dayReduced}) − Year (${yearReduced})| = ${c2}`],
    },
    {
      number: c3,
      period: "Third Challenge (Main/Life Challenge)",
      breakdown: [`|1st (${c1}) − 2nd (${c2})| = ${c3}`],
    },
    {
      number: c4,
      period: "Fourth Challenge (Later Life)",
      breakdown: [`|Month (${monthReduced}) − Year (${yearReduced})| = ${c4}`],
    },
  ];
};

// ===== MASTER REPORT GENERATOR =====

/** Generate the complete numerology report from name and birth date */
export const generateNumerologyReport = (name: string, email: string, birthDate: string) => {
  const lifePathCalc = calculateLifePathNumber(birthDate);
  const expressionCalc = calculateExpressionNumber(name);
  const soulUrgeCalc = calculateSoulUrgeNumber(name);
  const personalityCalc = calculatePersonalityNumber(name);
  const birthdayCalc = calculateBirthdayNumber(birthDate);
  const maturityCalc = calculateMaturityNumber(lifePathCalc.number, expressionCalc.number);
  const achievementCalc = calculateAchievementNumber(birthDate);
  const hiddenPassionCalc = calculateHiddenPassionNumber(name);
  const karmicLessonCalc = calculateKarmicLessonNumbers(name);
  const personalYearCalc = calculatePersonalYearNumber(birthDate);
  const personalMonthCalc = calculatePersonalMonthNumber(personalYearCalc.number);
  const personalDayCalc = calculatePersonalDayNumber(personalMonthCalc.number);
  const pinnacles = calculatePinnacleNumbers(birthDate, lifePathCalc.number);
  const challenges = calculateChallengeNumbers(birthDate);

  return {
    name,
    email,
    birthDate,
    lifePathNumber: lifePathCalc.number,
    lifePathCompound: lifePathCalc.compound,
    lifePathBreakdown: lifePathCalc.breakdown,
    expressionNumber: expressionCalc.number,
    expressionCompound: expressionCalc.compound,
    expressionBreakdown: expressionCalc.breakdown,
    soulUrgeNumber: soulUrgeCalc.number,
    soulUrgeCompound: soulUrgeCalc.compound,
    soulUrgeBreakdown: soulUrgeCalc.breakdown,
    personalityNumber: personalityCalc.number,
    personalityCompound: personalityCalc.compound,
    personalityBreakdown: personalityCalc.breakdown,
    birthdayNumber: birthdayCalc.number,
    birthdayCompound: birthdayCalc.compound,
    birthdayBreakdown: birthdayCalc.breakdown,
    maturityNumber: maturityCalc.number,
    maturityCompound: maturityCalc.compound,
    maturityBreakdown: maturityCalc.breakdown,
    achievementNumber: achievementCalc.number,
    achievementCompound: achievementCalc.compound,
    achievementBreakdown: achievementCalc.breakdown,
    hiddenPassionNumbers: hiddenPassionCalc.numbers,
    hiddenPassionBreakdown: hiddenPassionCalc.breakdown,
    hiddenPassionCareers: hiddenPassionCalc.careers,
    karmicLessonNumbers: karmicLessonCalc.numbers,
    karmicLessonBreakdown: karmicLessonCalc.breakdown,
    personalYearNumber: personalYearCalc.number,
    personalYearBreakdown: personalYearCalc.breakdown,
    personalMonthNumber: personalMonthCalc.number,
    personalMonthBreakdown: personalMonthCalc.breakdown,
    personalDayNumber: personalDayCalc.number,
    personalDayBreakdown: personalDayCalc.breakdown,
    pinnacleNumbers: pinnacles,
    challengeNumbers: challenges,
  };
};
