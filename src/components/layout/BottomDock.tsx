'use client';

import React from 'react';
import { LayoutGrid, TrendingUp, BarChart2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface BottomDockProps {
  activeTab: 'command' | 'alerts' | 'analytics';
  onTabChange: (tab: 'command' | 'alerts' | 'analytics') => void;
  totalAlertas: number;
}

export function BottomDock({
  activeTab,
  onTabChange,
  totalAlertas,
}: BottomDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-fit px-2">
      <nav className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#181615]/85 backdrop-blur-2xl border border-white/10 shadow-2xl">
        {/* Tab 1: Command Center */}
        <button
          onClick={() => onTabChange('command')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
            activeTab === 'command'
              ? 'bg-white text-black shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Command Center</span>
        </button>

        {/* Tab 2: Alertas */}
        <button
          onClick={() => onTabChange('alerts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
            activeTab === 'alerts'
              ? 'bg-white text-black shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${totalAlertas > 0 ? 'text-rose-400' : ''}`} />
          <span>Alertas {totalAlertas > 0 ? `(${totalAlertas})` : ''}</span>
        </button>

        {/* Tab 3: Métricas */}
        <button
          onClick={() => onTabChange('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
            activeTab === 'analytics'
              ? 'bg-white text-black shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Métricas</span>
        </button>
      </nav>
    </div>
  );
}
