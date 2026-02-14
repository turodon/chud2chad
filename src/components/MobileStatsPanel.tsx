'use client';

import { useMemo } from 'react';
import { useFilterStore, useSessionStore, useUIStore } from '@/lib/store';
import { LOCATIONS } from '@/lib/data/locations';
import { calculateScore } from '@/lib/scoring';
import { X } from 'lucide-react';

export function MobileStatsPanel() {
  const { filters } = useFilterStore();
  const { stats, sessions, clearSessions } = useSessionStore();
  const { activePanel, setActivePanel } = useUIStore();
  const recentSessions = sessions.slice(0, 8);

  const isMobileVisible = activePanel === 'tracker';

  // Calculate stats based on current filters
  const locationStats = useMemo(() => {
    const scored = LOCATIONS.map((loc) => ({
      location: loc,
      score: calculateScore(loc, filters.timeSlot, filters.dayOfWeek, filters.demographics),
    })).filter((item) => {
      if (filters.categories.length > 0 && !filters.categories.includes(item.location.category)) {
        return false;
      }
      return true;
    });

    const hotspots = scored.filter((s) => s.score >= 60).length;
    const avgScore = scored.length > 0
      ? Math.round(scored.reduce((acc, s) => acc + s.score, 0) / scored.length)
      : 0;
    const topScore = scored.length > 0 ? Math.max(...scored.map((s) => s.score)) : 0;

    return { visible: scored.length, hotspots, avgScore, topScore };
  }, [filters]);

  return (
    <div className={`
      fixed z-[1000] glass-panel md:hidden
      inset-0 p-6 pb-24 rounded-none overflow-y-auto
      transition-transform duration-300 ease-out
      ${isMobileVisible ? 'translate-y-0' : 'translate-y-full'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold gradient-text">Your Stats</h1>
          <p className="text-[11px] text-gray-500">Track your progress</p>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Session Stats */}
      <div className="mb-6">
        <h3 className="text-[11px] uppercase tracking-wider text-gray-400 mb-3">Practice Results</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-4 bg-success/10 border border-success/20 rounded-xl">
            <div className="text-3xl font-bold text-success">{stats.success}</div>
            <div className="text-[11px] text-gray-400 uppercase mt-1">Success</div>
          </div>
          <div className="text-center p-4 bg-warning/10 border border-warning/20 rounded-xl">
            <div className="text-3xl font-bold text-warning">{stats.neutral}</div>
            <div className="text-[11px] text-gray-400 uppercase mt-1">Neutral</div>
          </div>
          <div className="text-center p-4 bg-danger/10 border border-danger/20 rounded-xl">
            <div className="text-3xl font-bold text-danger">{stats.reject}</div>
            <div className="text-[11px] text-gray-400 uppercase mt-1">Reject</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="text-center p-6 bg-gradient-to-r from-primary/15 to-accent/15 rounded-xl border border-primary/20">
          <div className="text-5xl font-bold gradient-text">
            {stats.total > 0 ? stats.successRate.toFixed(0) : 0}%
          </div>
          <div className="text-sm text-gray-400 mt-1">Success Rate</div>
          <div className="text-[11px] text-gray-500 mt-0.5">{stats.total} total sessions</div>
        </div>
      </div>

      {/* Recent History */}
      {recentSessions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[11px] uppercase tracking-wider text-gray-400 mb-3">Recent Sessions</h3>
          <div className="flex flex-wrap gap-2">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 ${
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

      {/* Location Stats */}
      <div className="mb-6">
        <h3 className="text-[11px] uppercase tracking-wider text-gray-400 mb-3">Current Area</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 bg-white/[0.03] rounded-xl">
            <div className="text-2xl font-bold gradient-text">{locationStats.visible}</div>
            <div className="text-[10px] text-gray-500 uppercase">Spots</div>
          </div>
          <div className="text-center p-3 bg-white/[0.03] rounded-xl">
            <div className="text-2xl font-bold gradient-text">{locationStats.hotspots}</div>
            <div className="text-[10px] text-gray-500 uppercase">Hot</div>
          </div>
          <div className="text-center p-3 bg-white/[0.03] rounded-xl">
            <div className="text-2xl font-bold gradient-text">{locationStats.avgScore}</div>
            <div className="text-[10px] text-gray-500 uppercase">Avg</div>
          </div>
          <div className="text-center p-3 bg-white/[0.03] rounded-xl">
            <div className="text-2xl font-bold gradient-text">{locationStats.topScore}</div>
            <div className="text-[10px] text-gray-500 uppercase">Best</div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      {stats.total > 0 && (
        <button
          onClick={clearSessions}
          className="w-full py-4 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-gray-400 hover:bg-danger/15 hover:text-danger hover:border-danger/30 transition-colors"
        >
          Reset All Sessions
        </button>
      )}
    </div>
  );
}
