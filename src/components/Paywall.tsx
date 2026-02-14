'use client';

import { useState } from 'react';
import { useUsageStore } from '@/lib/usage';
import { PLANS } from '@/lib/stripe';
import { X, Zap, Check, Loader2 } from 'lucide-react';

interface PaywallProps {
  onClose: () => void;
  type: 'sessions' | 'messages';
}

export function Paywall({ onClose, type }: PaywallProps) {
  const [loading, setLoading] = useState(false);
  const { plan } = useUsageStore();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'local-user' }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Payments not configured yet. Coming soon!');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
            <Zap size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {type === 'sessions'
              ? "You've used all your free sessions today!"
              : "You've reached the message limit!"}
          </h2>
          <p className="text-gray-400 text-sm">
            Upgrade to Pro for unlimited practice sessions and messages.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="glass-panel p-4 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Free Plan</span>
              <span className="text-sm text-gray-500">Current</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-gray-500" />
                {PLANS.free.sessionsPerDay} practice sessions/day
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-gray-500" />
                {PLANS.free.messagesPerSession} messages/session
              </li>
            </ul>
          </div>

          <div className="glass-panel p-4 border-2 border-primary/50 bg-primary/5">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold gradient-text">Pro Plan</span>
              <span className="text-lg font-bold">$9.99<span className="text-sm text-gray-400">/mo</span></span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary" />
                <span>Unlimited practice sessions</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary" />
                <span>Unlimited messages per session</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary" />
                <span>Advanced AI personas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-primary" />
                <span>Detailed feedback & analytics</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Zap size={18} />
              Upgrade to Pro
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  );
}
