import React from 'react';
import { PlayerStats } from '../types/baseball';

interface BatterSlotBlockProps {
  players: PlayerStats[];
  currentBatterSlot: number;
  autoAdvance: boolean;
  onSelectBatter: (slot: number) => void;
  onToggleAutoAdvance: () => void;
  onUpdatePlayerName: (slot: number, name: string) => void;
}

export const BatterSlotBlock: React.FC<BatterSlotBlockProps> = ({
  players,
  currentBatterSlot,
  autoAdvance,
  onSelectBatter,
  onToggleAutoAdvance,
  onUpdatePlayerName,
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
              ? `目前打者：${selectedPlayer.slot}棒 #${selectedPlayer.number || '-'} ${selectedPlayer.name.trim() || '未命名選手'}`
              : '請點選打擊棒次，可直接填寫球員姓名'}
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

      {/* 1~15 Batting Order Grid (11~15 shown when name is filled) */}
      <div className="grid grid-cols-3 gap-2">
        {players
          .filter((player) => player.slot <= 10 || player.name.trim() !== '')
          .map((player) => {
          const isSelected = player.slot === currentBatterSlot;
          return (
            <div
              key={player.slot}
              onClick={() => onSelectBatter(player.slot)}
              className={`min-h-[76px] p-2 rounded-xl border transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBatter(player.slot);
                }}
                aria-pressed={isSelected}
                className="flex items-baseline justify-between gap-1 w-full text-left focus:outline-none"
              >
                <div className="flex items-baseline gap-1 min-w-0">
                  <span className="font-display-num text-base font-bold leading-none whitespace-nowrap">
                    {player.slot}棒
                  </span>
                  {player.number && (
                    <span
                      className={`font-mono-tabular text-[10px] shrink-0 ${
                        isSelected ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      #{player.number}
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
              </button>

              <input
                type="text"
                value={player.name}
                onChange={(e) =>
                  onUpdatePlayerName(player.slot, e.target.value)
                }
                onClick={(e) => e.stopPropagation()}
                placeholder="輸入姓名"
                aria-label={`${player.slot}棒球員姓名`}
                className={`w-full min-w-0 h-8 px-2 rounded-lg border text-xs font-medium transition-colors focus:outline-none ${
                  isSelected
                    ? 'bg-white/15 border-blue-300/45 text-white placeholder:text-blue-200/75 focus:bg-white focus:text-slate-900 focus:border-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1E3A8A]'
                }`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
