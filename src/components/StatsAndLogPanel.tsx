import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { GameRecord, HitDirectionCode } from '../types/baseball';
import {
  calculateHitDirectionStats,
  calculateHitTypeStats,
  calculateInningRuns,
  calculatePlayerStats,
  formatAvg,
  getInningHalfLabel,
  HIT_DIRECTION_DEFINITIONS,
  HIT_DIRECTION_GROUPS,
  HIT_TYPE_CODES,
  HIT_TYPE_DEFINITIONS,
  OUTCOME_DEFINITIONS,
} from '../utils/baseballEngine';

interface StatsAndLogPanelProps {
  game: GameRecord;
  onDeletePlateAppearance: (paId: string) => void;
}

const FIELD_ZONE_COORDS: Record<
  HitDirectionCode,
  { x: number; y: number; short: string }
> = {
  LF: { x: 48, y: 54, short: '左外' },
  CF: { x: 110, y: 34, short: '中外' },
  RF: { x: 172, y: 54, short: '右外' },
  SS: { x: 80, y: 92, short: '游擊' },
  '2B': { x: 140, y: 92, short: '二壘' },
  '3B': { x: 64, y: 120, short: '三壘' },
  '1B': { x: 156, y: 120, short: '一壘' },
  P: { x: 110, y: 124, short: '投手' },
  C: { x: 110, y: 164, short: '捕手' },
};

export const StatsAndLogPanel: React.FC<StatsAndLogPanelProps> = ({
  game,
  onDeletePlateAppearance,
}) => {
  const [directionBatterFilter, setDirectionBatterFilter] = useState<
    number | 'all'
  >('all');
  const { players, totals } = calculatePlayerStats(
    game.lineup,
    game.plateAppearances
  );
  const inningRuns = calculateInningRuns(
    game.plateAppearances,
    game.maxInnings
  );

  const scheduledPlayers = players.filter(
    (p) => p.slot <= 9 || p.name.trim() !== '' || p.pa > 0
  );
  const directionStats = calculateHitDirectionStats(
    game.plateAppearances,
    directionBatterFilter
  );
  const hitTypeStats = calculateHitTypeStats(
    game.plateAppearances,
    directionBatterFilter
  );
  const outfieldPct =
    directionStats.totalRecorded > 0
      ? Math.round(
          (directionStats.outfieldCount / directionStats.totalRecorded) * 100
        )
      : 0;
  const infieldPct =
    directionStats.totalRecorded > 0 ? 100 - outfieldPct : 0;
  const chronologicalLogs = game.plateAppearances;

  return (
    <div className="space-y-4">
      {/* Inning-by-Inning Line Score & Team Totals */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            比賽結果
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
              {game.teamAttackOrder === 'second' ? (
                <>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 px-2 text-left font-sans font-medium text-slate-600 whitespace-nowrap">
                      {game.opponentName}
                    </td>
                    {inningRuns.map((item) => (
                      <td
                        key={item.inning}
                        className="py-2.5 px-2 text-slate-400"
                      >
                        -
                      </td>
                    ))}
                    <td className="py-2.5 px-2.5 font-bold text-slate-900 border-l border-slate-200">
                      {game.opponentScore}
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-400">-</td>
                  </tr>
                  <tr>
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
                </>
              ) : (
                <>
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
                      <td
                        key={item.inning}
                        className="py-2.5 px-2 text-slate-400"
                      >
                        -
                      </td>
                    ))}
                    <td className="py-2.5 px-2.5 font-bold text-slate-900 border-l border-slate-200">
                      {game.opponentScore}
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-400">-</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 1~15 Batting Box Score */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900">
            團隊打擊紀錄
          </h2>
          <span className="text-xs text-slate-500 font-mono-tabular">
            團隊打點 {totals.rbi} · 保送 {totals.bb} · 全壘打 {totals.hr}
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
                  全壘打
                </th>
                <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                  打點
                </th>
                <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                  保送
                </th>
                <th className="py-2 pl-2 text-right font-semibold whitespace-nowrap">
                  打擊率
                </th>
              </tr>
            </thead>
            <tbody>
              {scheduledPlayers.map((p) => (
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
                    {p.hr}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                    {p.rbi}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                    {p.bb}
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

      {/* Hit Direction Statistics */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              擊球方向與型態統計
            </h2>
            <div className="font-mono-tabular text-xs text-slate-500 mt-0.5">
              <span>共 {directionStats.totalRecorded} 球</span>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              <span>
                外野 {directionStats.outfieldCount} ({outfieldPct}%)
              </span>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              <span>
                內野 {directionStats.infieldCount} ({infieldPct}%)
              </span>
            </div>
          </div>

          <select
            aria-label="篩選打者擊球方向統計"
            value={directionBatterFilter}
            onChange={(e) => {
              const val = e.target.value;
              setDirectionBatterFilter(val === 'all' ? 'all' : Number(val));
            }}
            className="min-h-[38px] px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
          >
            <option value="all">全隊擊球分佈</option>
            {scheduledPlayers.map((p) => (
              <option key={p.slot} value={p.slot}>
                {p.slot}棒 {p.name.trim() || '未命名選手'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Baseball Field Spray Zone Visual */}
          <div className="sm:col-span-5 flex justify-center">
            <svg
              viewBox="0 0 220 184"
              className="w-full max-w-[220px] h-auto"
              role="img"
              aria-label="球場擊球方向分佈圖"
            >
              {/* Outfield Grass Sector */}
              <path
                d="M 110 162 L 16 74 A 132 132 0 0 1 204 74 Z"
                fill="#ECFDF5"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              {/* Infield Dirt Arc */}
              <path
                d="M 110 162 L 50 106 A 84 84 0 0 1 170 106 Z"
                fill="#FEF3C7"
                fillOpacity="0.65"
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              {/* Infield Diamond */}
              <polygon
                points="110,88 146,124 110,160 74,124"
                fill="#FFFFFF"
                fillOpacity="0.8"
                stroke="#CBD5E1"
                strokeWidth="1.2"
              />
              {/* Foul Lines */}
              <line
                x1="110"
                y1="162"
                x2="16"
                y2="74"
                stroke="#94A3B8"
                strokeWidth="1.2"
              />
              <line
                x1="110"
                y1="162"
                x2="204"
                y2="74"
                stroke="#94A3B8"
                strokeWidth="1.2"
              />

              {(Object.keys(FIELD_ZONE_COORDS) as HitDirectionCode[]).map(
                (code) => {
                  const pos = FIELD_ZONE_COORDS[code];
                  const count = directionStats.byCode[code];
                  const hasCount = count > 0;
                  return (
                    <g key={code}>
                      <rect
                        x={pos.x - 19}
                        y={pos.y - 13}
                        width="38"
                        height="26"
                        rx="7"
                        fill={hasCount ? '#1E3A8A' : '#FFFFFF'}
                        fillOpacity={hasCount ? 1 : 0.92}
                        stroke={hasCount ? '#1E3A8A' : '#CBD5E1'}
                        strokeWidth="1.2"
                      />
                      <text
                        x={pos.x}
                        y={pos.y - 2}
                        textAnchor="middle"
                        className="font-sans"
                        fontSize="8.5"
                        fontWeight="600"
                        fill={hasCount ? '#DBEAFE' : '#475569'}
                      >
                        {pos.short}
                      </text>
                      <text
                        x={pos.x}
                        y={pos.y + 9}
                        textAnchor="middle"
                        className="font-mono-tabular"
                        fontSize="10"
                        fontWeight="700"
                        fill={hasCount ? '#FFFFFF' : '#94A3B8'}
                      >
                        {count}
                      </text>
                    </g>
                  );
                }
              )}
            </svg>
          </div>

          {/* Zone Breakdown Counts */}
          <div className="sm:col-span-7 space-y-2.5">
            {HIT_DIRECTION_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {group.title}
                  </span>
                  <span className="font-mono-tabular text-slate-500">
                    {group.id === 'outfield'
                      ? `${directionStats.outfieldCount} 球 (${outfieldPct}%)`
                      : `${directionStats.infieldCount} 球 (${infieldPct}%)`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {group.codes.map((code) => {
                    const def = HIT_DIRECTION_DEFINITIONS[code];
                    const count = directionStats.byCode[code];
                    const pct =
                      directionStats.totalRecorded > 0
                        ? Math.round(
                            (count / directionStats.totalRecorded) * 100
                          )
                        : 0;
                    return (
                      <div
                        key={code}
                        className={`px-2 py-1.5 rounded-lg border text-xs flex items-center justify-between gap-1 ${
                          count > 0
                            ? 'bg-blue-50/60 border-blue-200 text-slate-900'
                            : 'bg-slate-50/70 border-slate-100 text-slate-500'
                        }`}
                      >
                        <span className="font-medium truncate">
                          {def.label}
                        </span>
                        <span className="font-mono-tabular font-bold shrink-0">
                          {count}
                          {count > 0 && (
                            <span className="text-[10px] font-normal text-slate-500 ml-0.5">
                              ({pct}%)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-slate-700">擊球型態</span>
                <span className="font-mono-tabular text-slate-500">
                  共 {hitTypeStats.totalRecorded} 球
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {HIT_TYPE_CODES.map((code) => {
                  const def = HIT_TYPE_DEFINITIONS[code];
                  const count = hitTypeStats.byCode[code];
                  const pct =
                    hitTypeStats.totalRecorded > 0
                      ? Math.round(
                          (count / hitTypeStats.totalRecorded) * 100
                        )
                      : 0;
                  return (
                    <div
                      key={code}
                      className={`px-2 py-1.5 rounded-lg border text-xs flex items-center justify-between gap-1 ${
                        count > 0
                          ? 'bg-sky-50/75 border-sky-200 text-slate-900'
                          : 'bg-slate-50/70 border-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="font-medium truncate">{def.label}</span>
                      <span className="font-mono-tabular font-bold shrink-0">
                        {count}
                        {count > 0 && (
                          <span className="text-[10px] font-normal text-slate-500 ml-0.5">
                            ({pct}%)
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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

        {chronologicalLogs.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            尚未有任何打席紀錄，請從「記分輸入」點選局數、棒次與打席結果。
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {chronologicalLogs.map((pa, idx) => {
              const def = OUTCOME_DEFINITIONS[pa.outcome];
              const categoryColor =
                def.category === 'hit'
                  ? 'text-emerald-700'
                  : def.category === 'reach'
                  ? 'text-amber-700'
                  : 'text-rose-700';

              const occupiedBases = [
                pa.basesAfter.first ? '一壘' : null,
                pa.basesAfter.second ? '二壘' : null,
                pa.basesAfter.third ? '三壘' : null,
              ].filter(Boolean);
              const basesLabel =
                occupiedBases.length === 3
                  ? '滿壘'
                  : occupiedBases.length > 0
                  ? occupiedBases.join('、')
                  : '壘上無人';

              return (
                <li
                  key={pa.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono-tabular">
                        #{idx + 1}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700">
                        {getInningHalfLabel(pa.inning, pa.inningHalf)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">
                        {pa.batterSlot}棒 {pa.batterName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                      <span className={`font-bold ${categoryColor}`}>
                        {def.label} ({def.code})
                      </span>
                      {pa.hitDirection &&
                        HIT_DIRECTION_DEFINITIONS[pa.hitDirection] && (
                          <span className="text-xs font-semibold text-[#1E3A8A]">
                            · {HIT_DIRECTION_DEFINITIONS[pa.hitDirection].label}
                          </span>
                        )}
                      {pa.hitType && HIT_TYPE_DEFINITIONS[pa.hitType] && (
                        <span className="text-xs font-semibold text-sky-700">
                          · {HIT_TYPE_DEFINITIONS[pa.hitType].label}
                        </span>
                      )}
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
                      <span
                        className={`text-xs font-mono-tabular ${
                          pa.outsAfter >= 3
                            ? 'text-rose-700 font-semibold'
                            : 'text-slate-500'
                        }`}
                      >
                        · {pa.outsAfter} 出局
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <svg
                        viewBox="0 0 24 22"
                        className="w-4 h-3.5 shrink-0"
                        aria-hidden="true"
                      >
                        <polygon
                          points="12,1 16,5 12,9 8,5"
                          className={
                            pa.basesAfter.second
                              ? 'fill-amber-500 stroke-amber-700'
                              : 'fill-white stroke-slate-400'
                          }
                          strokeWidth="1.5"
                        />
                        <polygon
                          points="5,8 9,12 5,16 1,12"
                          className={
                            pa.basesAfter.third
                              ? 'fill-amber-500 stroke-amber-700'
                              : 'fill-white stroke-slate-400'
                          }
                          strokeWidth="1.5"
                        />
                        <polygon
                          points="19,8 23,12 19,16 15,12"
                          className={
                            pa.basesAfter.first
                              ? 'fill-amber-500 stroke-amber-700'
                              : 'fill-white stroke-slate-400'
                          }
                          strokeWidth="1.5"
                        />
                      </svg>
                      <span>打席後：{basesLabel}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeletePlateAppearance(pa.id)}
                    aria-label={`刪除第 ${idx + 1} 筆紀錄`}
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
