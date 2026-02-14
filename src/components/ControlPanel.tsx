'use client';

import { useFilterStore, useUIStore } from '@/lib/store';
import { TimeSlot, DayOfWeek, Demographic, Category } from '@/lib/types';
import { getTimeSlotEmoji, getDayLabel } from '@/lib/scoring';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/data/locations';
import { X } from 'lucide-react';

const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening', 'latenight'];
const DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DEMOGRAPHICS: { key: Demographic; label: string; emoji: string }[] = [
  { key: 'asian', label: 'Asian', emoji: '🇯🇵' },
  { key: 'latina', label: 'Latina', emoji: '🇲🇽' },
  { key: 'white', label: 'White', emoji: '🇺🇸' },
  { key: 'black', label: 'Black', emoji: '🌍' },
  { key: 'mena', label: 'MENA', emoji: '🇸🇦' },
  { key: 'southasian', label: 'South Asian', emoji: '🇮🇳' },
];
const CATEGORIES: Category[] = ['food', 'shopping', 'campus', 'gym', 'outdoor', 'social'];
const RADIUS_OPTIONS = [1, 2, 5, 10];

export function ControlPanel() {
  const {
    filters,
    setTimeSlot,
    setDayOfWeek,
    toggleDemographic,
    toggleCategory,
    setRadius,
  } = useFilterStore();
  const { activePanel, setActivePanel } = useUIStore();

  const isMobileVisible = activePanel === 'filters';

  return (
    <div className={`
      fixed z-[1000] glass-panel overflow-y-auto
      md:top-5 md:left-5 md:w-80 md:max-h-[calc(100vh-40px)] md:p-6 md:rounded-2xl
      inset-0 p-6 pb-24 rounded-none
      transition-transform duration-300 ease-out
      ${isMobileVisible ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
    `}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <div>
          <h1 className="text-xl font-bold gradient-text">Filters</h1>
          <p className="text-[11px] text-gray-500">Customize your search</p>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-lg font-bold gradient-text mb-1">Chud2Chad</h1>
        <p className="text-[11px] text-gray-500 mb-5">C2C Social Skills Trainer</p>
      </div>

      {/* Radius Filter */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Radius
        </label>
        <div className="flex gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`flex-1 btn-secondary text-[13px] font-semibold py-3 md:py-2.5 ${
                filters.radius === r ? 'active' : ''
              }`}
            >
              {r}mi
            </button>
          ))}
        </div>
      </div>

      {/* Time Filter */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Time of Day
        </label>
        <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => setTimeSlot(slot)}
              className={`btn-secondary text-center py-3 md:py-2.5 ${
                filters.timeSlot === slot ? 'active' : ''
              }`}
            >
              <span className="text-lg block mb-1">{getTimeSlotEmoji(slot)}</span>
              <span className="text-[11px] md:text-[12px] capitalize">{slot === 'latenight' ? 'Late' : slot}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Day Filter */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Day of Week
        </label>
        <div className="flex gap-1">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setDayOfWeek(day)}
              className={`flex-1 btn-secondary text-[11px] md:text-[10px] font-semibold py-3 md:py-2 px-1 ${
                filters.dayOfWeek === day ? 'active' : ''
              }`}
            >
              {getDayLabel(day).charAt(0)}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2 md:gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`chip text-[13px] md:text-[12px] py-2 md:py-1.5 ${filters.categories.includes(cat) ? 'active' : ''}`}
            >
              {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Demographics Filter */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Target Demographic
        </label>
        <div className="flex flex-wrap gap-2 md:gap-1.5">
          {DEMOGRAPHICS.map((demo) => (
            <button
              key={demo.key}
              onClick={() => toggleDemographic(demo.key)}
              className={`chip text-[13px] md:text-[12px] py-2 md:py-1.5 ${filters.demographics.includes(demo.key) ? 'active' : ''}`}
            >
              {demo.emoji} {demo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/[0.08]">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Score Legend
        </label>
        <div className="h-3 rounded-md bg-gradient-to-r from-blue-500/30 via-purple-500 via-accent to-primary-dark mb-1.5" />
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
          <span>Best</span>
        </div>
      </div>
    </div>
  );
}
