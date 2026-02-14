import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PLANS, PlanType } from './stripe';

interface UsageState {
  plan: PlanType;
  sessionsToday: number;
  messagesThisSession: number;
  messagesThisMonth: number;
  lastSessionDate: string;
  lastMonthReset: string;
  subscriptionId: string | null;
  strikes: number;
  lastStrikeReason: string | null;

  // Actions
  setPlan: (plan: PlanType) => void;
  setSubscriptionId: (id: string | null) => void;
  startSession: () => boolean;
  addMessage: () => boolean;
  addStrike: (reason: string) => void;
  resetSession: () => void;
  canStartSession: () => boolean;
  canSendMessage: () => boolean;
  getRemainingMessages: () => number;
  getRemainingMonthlyMessages: () => number;
  getRemainingSessions: () => number;
  isThrottled: () => boolean;
}

const getTodayString = () => new Date().toISOString().split('T')[0];
const getMonthString = () => new Date().toISOString().slice(0, 7); // YYYY-MM

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      plan: 'free',
      sessionsToday: 0,
      messagesThisSession: 0,
      messagesThisMonth: 0,
      lastSessionDate: getTodayString(),
      lastMonthReset: getMonthString(),
      subscriptionId: null,
      strikes: 0,
      lastStrikeReason: null,

      setPlan: (plan) => set({ plan }),

      setSubscriptionId: (id) => set({ subscriptionId: id }),

      startSession: () => {
        const state = get();
        const today = getTodayString();
        const currentMonth = getMonthString();

        // Reset daily count if new day
        if (state.lastSessionDate !== today) {
          set({ sessionsToday: 0, lastSessionDate: today });
        }

        // Reset monthly count if new month
        if (state.lastMonthReset !== currentMonth) {
          set({ messagesThisMonth: 0, lastMonthReset: currentMonth, strikes: 0 });
        }

        // Check if throttled (3+ strikes)
        if (state.strikes >= 3) {
          return false;
        }

        const limits = PLANS[state.plan];
        const sessionsToday = state.lastSessionDate !== today ? 0 : state.sessionsToday;
        if (sessionsToday >= limits.sessionsPerDay) {
          return false;
        }

        // Check monthly limit
        if (state.messagesThisMonth >= limits.monthlyMessages) {
          return false;
        }

        set((s) => ({
          sessionsToday: s.sessionsToday + 1,
          messagesThisSession: 0,
        }));
        return true;
      },

      addMessage: () => {
        const state = get();
        const limits = PLANS[state.plan];
        const currentMonth = getMonthString();

        // Reset monthly count if new month
        if (state.lastMonthReset !== currentMonth) {
          set({ messagesThisMonth: 0, lastMonthReset: currentMonth, strikes: 0 });
        }

        // Check if throttled
        if (state.strikes >= 3) {
          return false;
        }

        // Check session limit
        if (state.messagesThisSession >= limits.messagesPerSession) {
          return false;
        }

        // Check monthly limit
        if (state.messagesThisMonth >= limits.monthlyMessages) {
          return false;
        }

        set((s) => ({
          messagesThisSession: s.messagesThisSession + 1,
          messagesThisMonth: s.messagesThisMonth + 1,
        }));
        return true;
      },

      addStrike: (reason: string) => {
        set((s) => ({
          strikes: s.strikes + 1,
          lastStrikeReason: reason,
        }));
      },

      resetSession: () => set({ messagesThisSession: 0 }),

      canStartSession: () => {
        const state = get();
        const today = getTodayString();
        const currentMonth = getMonthString();

        // Check throttle
        if (state.strikes >= 3) return false;

        const sessionsToday = state.lastSessionDate !== today ? 0 : state.sessionsToday;
        const limits = PLANS[state.plan];

        // Check daily sessions
        if (sessionsToday >= limits.sessionsPerDay) return false;

        // Check monthly messages
        const messagesThisMonth = state.lastMonthReset !== currentMonth ? 0 : state.messagesThisMonth;
        if (messagesThisMonth >= limits.monthlyMessages) return false;

        return true;
      },

      canSendMessage: () => {
        const state = get();
        const limits = PLANS[state.plan];
        const currentMonth = getMonthString();

        // Check throttle
        if (state.strikes >= 3) return false;

        // Check session limit
        if (state.messagesThisSession >= limits.messagesPerSession) return false;

        // Check monthly limit
        const messagesThisMonth = state.lastMonthReset !== currentMonth ? 0 : state.messagesThisMonth;
        if (messagesThisMonth >= limits.monthlyMessages) return false;

        return true;
      },

      getRemainingMessages: () => {
        const state = get();
        const limits = PLANS[state.plan];
        return Math.max(0, limits.messagesPerSession - state.messagesThisSession);
      },

      getRemainingMonthlyMessages: () => {
        const state = get();
        const limits = PLANS[state.plan];
        const currentMonth = getMonthString();
        const messagesThisMonth = state.lastMonthReset !== currentMonth ? 0 : state.messagesThisMonth;
        return Math.max(0, limits.monthlyMessages - messagesThisMonth);
      },

      getRemainingSessions: () => {
        const state = get();
        const today = getTodayString();
        const sessionsToday = state.lastSessionDate !== today ? 0 : state.sessionsToday;
        const limits = PLANS[state.plan];
        return Math.max(0, limits.sessionsPerDay - sessionsToday);
      },

      isThrottled: () => {
        return get().strikes >= 3;
      },
    }),
    { name: 'c2c-usage' }
  )
);
