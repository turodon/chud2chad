'use client';

import { useMemo } from 'react';
import { useFilterStore, useUIStore } from '@/lib/store';
import { LOCATIONS, CATEGORY_ICONS } from '@/lib/data/locations';
import { calculateScore, getScoreColor } from '@/lib/scoring';

export function RankingsPanel() {
  const { filters } = useFilterStore();
  const { setSelectedLocation, openPracticeModal } = useUIStore();

  // Calculate and sort locations by score
  const rankedLocations = useMemo(() => {
    return LOCATIONS.map((loc) => ({
      location: loc,
      score: calculateScore(loc, filters.timeSlot, filters.dayOfWeek, filters.demographics),
    }))
      .filter((item) => {
        if (filters.categories.length > 0 && !filters.categories.includes(item.location.category)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [filters]);

  const handleLocationClick = (location: typeof LOCATIONS[0]) => {
    setSelectedLocation(location);
    openPracticeModal();
  };

  return (
    <div className="fixed top-5 right-5 z-[1000] glass-panel p-4 w-72 max-h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-white/[0.08]">
        <h2 className="text-sm font-bold gradient-text">Top Spots Right Now</h2>
        {filters.demographics.length > 0 && (
          <span className="text-[10px] text-primary-light uppercase tracking-wide">
            {filters.demographics.join(', ')}
          </span>
        )}
      </div>

      {/* Rankings List */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        {rankedLocations.map(({ location, score }, index) => {
          const isTop3 = index < 3;
          const scoreColorClass =
            score >= 70 ? 'text-primary-dark' : score >= 50 ? 'text-accent' : 'text-purple-400';

          return (
            <div
              key={location.id}
              onClick={() => handleLocationClick(location)}
              className={`flex items-center gap-2.5 p-2.5 mb-1.5 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-primary/10 hover:border-primary/20 ${
                isTop3 ? 'bg-primary/10 border-primary/15' : 'bg-white/[0.03]'
              }`}
            >
              {/* Rank Number */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  isTop3
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-white/[0.08] text-gray-500'
                }`}
              >
                {index + 1}
              </div>

              {/* Location Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-gray-100 truncate">
                  {CATEGORY_ICONS[location.category]} {location.name}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {location.type} • {location.distance}
                </div>
              </div>

              {/* Score */}
              <div className={`text-sm font-bold flex-shrink-0 ${scoreColorClass}`}>{score}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
