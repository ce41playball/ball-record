import React from 'react';
import { RotateCcw } from 'lucide-react';
import { HitDirectionCode, HitTypeCode } from '../types/baseball';
import {
  HIT_DIRECTION_DEFINITIONS,
  HIT_TYPE_CODES,
  HIT_TYPE_DEFINITIONS,
} from '../utils/baseballEngine';

interface HitDirectionBlockProps {
  selectedBatterSlot: number;
  selectedBatterName: string;
  selectedDirection: HitDirectionCode | null;
  selectedHitType: HitTypeCode | null;
  onSelectDirection: (direction: HitDirectionCode | null) => void;
  onSelectHitType: (hitType: HitTypeCode | null) => void;
}

const NINE_GRID_CODES: HitDirectionCode[] = [
  'LF',
  'CF',
  'RF',
  'SS',
  'P',
  '2B',
  '3B',
  'C',
  '1B',
];

export const HitDirectionBlock: React.FC<HitDirectionBlockProps> = ({
  selectedBatterSlot,
  selectedBatterName,
  selectedDirection,
  selectedHitType,
  onSelectDirection,
  onSelectHitType,
}) => {
  const activeDirDef = selectedDirection
    ? HIT_DIRECTION_DEFINITIONS[selectedDirection]
    : null;
  const activeTypeDef = selectedHitType
    ? HIT_TYPE_DEFINITIONS[selectedHitType]
    : null;
  const batterDisplay = selectedBatterName.trim() || '未命名選手';
  const hasAnySelection =
    selectedDirection !== null || selectedHitType !== null;

  const getDirectionButtonStyle = (
    zone: 'outfield' | 'infield',
    isSelected: boolean
  ) => {
    if (isSelected) {
      return zone === 'outfield'
        ? 'bg-emerald-600 border-emerald-700 text-white ring-2 ring-emerald-600/25'
        : 'bg-amber-500 border-amber-600 text-white ring-2 ring-amber-500/25';
    }
    if (zone === 'outfield') {
      return 'bg-green-50 border-green-300 text-green-950 hover:bg-green-100 hover:border-green-400';
    }
    return 'bg-yellow-50 border-yellow-300 text-yellow-950 hover:bg-yellow-100 hover:border-yellow-400';
  };

  return (
    <section
      aria-labelledby="block-direction-heading"
      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="block-direction-heading"
            className="text-base font-bold text-slate-900"
          >
            第四區塊：選擇擊球方向與型態
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {hasAnySelection ? (
              <span>
                已選項目：
                <span className="font-semibold text-slate-800">
                  {[
                    activeDirDef
                      ? `${activeDirDef.zone === 'outfield' ? '外野' : '內野'} ${activeDirDef.label}`
                      : null,
                    activeTypeDef ? activeTypeDef.label : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                （{selectedBatterSlot}棒 {batterDisplay}）
              </span>
            ) : (
              `外野（淺綠）／內野（淺黃）九宮格與擊球型態選填（${selectedBatterSlot}棒 ${batterDisplay}）`
            )}
          </p>
        </div>

        {hasAnySelection && (
          <button
            type="button"
            onClick={() => {
              onSelectDirection(null);
              onSelectHitType(null);
            }}
            className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>清除</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600">擊球方向</div>
        <div
          className="grid grid-cols-3 gap-2"
          role="group"
          aria-label="擊球方向九宮格"
        >
          {NINE_GRID_CODES.map((code) => {
            const def = HIT_DIRECTION_DEFINITIONS[code];
            const isSelected = selectedDirection === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onSelectDirection(isSelected ? null : code)}
                aria-pressed={isSelected}
                className={`min-h-[52px] px-3 py-2 rounded-xl border transition-all active:scale-[0.97] flex items-center justify-between gap-1.5 text-left ${getDirectionButtonStyle(
                  def.zone,
                  isSelected
                )}`}
              >
                <span className="text-sm font-bold whitespace-nowrap">
                  {def.label}
                </span>
                <span
                  className={`font-mono-tabular text-xs font-bold shrink-0 ${
                    isSelected
                      ? 'text-white/90'
                      : def.zone === 'outfield'
                      ? 'text-green-700'
                      : 'text-amber-700'
                  }`}
                >
                  {def.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-600">擊球型態</div>
        <div
          className="grid grid-cols-3 gap-2"
          role="group"
          aria-label="擊球型態"
        >
          {HIT_TYPE_CODES.map((code) => {
            const def = HIT_TYPE_DEFINITIONS[code];
            const isSelected = selectedHitType === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onSelectHitType(isSelected ? null : code)}
                aria-pressed={isSelected}
                className={`min-h-[46px] px-3 py-2 rounded-xl border transition-all active:scale-[0.97] flex items-center justify-center text-center ${
                  isSelected
                    ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white ring-2 ring-blue-900/20'
                    : 'bg-sky-50/75 border-sky-200 text-slate-900 hover:bg-sky-100/80 hover:border-sky-300'
                }`}
              >
                <span className="text-sm font-bold whitespace-nowrap">
                  {def.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
