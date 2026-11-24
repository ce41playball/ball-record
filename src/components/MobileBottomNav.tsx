import React from 'react';
import { BarChart3, ClipboardList, Users } from 'lucide-react';

export type MobileTab = 'record' | 'stats' | 'manage';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  paCount: number;
  onChangeTab: (tab: MobileTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  paCount,
  onChangeTab,
}) => {
  const tabs: {
    id: MobileTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'record', label: '記分輸入', icon: ClipboardList },
    {
      id: 'stats',
      label: paCount > 0 ? `統計 (${paCount})` : '打擊統計',
      icon: BarChart3,
    },
    { id: 'manage', label: '名單匯出', icon: Users },
  ];

  return (
    <nav
      aria-label="主要功能切換"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
    >
      <div className="grid grid-cols-3 h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-[#1E3A8A]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
