import { createContext, useContext, useReducer, ReactNode } from 'react';

export interface FormData {
  fullName: string;
  birthDate: string;
  email: string;
}

export interface ReportData {
  name: string;
  email: string;
  birthDate: string;
  lifePathNumber: number;
  lifePathBreakdown: string[];
  expressionNumber: number;
  expressionBreakdown: string[];
  soulUrgeNumber: number;
  soulUrgeBreakdown: string[];
  personalityNumber: number;
  personalityBreakdown: string[];
  birthdayNumber: number;
  birthdayBreakdown: string[];
  maturityNumber: number;
  maturityBreakdown: string[];
  achievementNumber: number;
  achievementBreakdown: string[];
  hiddenPassionNumbers: number[];
  hiddenPassionBreakdown: string[];
  hiddenPassionCareers: string[];
  karmicLessonNumbers: number[];
  karmicLessonBreakdown: string[];
  personalYearNumber: number;
  personalYearBreakdown: string[];
  personalMonthNumber: number;
  personalMonthBreakdown: string[];
  personalDayNumber: number;
  personalDayBreakdown: string[];
  pinnacleNumbers: PinnacleData[];
  challengeNumbers: ChallengeData[];
}

export interface PinnacleData {
  number: number;
  period: string;
  startAge: number;
  endAge: number | null;
  breakdown: string[];
}

export interface ChallengeData {
  number: number;
  period: string;
  breakdown: string[];
}

interface StoreState {
  formData: FormData;
  reportData: ReportData | null;
  currentStep: number;
  isLoading: boolean;
  emailCaptured: boolean;
  expandedSections: Set<string>;
}

type StoreAction =
  | { type: 'SET_FORM_DATA'; payload: FormData }
  | { type: 'SET_REPORT_DATA'; payload: ReportData }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_EMAIL_CAPTURED'; payload: boolean }
  | { type: 'TOGGLE_SECTION'; payload: string }
  | { type: 'RESET' };

const initialState: StoreState = {
  formData: { fullName: '', birthDate: '', email: '' },
  reportData: null,
  currentStep: 0,
  isLoading: false,
  emailCaptured: false,
  expandedSections: new Set<string>(),
};

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'SET_REPORT_DATA':
      return { ...state, reportData: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_EMAIL_CAPTURED':
      return { ...state, emailCaptured: action.payload };
    case 'TOGGLE_SECTION': {
      const newSections = new Set(state.expandedSections);
      if (newSections.has(action.payload)) {
        newSections.delete(action.payload);
      } else {
        newSections.add(action.payload);
      }
      return { ...state, expandedSections: newSections };
    }
    case 'RESET':
      return { ...initialState, expandedSections: new Set<string>() };
    default:
      return state;
  }
}

interface StoreContextType {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function ReportStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, {
    ...initialState,
    expandedSections: new Set<string>(),
  });

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useReportStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useReportStore must be used within a ReportStoreProvider');
  }
  return context;
}
