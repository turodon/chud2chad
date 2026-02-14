'use client';

import { useUIStore } from '@/lib/store';
import { Sliders, MapPin, BarChart3, Target } from 'lucide-react';

export function MobileNav() {
  const { activePanel, setActivePanel } = useUIStore();

  const tabs = [
    { id: 'filters' as const, icon: Sliders, label: 'Filters' },
    { id: 'map' as const, icon: MapPin, label: 'Map' },
    { id: 'rankings' as const, icon: BarChart3, label: 'Spots' },
    { id: 'tracker' as const, icon: Target, label: 'Stats' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1001] md:hidden">
      <div className="glass-panel rounded-none border-t border-white/10">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id || (tab.id === 'map' && !activePanel);
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id === 'map' ? null : tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)] bg-surface/95 backdrop-blur-xl" />
    </nav>
  );
}
