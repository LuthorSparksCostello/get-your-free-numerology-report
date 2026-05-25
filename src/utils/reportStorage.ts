import type { ReportData } from '@/hooks/useReportStore';

export interface SavedReport {
  id: string;
  name: string;
  birthDate: string;
  lifePathNumber: number;
  expressionNumber: number;
  soulUrgeNumber: number;
  personalYearNumber: number;
  savedAt: string;
  reportData: ReportData;
}

const STORAGE_PREFIX = 'numerology_reports_';

/** Generate a simple unique ID */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/** Get localStorage key for a user */
const getKey = (userId: string): string => `${STORAGE_PREFIX}${userId}`;

/** Save a report for a user */
export const saveReport = (userId: string, report: ReportData): SavedReport => {
  const saved: SavedReport = {
    id: generateId(),
    name: report.name,
    birthDate: report.birthDate,
    lifePathNumber: report.lifePathNumber,
    expressionNumber: report.expressionNumber,
    soulUrgeNumber: report.soulUrgeNumber,
    personalYearNumber: report.personalYearNumber,
    savedAt: new Date().toISOString(),
    reportData: report,
  };

  const existing = getReports(userId);

  // Prevent duplicates (same name + birthdate)
  const duplicate = existing.findIndex(
    (r) => r.name === saved.name && r.birthDate === saved.birthDate
  );
  if (duplicate !== -1) {
    existing[duplicate] = saved;
  } else {
    existing.unshift(saved);
  }

  // Keep max 20 reports
  const trimmed = existing.slice(0, 20);

  try {
    localStorage.setItem(getKey(userId), JSON.stringify(trimmed));
  } catch {
    // Storage full — remove oldest
    trimmed.pop();
    localStorage.setItem(getKey(userId), JSON.stringify(trimmed));
  }

  return saved;
};

/** Get all saved reports for a user */
export const getReports = (userId: string): SavedReport[] => {
  try {
    const data = localStorage.getItem(getKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/** Delete a saved report */
export const deleteReport = (userId: string, reportId: string): void => {
  const reports = getReports(userId).filter((r) => r.id !== reportId);
  localStorage.setItem(getKey(userId), JSON.stringify(reports));
};

/** Get a single saved report by ID */
export const getReportById = (userId: string, reportId: string): SavedReport | undefined => {
  return getReports(userId).find((r) => r.id === reportId);
};
