import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PLANS, PlanType } from './stripe';

interface UsageState {
  plan: PlanType;
  sessionsToday: number;
  messagesThisSession: number;
  lastSessionDate: string;
  subscriptionId: string | null;

  // Actions
  setPlan: (plan: PlanType) => void;
  setSubscriptionId: (id: string | null) => void;
  startSession: () => boolean; // returns false if limit reached
  addMessage: () => boolean; // returns false if limit reached
  resetSession: () => void;
  canStartSession: () => boolean;
  canSendMessage: () => boolean;
  getRemainingMessages: () => number;
  getRemainingSessions: () => number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      plan: 'free',
      sessionsToday: 0,
      messagesThisSession: 0,
      lastSessionDate: getTodayString(),
      subscriptionId: null,

      setPlan: (plan) => set({ plan }),

      setSubscriptionId: (id) => set({ subscriptionId: id }),

      startSession: () => {
        const state = get();
        const today = getTodayString();

        // Reset daily count if new day
        if (state.lastSessionDate !== today) {
          set({ sessionsToday: 0, lastSessionDate: today });
        }

        const limits = PLANS[state.plan];
        if (state.sessionsToday >= limits.sessionsPerDay) {
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

        if (state.messagesThisSession >= limits.messagesPerSession) {
          return false;
        }

        set((s) => ({
          messagesThisSession: s.messagesThisSession + 1,
        }));
        return true;
      },

      resetSession: () => set({ messagesThisSession: 0 }),

      canStartSession: () => {
        const state = get();
        const today = getTodayString();
        const sessionsToday = state.lastSessionDate !== today ? 0 : state.sessionsToday;
        const limits = PLANS[state.plan];
        return sessionsToday < limits.sessionsPerDay;
      },

      canSendMessage: () => {
        const state = get();
        const limits = PLANS[state.plan];
        return state.messagesThisSession < limits.messagesPerSession;
      },

      getRemainingMessages: () => {
        const state = get();
        const limits = PLANS[state.plan];
        if (limits.messagesPerSession === Infinity) return Infinity;
        return Math.max(0, limits.messagesPerSession - state.messagesThisSession);
      },

      getRemainingSessions: () => {
        const state = get();
        const today = getTodayString();
        const sessionsToday = state.lastSessionDate !== today ? 0 : state.sessionsToday;
        const limits = PLANS[state.plan];
        if (limits.sessionsPerDay === Infinity) return Infinity;
        return Math.max(0, limits.sessionsPerDay - sessionsToday);
      },
    }),
    { name: 'c2c-usage' }
  )
);
