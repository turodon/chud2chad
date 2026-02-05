'use client';

import { useSessionStore } from '@/lib/store';

export function SessionTracker() {
  const { stats, sessions, clearSessions } = useSessionStore();
  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="fixed top-[calc(100vh-320px)] right-5 z-[1000] glass-panel p-4 w-52">
      <h3 className="text-[12px] uppercase tracking-wider text-gray-400 mb-3">Session Tracker</h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-white/[0.03] rounded-lg">
          <div className="text-lg font-bold text-success">{stats.success}</div>
          <div className="text-[9px] text-gray-500 uppercase">Success</div>
        </div>
        <div className="text-center p-2 bg-white/[0.03] rounded-lg">
          <div className="text-lg font-bold text-warning">{stats.neutral}</div>
          <div className="text-[9px] text-gray-500 uppercase">Neutral</div>
        </div>
        <div className="text-center p-2 bg-white/[0.03] rounded-lg">
          <div className="text-lg font-bold text-danger">{stats.reject}</div>
          <div className="text-[9px] text-gray-500 uppercase">Reject</div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="text-center p-2.5 bg-gradient-to-r from-primary/15 to-accent/15 rounded-lg mb-3">
        <div className="text-2xl font-bold gradient-text">
          {stats.total > 0 ? stats.successRate.toFixed(0) : 0}%
        </div>
        <div className="text-[10px] text-gray-400">Success Rate</div>
      </div>

      {/* Recent History */}
      {recentSessions.length > 0 && (
        <div className="pt-3 border-t border-white/[0.08]">
          <h4 className="text-[10px] text-gray-500 uppercase mb-2">Recent</h4>
          <div className="flex gap-1.5">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-base cursor-pointer transition-all hover:scale-110 border-2 ${
                  session.outcome === 'success'
                    ? 'border-success/50 bg-success/10'
                    : session.outcome === 'reject'
                    ? 'border-danger/50 bg-danger/10'
                    : 'border-warning/50 bg-warning/10'
                }`}
                title={`${session.locationName} - ${session.outcome}`}
              >
                {session.outcome === 'success' ? '✓' : session.outcome === 'reject' ? '✗' : '~'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      {stats.total > 0 && (
        <button
          onClick={clearSessions}
          className="w-full mt-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-[10px] text-gray-500 hover:bg-primary/15 hover:text-white transition-colors"
        >
          Reset Session
        </button>
      )}
    </div>
  );
}
