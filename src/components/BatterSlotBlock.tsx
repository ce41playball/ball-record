import React from 'react';
import { PlayerStats } from '../types/baseball';

interface BatterSlotBlockProps {
  players: PlayerStats[];
  currentBatterSlot: number;
  autoAdvance: boolean;
  onSelectBatter: (slot: number) => void;
  onToggleAutoAdvance: () => void;
}

export const BatterSlotBlock: React.FC<BatterSlotBlockProps> = ({
  players,
  currentBatterSlot,
  autoAdvance,
  onSelectBatter,
  onToggleAutoAdvance,
}) => {
  const selectedPlayer = players.find((p) => p.slot === currentBatterSlot);

  return (
    <section
      aria-labelledby="block-batter-heading"
      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="block-batter-heading"
            className="text-base font-bold text-slate-900"
          >
            第二區塊：選擇打擊球員棒次
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {selectedPlayer
              ? `目前打者：${selectedPlayer.slot}棒${selectedPlayer.position ? ` (${selectedPlayer.position})` : ''} ${selectedPlayer.name.trim() || '未命名選手'}`
              : '請點選打擊棒次（球員姓名連動自先發名單）'}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleAutoAdvance}
          aria-pressed={autoAdvance}
          className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            autoAdvance
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {autoAdvance ? '自動輪下一棒：開' : '自動輪下一棒：關'}
        </button>
      </div>

      {/* 1~15 Batting Order Grid (10~15 shown when name is filled in lineup) */}
      <div className="grid grid-cols-3 gap-2">
        {players
          .filter((player) => player.slot <= 9 || player.name.trim() !== '')
          .map((player) => {
            const isSelected = player.slot === currentBatterSlot;
            const displayName = player.name.trim() || '未命名選手';
            const posText = player.position.trim();
            return (
              <button
                key={player.slot}
                type="button"
                onClick={() => onSelectBatter(player.slot)}
                aria-pressed={isSelected}
                className={`min-h-[64px] p-2.5 rounded-xl border transition-all active:scale-[0.98] flex flex-col justify-between gap-1 text-left ${
                  isSelected
                    ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-baseline justify-between gap-1 w-full">
                  <div className="flex items-baseline gap-1 min-w-0">
                    <span className="font-display-num text-base font-bold leading-none whitespace-nowrap">
                      {player.slot}棒
                    </span>
                    {posText && (
                      <span
                        className={`text-[10px] font-semibold truncate ${
                          isSelected ? 'text-blue-100' : 'text-[#1E3A8A]'
                        }`}
                      >
                        {posText}
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-mono-tabular text-[11px] whitespace-nowrap shrink-0 ${
                      isSelected ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    {player.ab > 0 ? `${player.ab}-${player.h}` : '0-0'}
                  </span>
                </div>

                <span
                  className={`w-full text-xs sm:text-sm font-semibold truncate ${
                    isSelected ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {displayName}
                </span>
              </button>
            );
          })}
      </div>
    </section>
  );
};
