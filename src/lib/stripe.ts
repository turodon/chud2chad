import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

export const getStripe = () => {
  if (!_stripe && process.env.STRIPE_SECRET_KEY) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return _stripe;
};

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    sessionsPerDay: 3,
    messagesPerSession: 10,
  },
  pro: {
    name: 'Pro',
    price: 999, // $9.99 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    sessionsPerDay: Infinity,
    messagesPerSession: Infinity,
  },
} as const;

export type PlanType = keyof typeof PLANS;
