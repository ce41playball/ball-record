import React from 'react';
import { Trash2 } from 'lucide-react';
import { GameRecord } from '../types/baseball';
import {
  calculateInningRuns,
  calculatePlayerStats,
  formatAvg,
  getInningHalfLabel,
  OUTCOME_DEFINITIONS,
} from '../utils/baseballEngine';

interface StatsAndLogPanelProps {
  game: GameRecord;
  onDeletePlateAppearance: (paId: string) => void;
}

export const StatsAndLogPanel: React.FC<StatsAndLogPanelProps> = ({
  game,
  onDeletePlateAppearance,
}) => {
  const { players, totals } = calculatePlayerStats(
    game.lineup,
    game.plateAppearances
  );
  const inningRuns = calculateInningRuns(
    game.plateAppearances,
    game.maxInnings
  );

  const reversedLogs = [...game.plateAppearances].reverse();

  return (
    <div className="space-y-4">
      {/* Inning-by-Inning Line Score & Team Totals */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            逐局記分與團隊數據
          </h2>
          <div className="font-mono-tabular text-xs text-slate-500">
            <span>{totals.ab} 打數</span>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span>{totals.h} 安打</span>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span>AVG {formatAvg(totals.avg)}</span>
          </div>
        </div>

        {/* Scrollable inning line score */}
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-center border-collapse font-mono-tabular text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 px-2 text-left font-semibold whitespace-nowrap">
                  隊伍
                </th>
                {inningRuns.map((item) => (
                  <th
                    key={item.inning}
                    className={`py-2 px-2 font-semibold min-w-[28px] ${
                      game.currentInning === item.inning
                        ? 'text-[#1E3A8A] underline underline-offset-4'
                        : ''
                    }`}
                  >
                    {item.inning}
                  </th>
                ))}
                <th className="py-2 px-2.5 font-bold text-slate-900 border-l border-slate-200">
                  R
                </th>
                <th className="py-2 px-2.5 font-bold text-slate-900">H</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 px-2 text-left font-sans font-semibold text-slate-900 whitespace-nowrap">
                  {game.teamName}
                </td>
                {inningRuns.map((item) => (
                  <td
                    key={item.inning}
                    className={`py-2.5 px-2 ${
                      item.runs > 0
                        ? 'font-bold text-emerald-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {item.runs}
                  </td>
                ))}
                <td className="py-2.5 px-2.5 font-bold text-[#1E3A8A] border-l border-slate-200">
                  {totals.runs}
                </td>
                <td className="py-2.5 px-2.5 font-bold text-slate-900">
                  {totals.h}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-2 text-left font-sans font-medium text-slate-600 whitespace-nowrap">
                  {game.opponentName}
                </td>
                {inningRuns.map((item) => (
                  <td key={item.inning} className="py-2.5 px-2 text-slate-400">
                    -
                  </td>
                ))}
                <td className="py-2.5 px-2.5 font-bold text-slate-900 border-l border-slate-200">
                  {game.opponentScore}
                </td>
                <td className="py-2.5 px-2.5 text-slate-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 1~9 Batting Box Score */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900">
            個人打擊統計（1～9棒）
          </h2>
          <span className="text-xs text-slate-500 font-mono-tabular">
            團隊打點 {totals.rbi} · 保送 {totals.bb} · 三振 {totals.so}
          </span>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-2 font-semibold whitespace-nowrap">
                  棒次／球員
                </th>
                <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                  打數
                </th>
                <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                  安打
                </th>
                <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                  打點
                </th>
                <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                  保送
                </th>
                <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                  三振
                </th>
                <th className="py-2 pl-2 text-right font-semibold whitespace-nowrap">
                  打擊率
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr
                  key={p.slot}
                  className={`border-b border-slate-100 last:border-b-0 ${
                    p.slot === game.currentBatterSlot ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <td className="py-2.5 pr-2">
                    <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                      <span className="font-mono-tabular font-bold text-[#1E3A8A]">
                        {p.slot}棒
                      </span>
                      <span className="font-semibold text-slate-900">
                        {p.name}
                      </span>
                      {p.number && (
                        <span className="font-mono-tabular text-[11px] text-slate-400">
                          #{p.number}
                        </span>
                      )}
                    </div>
                    {p.outcomes.length > 0 && (
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[170px]">
                        {p.outcomes
                          .map((o) => OUTCOME_DEFINITIONS[o].shortLabel)
                          .join(' · ')}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                    {p.ab}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono-tabular font-semibold text-slate-900">
                    {p.h}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                    {p.rbi}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                    {p.bb}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                    {p.so}
                  </td>
                  <td className="py-2.5 pl-2 text-right font-mono-tabular font-bold text-slate-900">
                    {formatAvg(p.avg)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Play-by-Play Log */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold text-slate-900">逐席打擊流水紀錄</h2>
          <span className="font-mono-tabular text-xs text-slate-500">
            共 {game.plateAppearances.length} 打席
          </span>
        </div>

        {reversedLogs.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            尚未有任何打席紀錄，請從「記分輸入」點選局數、棒次與打席結果。
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reversedLogs.map((pa, idx) => {
              const def = OUTCOME_DEFINITIONS[pa.outcome];
              const categoryColor =
                def.category === 'hit'
                  ? 'text-emerald-700'
                  : def.category === 'reach'
                  ? 'text-amber-700'
                  : 'text-rose-700';

              return (
                <li
                  key={pa.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono-tabular">
                        #{game.plateAppearances.length - idx}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700">
                        {getInningHalfLabel(pa.inning, pa.inningHalf)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {pa.batterSlot}棒 {pa.batterName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                      <span className={`font-bold ${categoryColor}`}>
                        {def.label} ({def.code})
                      </span>
                      {pa.rbi > 0 && (
                        <span className="text-xs font-semibold text-amber-700 font-mono-tabular">
                          · {pa.rbi} 打點
                        </span>
                      )}
                      {pa.runsScored > 0 && (
                        <span className="text-xs font-semibold text-emerald-700 font-mono-tabular">
                          · 得分 +{pa.runsScored}
                        </span>
                      )}
                      {pa.outsRecorded > 0 && (
                        <span className="text-xs text-slate-500 font-mono-tabular">
                          · {pa.outsRecorded} 出局
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeletePlateAppearance(pa.id)}
                    aria-label={`刪除第 ${game.plateAppearances.length - idx} 筆紀錄`}
                    className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
