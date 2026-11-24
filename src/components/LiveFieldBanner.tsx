import React from 'react';
import { RotateCcw } from 'lucide-react';
import { BasesState, InningHalf } from '../types/baseball';
import { getInningHalfLabel } from '../utils/baseballEngine';
import { BaseballDiamond } from './BaseballDiamond';

interface LiveFieldBannerProps {
  currentInning: number;
  inningHalf: InningHalf;
  outs: number;
  bases: BasesState;
  teamHits: number;
  teamRuns: number;
  onSetOuts: (outs: number) => void;
  onToggleBase: (base: keyof BasesState) => void;
  onClearField: () => void;
}

export const LiveFieldBanner: React.FC<LiveFieldBannerProps> = ({
  currentInning,
  inningHalf,
  outs,
  bases,
  teamHits,
  teamRuns,
  onSetOuts,
  onToggleBase,
  onClearField,
}) => {
  const occupiedLabels = [
    bases.first ? '一壘' : null,
    bases.second ? '二壘' : null,
    bases.third ? '三壘' : null,
  ].filter(Boolean);

  return (
    <section
      aria-label="目前場上狀態"
      className="bg-white border border-slate-200 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Inning, Hits/Runs & Outs */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display-num text-2xl font-bold text-[#1E3A8A] whitespace-nowrap">
              {getInningHalfLabel(currentInning, inningHalf)}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-tabular">
              <span>{teamRuns} 得分</span>
              <span aria-hidden="true">·</span>
              <span>{teamHits} 安打</span>
              <span aria-hidden="true">·</span>
              <span>
                {occupiedLabels.length > 0
                  ? `${occupiedLabels.join('、')}有人`
                  : '壘上無人'}
              </span>
            </div>
          </div>

          {/* Interactive Outs Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                目前出局數（可點擊調整）
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((count) => {
                const isActive = outs === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onSetOuts(count)}
                    className={`min-h-[44px] px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.97] whitespace-nowrap ${
                      isActive
                        ? count === 2
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono-tabular text-sm font-bold">
                      {count}
                    </span>
                    <span>出局</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-0.5">
            <button
              type="button"
              onClick={onClearField}
              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 inline-flex items-center gap-1.5 transition-colors active:scale-[0.97]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>清空壘包與歸零出局</span>
            </button>
          </div>
        </div>

        {/* Right: Interactive Diamond */}
        <div className="shrink-0 flex flex-col items-center">
          <BaseballDiamond
            bases={bases}
            onToggleBase={onToggleBase}
            size="sm"
          />
          <span className="text-[11px] text-slate-500 mt-1 whitespace-nowrap">
            點選壘包切換跑者
          </span>
        </div>
      </div>
    </section>
  );
};
