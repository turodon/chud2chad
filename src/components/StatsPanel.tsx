'use client';

import { useMemo } from 'react';
import { useFilterStore } from '@/lib/store';
import { LOCATIONS } from '@/lib/data/locations';
import { calculateScore } from '@/lib/scoring';

export function StatsPanel() {
  const { filters } = useFilterStore();

  // Calculate stats based on current filters
  const stats = useMemo(() => {
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
    <div className="fixed bottom-5 left-5 z-[1000] glass-panel py-4 px-5 flex gap-6">
      <div className="text-center">
        <div className="text-xl font-bold gradient-text">{stats.visible}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Spots</div>
      </div>

      <div className="text-center">
        <div className="text-xl font-bold gradient-text">{stats.hotspots}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Hot</div>
      </div>

      <div className="text-center">
        <div className="text-xl font-bold gradient-text">{stats.avgScore}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Avg</div>
      </div>

      <div className="text-center">
        <div className="text-xl font-bold gradient-text">{stats.topScore}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Best</div>
      </div>
    </div>
  );
}
