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

const FIELD_BUTTON_POSITIONS: {
  code: HitDirectionCode;
  left: string;
  top: string;
}[] = [
  { code: 'LF', left: '20%', top: '26%' },
  { code: 'CF', left: '50%', top: '15%' },
  { code: 'RF', left: '80%', top: '26%' },
  { code: 'SS', left: '34%', top: '42%' },
  { code: '2B', left: '66%', top: '42%' },
  { code: '3B', left: '22%', top: '62%' },
  { code: 'P', left: '50%', top: '61%' },
  { code: '1B', left: '78%', top: '62%' },
  { code: 'C', left: '50%', top: '86%' },
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
        ? 'bg-emerald-600 border-emerald-700 text-white ring-2 ring-emerald-600/30 shadow-sm'
        : 'bg-amber-500 border-amber-600 text-white ring-2 ring-amber-500/30 shadow-sm';
    }
    if (zone === 'outfield') {
      return 'bg-green-50/95 border-green-400 text-green-950 hover:bg-green-100 hover:border-green-500 shadow-xs';
    }
    return 'bg-yellow-50/95 border-yellow-400 text-yellow-950 hover:bg-yellow-100 hover:border-yellow-500 shadow-xs';
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
              `直接於球場對應位置點選擊球方向（${selectedBatterSlot}棒 ${batterDisplay}）`
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
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-semibold text-slate-600">擊球方向</span>
          <span className="text-[11px] text-slate-400">
            外野淺綠 · 內野淺黃
          </span>
        </div>

        <div
          className="relative w-full max-w-[440px] mx-auto aspect-[6/5] rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden"
          role="group"
          aria-label="棒球場擊球方向選單"
        >
          {/* Simple Baseball Field Base Map */}
          <svg
            viewBox="0 0 360 300"
            className="w-full h-full block pointer-events-none select-none"
            aria-hidden="true"
          >
            {/* Outfield Grass Sector */}
            <path
              d="M 180 256 L 12 88 A 238 238 0 0 1 348 88 Z"
              fill="#DCFCE7"
              stroke="#86EFAC"
              strokeWidth="2"
            />
            {/* Subtle Outfield Turf Arc */}
            <path
              d="M 180 256 L 54 130 A 178 178 0 0 1 306 130 Z"
              fill="#ECFDF5"
              fillOpacity="0.65"
            />
            {/* Infield Dirt Arc */}
            <path
              d="M 180 256 L 70 146 A 156 156 0 0 1 290 146 Z"
              fill="#FEF3C7"
              stroke="#FCD34D"
              strokeWidth="1.5"
            />
            {/* Inner Grass Diamond */}
            <polygon
              points="180,118 244,184 180,250 116,184"
              fill="#ECFDF5"
              stroke="#D1FAE5"
              strokeWidth="1"
            />
            {/* Basepaths */}
            <polygon
              points="180,112 252,184 180,256 108,184"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* Foul Lines */}
            <line
              x1="180"
              y1="256"
              x2="12"
              y2="88"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <line
              x1="180"
              y1="256"
              x2="348"
              y2="88"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* Pitcher's Mound */}
            <circle
              cx="180"
              cy="184"
              r="14"
              fill="#FDE68A"
              stroke="#F59E0B"
              strokeOpacity="0.45"
              strokeWidth="1.2"
            />
            {/* 2nd Base */}
            <rect
              x="175"
              y="107"
              width="10"
              height="10"
              rx="1.5"
              transform="rotate(45 180 112)"
              fill="#FFFFFF"
              stroke="#94A3B8"
              strokeWidth="1"
            />
            {/* 3rd Base */}
            <rect
              x="103"
              y="179"
              width="10"
              height="10"
              rx="1.5"
              transform="rotate(45 108 184)"
              fill="#FFFFFF"
              stroke="#94A3B8"
              strokeWidth="1"
            />
            {/* 1st Base */}
            <rect
              x="247"
              y="179"
              width="10"
              height="10"
              rx="1.5"
              transform="rotate(45 252 184)"
              fill="#FFFFFF"
              stroke="#94A3B8"
              strokeWidth="1"
            />
            {/* Home Plate */}
            <polygon
              points="174,251 186,251 186,257 180,262 174,257"
              fill="#FFFFFF"
              stroke="#94A3B8"
              strokeWidth="1"
            />
          </svg>

          {/* 9 Interactive Position Buttons */}
          {FIELD_BUTTON_POSITIONS.map(({ code, left, top }) => {
            const def = HIT_DIRECTION_DEFINITIONS[code];
            const isSelected = selectedDirection === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onSelectDirection(isSelected ? null : code)}
                aria-pressed={isSelected}
                style={{ left, top }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 min-h-[40px] min-w-[58px] sm:min-w-[68px] px-2 sm:px-2.5 py-1 rounded-xl border transition-all active:scale-[0.96] flex flex-col items-center justify-center leading-tight ${getDirectionButtonStyle(
                  def.zone,
                  isSelected
                )}`}
              >
                <span className="text-xs sm:text-[13px] font-bold whitespace-nowrap">
                  {def.label}
                </span>
                <span
                  className={`font-mono-tabular text-[9px] font-bold leading-none mt-0.5 ${
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
