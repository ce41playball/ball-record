import React from 'react';
import { Plus } from 'lucide-react';
import { InningHalf } from '../types/baseball';
import { getInningHalfLabel, getInningLabel } from '../utils/baseballEngine';

interface InningSelectorBlockProps {
  currentInning: number;
  inningHalf: InningHalf;
  maxInnings: number;
  onSelectInning: (inning: number) => void;
  onSelectHalf: (half: InningHalf) => void;
  onAddExtraInning: () => void;
}

export const InningSelectorBlock: React.FC<InningSelectorBlockProps> = ({
  currentInning,
  inningHalf,
  maxInnings,
  onSelectInning,
  onSelectHalf,
  onAddExtraInning,
}) => {
  const innings = Array.from({ length: maxInnings }, (_, i) => i + 1);

  return (
    <section
      aria-labelledby="block-inning-heading"
      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="block-inning-heading"
            className="text-base font-bold text-slate-900"
          >
            第一區塊：選擇比賽局數
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            目前進行：{getInningHalfLabel(currentInning, inningHalf)}
          </p>
        </div>

        {/* Top / Bottom Inning Half Segmented Control */}
        <div
          className="inline-flex items-center p-1 bg-slate-100 rounded-xl shrink-0"
          role="group"
          aria-label="上半或下半局"
        >
          <button
            type="button"
            onClick={() => onSelectHalf('top')}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              inningHalf === 'top'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            上半
          </button>
          <button
            type="button"
            onClick={() => onSelectHalf('bottom')}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              inningHalf === 'bottom'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            下半
          </button>
        </div>
      </div>

      {/* 1~9 (up to 12) Innings Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
        {innings.map((inning) => {
          const isSelected = currentInning === inning;
          return (
            <button
              key={inning}
              type="button"
              onClick={() => onSelectInning(inning)}
              aria-pressed={isSelected}
              className={`min-h-[44px] px-2 py-2 rounded-xl border text-sm font-semibold transition-all active:scale-[0.97] whitespace-nowrap shrink-0 flex items-center justify-center ${
                isSelected
                  ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {getInningLabel(inning)}
            </button>
          );
        })}

        {maxInnings < 12 && (
          <button
            type="button"
            onClick={onAddExtraInning}
            className="min-h-[44px] px-2 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors active:scale-[0.97] whitespace-nowrap shrink-0 flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>延長</span>
          </button>
        )}
      </div>
    </section>
  );
};
