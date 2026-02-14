import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Filters,
  TimeSlot,
  DayOfWeek,
  Demographic,
  Category,
  Session,
  SessionStats,
  Location,
  Persona,
  ChatMessage,
  PracticeSession,
} from './types';
import { getCurrentTimeSlot, getCurrentDayOfWeek } from './scoring';

// ============ FILTER STORE ============

interface FilterState {
  filters: Filters;
  setTimeSlot: (slot: TimeSlot) => void;
  setDayOfWeek: (day: DayOfWeek) => void;
  toggleDemographic: (demo: Demographic) => void;
  toggleCategory: (category: Category) => void;
  setRadius: (radius: number) => void;
  setMinScore: (score: number) => void;
  resetFilters: () => void;
}

const defaultFilters: Filters = {
  radius: 5,
  timeSlot: getCurrentTimeSlot(),
  dayOfWeek: getCurrentDayOfWeek(),
  demographics: [],
  categories: [],
  minScore: 0,
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: defaultFilters,
  setTimeSlot: (slot) => set((state) => ({ filters: { ...state.filters, timeSlot: slot } })),
  setDayOfWeek: (day) => set((state) => ({ filters: { ...state.filters, dayOfWeek: day } })),
  toggleDemographic: (demo) =>
    set((state) => ({
      filters: {
        ...state.filters,
        demographics: state.filters.demographics.includes(demo)
          ? state.filters.demographics.filter((d) => d !== demo)
          : [...state.filters.demographics, demo],
      },
    })),
  toggleCategory: (category) =>
    set((state) => ({
      filters: {
        ...state.filters,
        categories: state.filters.categories.includes(category)
          ? state.filters.categories.filter((c) => c !== category)
          : [...state.filters.categories, category],
      },
    })),
  setRadius: (radius) => set((state) => ({ filters: { ...state.filters, radius } })),
  setMinScore: (score) => set((state) => ({ filters: { ...state.filters, minScore: score } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));

// ============ SESSION STORE ============

interface SessionState {
  sessions: Session[];
  stats: SessionStats;
  addSession: (session: Omit<Session, 'id' | 'createdAt'>) => void;
  clearSessions: () => void;
  getRecentSessions: (count: number) => Session[];
}

const calculateStats = (sessions: Session[]): SessionStats => {
  const total = sessions.length;
  const success = sessions.filter((s) => s.outcome === 'success').length;
  const neutral = sessions.filter((s) => s.outcome === 'neutral').length;
  const reject = sessions.filter((s) => s.outcome === 'reject').length;
  const successRate = total > 0 ? (success / total) * 100 : 0;
  return { total, success, neutral, reject, successRate };
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      stats: { total: 0, success: 0, neutral: 0, reject: 0, successRate: 0 },
      addSession: (session) =>
        set((state) => {
          const newSession: Session = {
            ...session,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          };
          const sessions = [newSession, ...state.sessions];
          return { sessions, stats: calculateStats(sessions) };
        }),
      clearSessions: () =>
        set({ sessions: [], stats: { total: 0, success: 0, neutral: 0, reject: 0, successRate: 0 } }),
      getRecentSessions: (count) => get().sessions.slice(0, count),
    }),
    { name: 'c2c-sessions' }
  )
);

// ============ PRACTICE STORE ============

interface PracticeState {
  currentPractice: PracticeSession | null;
  practiceHistory: PracticeSession[];
  startPractice: (location: Location, persona: Persona) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  endPractice: (outcome: Session['outcome']) => void;
  clearCurrentPractice: () => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      currentPractice: null,
      practiceHistory: [],
      startPractice: (location, persona) =>
        set({
          currentPractice: {
            id: crypto.randomUUID(),
            location,
            persona,
            messages: [],
            startedAt: new Date(),
          },
        }),
      addMessage: (message) =>
        set((state) => {
          if (!state.currentPractice) return state;
          const newMessage: ChatMessage = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          };
          return {
            currentPractice: {
              ...state.currentPractice,
              messages: [...state.currentPractice.messages, newMessage],
            },
          };
        }),
      endPractice: (outcome) =>
        set((state) => {
          if (!state.currentPractice) return state;
          const completedPractice: PracticeSession = {
            ...state.currentPractice,
            outcome,
            endedAt: new Date(),
          };
          return {
            currentPractice: null,
            practiceHistory: [completedPractice, ...state.practiceHistory].slice(0, 50),
          };
        }),
      clearCurrentPractice: () => set({ currentPractice: null }),
    }),
    { name: 'c2c-practice' }
  )
);

// ============ UI STORE ============

interface UIState {
  selectedLocation: Location | null;
  isPracticeModalOpen: boolean;
  isRankingsOpen: boolean;
  activePanel: 'filters' | 'rankings' | 'tracker' | 'map' | null;
  setSelectedLocation: (location: Location | null) => void;
  openPracticeModal: () => void;
  closePracticeModal: () => void;
  toggleRankings: () => void;
  setActivePanel: (panel: UIState['activePanel']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedLocation: null,
  isPracticeModalOpen: false,
  isRankingsOpen: true,
  activePanel: null,
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  openPracticeModal: () => set({ isPracticeModalOpen: true }),
  closePracticeModal: () => set({ isPracticeModalOpen: false }),
  toggleRankings: () => set((state) => ({ isRankingsOpen: !state.isRankingsOpen })),
  setActivePanel: (panel) => set({ activePanel: panel }),
}));
