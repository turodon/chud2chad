'use client';

import dynamic from 'next/dynamic';
import { ControlPanel } from '@/components/ControlPanel';
import { RankingsPanel } from '@/components/RankingsPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { SessionTracker } from '@/components/SessionTracker';
import { PracticeModal } from '@/components/PracticeModal';
import { MobileNav } from '@/components/MobileNav';
import { MobileStatsPanel } from '@/components/MobileStatsPanel';

// Dynamic import for Map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <p className="text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Map Background */}
      <MapView />

      {/* Control Panel (Left) */}
      <ControlPanel />

      {/* Rankings Panel (Right) */}
      <RankingsPanel />

      {/* Stats Panel (Bottom Left) - Desktop only */}
      <div className="hidden md:block">
        <StatsPanel />
      </div>

      {/* Session Tracker (Top Right, below rankings) - Desktop only */}
      <div className="hidden md:block">
        <SessionTracker />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Mobile Stats Panel */}
      <MobileStatsPanel />

      {/* Practice Modal */}
      <PracticeModal />
    </main>
  );
}
