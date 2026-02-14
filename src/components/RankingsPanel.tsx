'use client';

import { useMemo } from 'react';
import { useFilterStore, useUIStore } from '@/lib/store';
import { LOCATIONS, CATEGORY_ICONS } from '@/lib/data/locations';
import { calculateScore } from '@/lib/scoring';
import { X } from 'lucide-react';

export function RankingsPanel() {
  const { filters } = useFilterStore();
  const { setSelectedLocation, openPracticeModal, activePanel, setActivePanel } = useUIStore();

  const isMobileVisible = activePanel === 'rankings';

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
    setActivePanel(null); // Close panel on mobile after selection
  };

  return (
    <div className={`
      fixed z-[1000] glass-panel flex flex-col
      md:top-5 md:right-5 md:w-72 md:max-h-[calc(100vh-180px)] md:p-4 md:rounded-2xl
      inset-0 p-4 pb-24 rounded-none
      transition-transform duration-300 ease-out
      ${isMobileVisible ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
    `}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.08] md:hidden">
        <div>
          <h2 className="text-xl font-bold gradient-text">Top Spots</h2>
          <p className="text-[11px] text-gray-500">Tap to start practice</p>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center mb-3 pb-2.5 border-b border-white/[0.08]">
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
              className={`flex items-center gap-3 p-3 md:p-2.5 mb-2 md:mb-1.5 rounded-xl md:rounded-lg cursor-pointer transition-all border border-transparent active:scale-[0.98] hover:bg-primary/10 hover:border-primary/20 ${
                isTop3 ? 'bg-primary/10 border-primary/15' : 'bg-white/[0.03]'
              }`}
            >
              {/* Rank Number */}
              <div
                className={`w-8 h-8 md:w-6 md:h-6 rounded-full flex items-center justify-center text-sm md:text-[11px] font-bold flex-shrink-0 ${
                  isTop3
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-white/[0.08] text-gray-500'
                }`}
              >
                {index + 1}
              </div>

              {/* Location Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] md:text-[12px] font-semibold text-gray-100 truncate">
                  {CATEGORY_ICONS[location.category]} {location.name}
                </div>
                <div className="text-[12px] md:text-[10px] text-gray-500 mt-0.5">
                  {location.type} • {location.distance}
                </div>
              </div>

              {/* Score */}
              <div className={`text-lg md:text-sm font-bold flex-shrink-0 ${scoreColorClass}`}>{score}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
