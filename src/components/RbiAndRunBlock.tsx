import React from 'react';
import { Check, Minus, Plus, RotateCcw } from 'lucide-react';
import {
  BasesState,
  HitDirectionCode,
  HitTypeCode,
  InningHalf,
  OutcomeCode,
  PlayerLineupSlot,
} from '../types/baseball';
import {
  getInningHalfLabel,
  HIT_DIRECTION_DEFINITIONS,
  HIT_TYPE_DEFINITIONS,
  OUTCOME_DEFINITIONS,
} from '../utils/baseballEngine';

interface RbiAndRunBlockProps {
  inning: number;
  inningHalf: InningHalf;
  batter: PlayerLineupSlot;
  selectedOutcome: OutcomeCode | null;
  selectedHitDirection: HitDirectionCode | null;
  selectedHitType: HitTypeCode | null;
  rbi: number;
  runsScored: number;
  outsRecorded: number;
  currentOuts: number;
  basesAfter: BasesState;
  onSelectRbi: (value: number) => void;
  onSelectRuns: (value: number) => void;
  onChangeOutsRecorded: (value: number) => void;
  onToggleBaseAfter: (base: keyof BasesState) => void;
  onResetPending: () => void;
  onConfirm: (advanceHalfInning: boolean) => void;
}

const SCORE_OPTIONS = [0, 1, 2, 3, 4] as const;

export const RbiAndRunBlock: React.FC<RbiAndRunBlockProps> = ({
  inning,
  inningHalf,
  batter,
  selectedOutcome,
  selectedHitDirection,
  selectedHitType,
  rbi,
  runsScored,
  outsRecorded,
  currentOuts,
  basesAfter,
  onSelectRbi,
  onSelectRuns,
  onChangeOutsRecorded,
  onToggleBaseAfter,
  onResetPending,
  onConfirm,
}) => {
  const def = selectedOutcome ? OUTCOME_DEFINITIONS[selectedOutcome] : null;
  const dirDef = selectedHitDirection
    ? HIT_DIRECTION_DEFINITIONS[selectedHitDirection]
    : null;
  const typeDef = selectedHitType
    ? HIT_TYPE_DEFINITIONS[selectedHitType]
    : null;
  const projectedTotalOuts = Math.min(3, currentOuts + outsRecorded);
  const isThirdOut = selectedOutcome !== null && projectedTotalOuts >= 3;

  return (
    <section
      aria-labelledby="block-rbi-heading"
      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="block-rbi-heading"
            className="text-base font-bold text-slate-900"
          >
            第五區塊：紀錄打點與得分
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {def ? (
              <span>
                {getInningHalfLabel(inning, inningHalf)} · {batter.slot}棒{' '}
                {batter.name.trim() || '未命名選手'} ·{' '}
                <span className="font-semibold text-slate-800">
                  {def.label} ({def.code})
                </span>
                {dirDef && (
                  <span className="font-semibold text-[#1E3A8A]">
                    {' '}
                    · {dirDef.label}
                  </span>
                )}
                {typeDef && (
                  <span className="font-semibold text-[#1E3A8A]">
                    {' '}
                    · {typeDef.label}
                  </span>
                )}
              </span>
            ) : (
              '點選 0～4 打點並按得分按鈕計數，於第三區塊選擇打席結果後即可送出'
            )}
          </p>
        </div>

        {(selectedOutcome !== null ||
          selectedHitDirection !== null ||
          selectedHitType !== null ||
          rbi > 0 ||
          runsScored > 0) && (
          <button
            type="button"
            onClick={onResetPending}
            className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>重設</span>
          </button>
        )}
      </div>

      {/* RBI 0~4 Selector */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-700">
            打點數（RBI）
          </span>
          <span className="font-mono-tabular text-xs font-bold text-amber-700">
            {rbi} 打點
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2" role="group" aria-label="打點數">
          {SCORE_OPTIONS.map((num) => {
            const isSelected = rbi === num;
            return (
              <button
                key={`rbi-${num}`}
                type="button"
                onClick={() => onSelectRbi(num)}
                aria-pressed={isSelected}
                className={`min-h-[46px] rounded-xl border font-display-num text-lg font-bold transition-all active:scale-[0.97] flex items-center justify-center ${
                  isSelected
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Runs Scored Counter Button */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-700">
            得分數（R）
          </span>
          <span className="font-mono-tabular text-xs font-bold text-emerald-700">
            目前計數：{runsScored} 得分
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectRuns(runsScored + 1)}
            className="flex-1 min-h-[48px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>增加得分 (+1)</span>
            <span className="font-display-num text-xl font-bold ml-1 tabular-nums">
              {runsScored}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectRuns(Math.max(0, runsScored - 1))}
            disabled={runsScored === 0}
            aria-label="減少得分"
            className={`min-h-[48px] min-w-[48px] rounded-xl border flex items-center justify-center transition-colors active:scale-[0.97] ${
              runsScored > 0
                ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSelectRuns(0)}
            disabled={runsScored === 0}
            className={`min-h-[48px] px-3.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap active:scale-[0.97] ${
              runsScored > 0
                ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
          >
            歸零
          </button>
        </div>
      </div>

      {/* Compact Outs & Post-play Bases Adjustments */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">造成出局數</span>
          <button
            type="button"
            onClick={() => onChangeOutsRecorded(Math.max(0, outsRecorded - 1))}
            aria-label="減少造成出局數"
            className="min-h-[38px] min-w-[38px] rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-800"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono-tabular text-sm font-bold w-5 text-center text-rose-700">
            {outsRecorded}
          </span>
          <button
            type="button"
            onClick={() =>
              onChangeOutsRecorded(
                Math.min(Math.max(0, 3 - currentOuts), outsRecorded + 1)
              )
            }
            aria-label="增加造成出局數"
            className="min-h-[38px] min-w-[38px] rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-800"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5" role="group" aria-label="打席後壘包">
          <span className="text-xs font-semibold text-slate-600 mr-1">
            打席後壘包
          </span>
          {(
            [
              { key: 'first', label: '一壘' },
              { key: 'second', label: '二壘' },
              { key: 'third', label: '三壘' },
            ] as const
          ).map(({ key, label }) => {
            const occupied = basesAfter[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggleBaseAfter(key)}
                aria-pressed={occupied}
                className={`min-h-[38px] px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                  occupied
                    ? 'bg-amber-500 border-amber-600 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm Submit Action */}
      <div className="pt-1">
        {!def ? (
          <button
            type="button"
            disabled
            className="w-full h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-semibold text-sm flex items-center justify-center cursor-not-allowed"
          >
            請先於第三區塊選擇打席結果
          </button>
        ) : isThirdOut ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onConfirm(true)}
              className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Check className="w-4 h-4" />
              <span>紀錄並推進下一半局</span>
            </button>
            <button
              type="button"
              onClick={() => onConfirm(false)}
              className="w-full h-12 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm flex items-center justify-center active:scale-[0.98] transition-transform"
            >
              僅紀錄（不換局）
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onConfirm(false)}
            className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Check className="w-4 h-4" />
            <span>
              確認紀錄：{def.label}（{rbi} 打點 · {runsScored} 得分）
            </span>
          </button>
        )}
      </div>
    </section>
  );
};
