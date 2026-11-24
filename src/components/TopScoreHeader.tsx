import React from 'react';
import { Undo2 } from 'lucide-react';

interface TopScoreHeaderProps {
  teamName: string;
  opponentName: string;
  teamRuns: number;
  opponentScore: number;
  canUndo: boolean;
  onUndo: () => void;
}

export const TopScoreHeader: React.FC<TopScoreHeaderProps> = ({
  teamName,
  opponentName,
  teamRuns,
  opponentScore,
  canUndo,
  onUndo,
}) => {
  return (
    <header className="sticky top-0 z-30 h-12 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <span className="font-display-num text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          DiamondLog
        </span>

        <div className="flex items-center gap-2 text-sm text-slate-700 min-w-0 truncate">
          <span className="font-medium truncate max-w-[84px] sm:max-w-[140px]">
            {teamName}
          </span>
          <span className="font-display-num text-lg font-bold text-[#1E3A8A] tabular-nums whitespace-nowrap">
            {teamRuns}
          </span>
          <span className="text-slate-400" aria-hidden="true">
            :
          </span>
          <span className="font-display-num text-lg font-bold text-slate-900 tabular-nums whitespace-nowrap">
            {opponentScore}
          </span>
          <span className="font-medium truncate max-w-[84px] sm:max-w-[140px]">
            {opponentName}
          </span>
        </div>

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
            canUndo
              ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.97]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>復原</span>
        </button>
      </div>
    </header>
  );
};
