import React from 'react';
import { OutcomeCode } from '../types/baseball';
import { OUTCOME_DEFINITIONS, OUTCOME_GROUPS } from '../utils/baseballEngine';

interface OutcomeSelectorBlockProps {
  selectedBatterSlot: number;
  selectedBatterName: string;
  selectedOutcome: OutcomeCode | null;
  onPickOutcome: (outcome: OutcomeCode) => void;
}

export const OutcomeSelectorBlock: React.FC<OutcomeSelectorBlockProps> = ({
  selectedBatterSlot,
  selectedBatterName,
  selectedOutcome,
  onPickOutcome,
}) => {
  const getGroupButtonStyle = (
    groupId: 'hit' | 'reach' | 'out',
    isSelected: boolean
  ) => {
    if (isSelected) {
      switch (groupId) {
        case 'hit':
          return 'bg-emerald-600 border-emerald-700 text-white ring-2 ring-emerald-600/25';
        case 'reach':
          return 'bg-amber-600 border-amber-700 text-white ring-2 ring-amber-600/25';
        case 'out':
          return 'bg-rose-600 border-rose-700 text-white ring-2 ring-rose-600/25';
      }
    }
    switch (groupId) {
      case 'hit':
        return 'bg-emerald-50/75 border-emerald-300 text-emerald-950 hover:bg-emerald-100/90 hover:border-emerald-400';
      case 'reach':
        return 'bg-amber-50/75 border-amber-300 text-amber-950 hover:bg-amber-100/90 hover:border-amber-400';
      case 'out':
        return 'bg-rose-50/60 border-rose-200 text-rose-950 hover:bg-rose-100/80 hover:border-rose-300';
    }
  };

  const getCodeBadgeStyle = (
    groupId: 'hit' | 'reach' | 'out',
    isSelected: boolean
  ) => {
    if (isSelected) return 'text-white/90';
    switch (groupId) {
      case 'hit':
        return 'text-emerald-700';
      case 'reach':
        return 'text-amber-700';
      case 'out':
        return 'text-rose-700';
    }
  };

  return (
    <section
      aria-labelledby="block-outcome-heading"
      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4"
    >
      <div>
        <h2
          id="block-outcome-heading"
          className="text-base font-bold text-slate-900"
        >
          第三區塊：選擇打席結果
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          選擇打席結果後，請於第四區塊確認打點與得分數（{selectedBatterSlot}棒{' '}
          {selectedPlayerText(selectedBatterName)}）
        </p>
      </div>

      <div className="space-y-4">
        {OUTCOME_GROUPS.map((group) => (
          <div key={group.id} className="space-y-2">
            <div className="text-xs font-semibold text-slate-600">
              {group.title}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {group.codes.map((code) => {
                const def = OUTCOME_DEFINITIONS[code];
                const isSelected = selectedOutcome === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onPickOutcome(code)}
                    aria-pressed={isSelected}
                    className={`min-h-[48px] px-3 py-2 rounded-xl border transition-all active:scale-[0.97] flex items-center justify-between gap-1.5 text-left ${getGroupButtonStyle(
                      group.id,
                      isSelected
                    )}`}
                  >
                    <span className="text-sm font-bold whitespace-nowrap">
                      {def.label}
                    </span>
                    <span
                      className={`font-mono-tabular text-xs font-bold shrink-0 ${getCodeBadgeStyle(
                        group.id,
                        isSelected
                      )}`}
                    >
                      {def.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

function selectedPlayerText(name: string): string {
  return name.trim() || '未命名選手';
}
