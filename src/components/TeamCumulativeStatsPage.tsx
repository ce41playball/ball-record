import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Copy,
  FileSpreadsheet,
  Search,
  X,
} from 'lucide-react';
import {
  CumulativePlayerStats,
  GameRecord,
  HitDirectionCode,
} from '../types/baseball';
import {
  calculateCumulativeTeamStats,
  formatAvg,
  formatCumulativeTeamSummaryText,
  formatGroundFlyRatio,
  generateCumulativeTeamCsv,
  HIT_DIRECTION_DEFINITIONS,
  HIT_DIRECTION_GROUPS,
  HIT_TYPE_CODES,
  HIT_TYPE_DEFINITIONS,
} from '../utils/baseballEngine';

type SortKey =
  | 'pa'
  | 'gamesPlayed'
  | 'ab'
  | 'h'
  | 'singles'
  | 'doubles'
  | 'triples'
  | 'hr'
  | 'tb'
  | 'rbi'
  | 'bb'
  | 'hbp'
  | 'so'
  | 'sacSf'
  | 'avg'
  | 'obp'
  | 'slg'
  | 'ops';

interface TeamCumulativeStatsPageProps {
  games: GameRecord[];
  activeGameId: string;
  onJumpToGame: (gameId: string) => void;
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

export const TeamCumulativeStatsPage: React.FC<
  TeamCumulativeStatsPageProps
> = ({ games, activeGameId, onJumpToGame }) => {
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyWithPa, setOnlyWithPa] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('pa');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [selectedPlayerKey, setSelectedPlayerKey] = useState<string | null>(
    null
  );
  const [copiedSummary, setCopiedSummary] = useState(false);

  const { players, totals, availableTeams } = useMemo(
    () => calculateCumulativeTeamStats(games, teamFilter),
    [games, teamFilter]
  );

  const effectiveTeamLabel =
    teamFilter !== 'all'
      ? teamFilter
      : availableTeams.length === 1
      ? availableTeams[0]
      : '全部隊伍';

  const filteredAndSortedPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = players.filter((p) => {
      if (onlyWithPa && p.pa === 0) return false;
      if (query) {
        const matchName = p.name.toLowerCase().includes(query);
        const matchNum = p.number.toLowerCase().includes(query);
        const matchPos = p.position.toLowerCase().includes(query);
        if (!matchName && !matchNum && !matchPos) return false;
      }
      return true;
    });

    const getNumericVal = (p: CumulativePlayerStats, key: SortKey): number => {
      switch (key) {
        case 'sacSf':
          return p.sac + p.sf;
        case 'avg':
          return p.avg ?? -1;
        case 'obp':
          return p.obp ?? -1;
        case 'slg':
          return p.slg ?? -1;
        case 'ops':
          return p.ops ?? -1;
        default:
          return p[key];
      }
    };

    return list.slice().sort((a, b) => {
      const valA = getNumericVal(a, sortKey);
      const valB = getNumericVal(b, sortKey);
      if (valA !== valB) {
        return sortDir === 'desc' ? valB - valA : valA - valB;
      }
      if (b.pa !== a.pa) return b.pa - a.pa;
      return a.lastSlot - b.lastSlot;
    });
  }, [players, onlyWithPa, searchQuery, sortKey, sortDir]);

  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerKey) return null;
    return players.find((p) => p.key === selectedPlayerKey) ?? null;
  }, [players, selectedPlayerKey]);

  const activeSprayDirections = selectedPlayer
    ? selectedPlayer.hitDirections
    : totals.hitDirections;
  const activeSprayTypes = selectedPlayer
    ? selectedPlayer.hitTypes
    : totals.hitTypes;
  const sprayOutfieldPct =
    activeSprayDirections.totalRecorded > 0
      ? Math.round(
          (activeSprayDirections.outfieldCount /
            activeSprayDirections.totalRecorded) *
            100
        )
      : 0;
  const sprayInfieldPct =
    activeSprayDirections.totalRecorded > 0 ? 100 - sprayOutfieldPct : 0;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleCopySummary = async () => {
    const text = formatCumulativeTeamSummaryText(
      filteredAndSortedPlayers,
      totals,
      effectiveTeamLabel
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      downloadTextFile(
        text,
        `${effectiveTeamLabel}_團隊打擊成績摘要.txt`,
        'text/plain;charset=utf-8'
      );
    }
  };

  const handleExportCsv = () => {
    const csv = generateCumulativeTeamCsv(
      filteredAndSortedPlayers,
      totals,
      effectiveTeamLabel
    );
    downloadTextFile(
      csv,
      `${effectiveTeamLabel}_團隊累積打擊成績.csv`,
      'text/csv;charset=utf-8'
    );
  };

  const sortColumns: { key: SortKey; label: string; title: string }[] = [
    { key: 'gamesPlayed', label: '場數', title: '出賽場數' },
    { key: 'pa', label: '打席', title: '打席 (PA)' },
    { key: 'ab', label: '打數', title: '打數 (AB)' },
    { key: 'h', label: '安打', title: '安打 (H)' },
    { key: 'singles', label: '一安', title: '一壘安打 (1B)' },
    { key: 'doubles', label: '二安', title: '二壘安打 (2B)' },
    { key: 'triples', label: '三安', title: '三壘安打 (3B)' },
    { key: 'hr', label: '全壘', title: '全壘打 (HR)' },
    { key: 'tb', label: '壘打', title: '壘打數 (TB)' },
    { key: 'rbi', label: '打點', title: '打點 (RBI)' },
    { key: 'bb', label: '四壞', title: '四壞保送 (BB)' },
    { key: 'hbp', label: '觸身', title: '觸身球 (HBP)' },
    { key: 'so', label: '三振', title: '三振 (SO)' },
    { key: 'sacSf', label: '犧牲', title: '犧牲觸擊 + 高飛犧牲打' },
    { key: 'avg', label: '打擊率', title: '打擊率 (AVG)' },
    { key: 'obp', label: '上壘率', title: '上壘率 (OBP)' },
    { key: 'slg', label: '長打率', title: '長打率 (SLG)' },
    { key: 'ops', label: 'OPS', title: '整體攻擊指數 (OPS)' },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header & Actions */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              團隊打擊成績
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 font-mono-tabular">
              <span>{effectiveTeamLabel}</span>
              <span aria-hidden="true">·</span>
              <span>本機累積 {totals.gamesCount} 場比賽</span>
              <span aria-hidden="true">·</span>
              <span>{totals.activePlayersCount} 位出賽選手</span>
              <span aria-hidden="true">·</span>
              <span>共 {totals.pa} 打席</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySummary}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>已複製摘要</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>複製摘要</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>匯出 CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search
                className="w-4 h-4 text-slate-400 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋選手姓名、背號或守位"
                aria-label="搜尋選手"
                className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-[#1E3A8A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="清除搜尋"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {availableTeams.length > 1 && (
              <select
                value={teamFilter}
                onChange={(e) => {
                  setTeamFilter(e.target.value);
                  setSelectedPlayerKey(null);
                }}
                aria-label="篩選隊伍"
                className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="all">全部隊伍 ({availableTeams.length})</option>
                {availableTeams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div
            className="inline-flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto shrink-0"
            role="group"
            aria-label="選手顯示篩選"
          >
            <button
              type="button"
              onClick={() => setOnlyWithPa(false)}
              aria-pressed={!onlyWithPa}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                !onlyWithPa
                  ? 'bg-white text-[#1E3A8A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部名單 ({players.length})
            </button>
            <button
              type="button"
              onClick={() => setOnlyWithPa(true)}
              aria-pressed={onlyWithPa}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                onlyWithPa
                  ? 'bg-white text-[#1E3A8A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              僅有打席 ({totals.activePlayersCount})
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column Team KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500">團隊打擊率</div>
          <div className="font-display-num text-3xl font-bold text-[#1E3A8A]">
            {formatAvg(totals.avg)}
          </div>
          <div className="text-xs text-slate-500 font-mono-tabular truncate">
            OBP {formatAvg(totals.obp)} · SLG {formatAvg(totals.slg)} · OPS{' '}
            {formatAvg(totals.ops)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500">
            累積安打／全壘打
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-num text-3xl font-bold text-slate-900">
              {totals.h}
            </span>
            <span className="text-xs font-semibold text-slate-500">安打</span>
            <span className="text-slate-300" aria-hidden="true">
              /
            </span>
            <span className="font-display-num text-2xl font-bold text-rose-600">
              {totals.hr}
            </span>
            <span className="text-xs font-semibold text-slate-500">全壘打</span>
          </div>
          <div className="text-xs text-slate-500 font-mono-tabular">
            一安 {totals.singles} · 二安 {totals.doubles} · 三安{' '}
            {totals.triples}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500">
            累積得分／打點
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-num text-3xl font-bold text-emerald-700">
              {totals.runs}
            </span>
            <span className="text-xs font-semibold text-slate-500">得分</span>
            <span className="text-slate-300" aria-hidden="true">
              /
            </span>
            <span className="font-display-num text-2xl font-bold text-slate-900">
              {totals.rbi}
            </span>
            <span className="text-xs font-semibold text-slate-500">打點</span>
          </div>
          <div className="text-xs text-slate-500 font-mono-tabular">
            {totals.ab} 打數 · {totals.pa} 打席 · 壘打數 {totals.tb}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500">
            選球與滾飛比
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-num text-3xl font-bold text-slate-900">
              {totals.bb + totals.hbp}
            </span>
            <span className="text-xs font-semibold text-slate-500">四死球</span>
            <span className="text-slate-300" aria-hidden="true">
              /
            </span>
            <span className="font-display-num text-2xl font-bold text-slate-700">
              {totals.so}
            </span>
            <span className="text-xs font-semibold text-slate-500">三振</span>
          </div>
          <div className="text-xs text-slate-500 font-mono-tabular truncate">
            滾飛比 {formatGroundFlyRatio(totals.hitTypes)}
          </div>
        </div>
      </section>

      {/* Main Cumulative Player Batting Stats Table */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              選手個人累積打擊數據
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              依選手姓名自動合併本機所有場次紀錄；點選任一選手列可查看逐場明細與擊球分佈
            </p>
          </div>
          <span className="text-xs font-mono-tabular text-slate-500">
            顯示 {filteredAndSortedPlayers.length} 位選手
          </span>
        </div>

        {filteredAndSortedPlayers.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            查無符合條件的選手紀錄，請調整搜尋關鍵字或篩選條件。
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-3 font-semibold whitespace-nowrap sticky left-0 bg-white z-10 min-w-[96px]">
                    選手
                  </th>
                  {sortColumns.map((col) => {
                    const isSorted = sortKey === col.key;
                    return (
                      <th
                        key={col.key}
                        title={col.title}
                        className="py-2.5 px-2 text-center font-semibold whitespace-nowrap"
                      >
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className={`inline-flex items-center justify-center gap-0.5 hover:text-[#1E3A8A] transition-colors whitespace-nowrap ${
                            isSorted ? 'text-[#1E3A8A] font-bold' : ''
                          }`}
                        >
                          <span>{col.label}</span>
                          {isSorted ? (
                            sortDir === 'desc' ? (
                              <ArrowDown className="w-3 h-3" aria-hidden="true" />
                            ) : (
                              <ArrowUp className="w-3 h-3" aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown
                              className="w-3 h-3 opacity-35"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </th>
                    );
                  })}
                  <th className="py-2.5 px-2 text-center font-semibold whitespace-nowrap">
                    滾飛比
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedPlayers.map((p) => {
                  const isSelected = selectedPlayerKey === p.key;
                  return (
                    <tr
                      key={p.key}
                      onClick={() =>
                        setSelectedPlayerKey((prev) =>
                          prev === p.key ? null : p.key
                        )
                      }
                      className={`border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70'
                          : 'hover:bg-slate-50/90'
                      }`}
                    >
                      <td
                        className={`py-2.5 pr-3 sticky left-0 z-10 whitespace-nowrap ${
                          isSelected ? 'bg-blue-50' : 'bg-white'
                        }`}
                      >
                        <span
                          className={`font-semibold ${
                            isSelected ? 'text-[#1E3A8A]' : 'text-slate-900'
                          }`}
                        >
                          {p.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-600">
                        {p.gamesPlayed}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-700">
                        {p.pa}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-700">
                        {p.ab}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular font-semibold text-slate-900">
                        {p.h}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-600">
                        {p.singles}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-600">
                        {p.doubles}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-600">
                        {p.triples}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-center font-mono-tabular ${
                          p.hr > 0
                            ? 'font-bold text-rose-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {p.hr}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-700">
                        {p.tb}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-700">
                        {p.rbi}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-700">
                        {p.bb}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-600">
                        {p.hbp}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-700">
                        {p.so}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-600">
                        {p.sac + p.sf}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular font-bold text-slate-900">
                        {formatAvg(p.avg)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-700">
                        {formatAvg(p.obp)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-700">
                        {formatAvg(p.slg)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular font-bold text-[#1E3A8A]">
                        {formatAvg(p.ops)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono-tabular text-slate-600 whitespace-nowrap">
                        {formatGroundFlyRatio(p.hitTypes)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/90 text-slate-900">
                  <td className="py-2.5 pr-3 font-bold text-[#1E3A8A] whitespace-nowrap sticky left-0 bg-slate-50 z-10">
                    全隊合計
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.gamesCount}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.pa}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.ab}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold text-[#1E3A8A]">
                    {totals.h}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.singles}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.doubles}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.triples}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold text-rose-600">
                    {totals.hr}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.tb}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.rbi}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.bb}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.hbp}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.so}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {totals.sac + totals.sf}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold text-[#1E3A8A]">
                    {formatAvg(totals.avg)}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {formatAvg(totals.obp)}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold">
                    {formatAvg(totals.slg)}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold text-[#1E3A8A]">
                    {formatAvg(totals.ops)}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono-tabular font-bold whitespace-nowrap">
                    {formatGroundFlyRatio(totals.hitTypes)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Player Game-by-Game Detail + Cumulative Spray Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Selected Player Breakdown OR Local Games Overview */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          {selectedPlayer ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedPlayer.name} · 逐場打擊明細
                  </h2>
                  <div className="text-xs text-slate-500 font-mono-tabular mt-0.5">
                    出賽 {selectedPlayer.gamesPlayed} 場 · 打擊率{' '}
                    {formatAvg(selectedPlayer.avg)} · 上壘率{' '}
                    {formatAvg(selectedPlayer.obp)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlayerKey(null)}
                  className="min-h-[36px] px-3 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  切回全隊視野
                </button>
              </div>

              {selectedPlayer.gameBreakdown.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  此選手尚未有打席紀錄。
                </div>
              ) : (
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-2 font-semibold whitespace-nowrap">
                          比賽場次
                        </th>
                        <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                          打席
                        </th>
                        <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                          打數
                        </th>
                        <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                          安打
                        </th>
                        <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                          全壘
                        </th>
                        <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                          打點
                        </th>
                        <th className="py-2 px-1.5 text-right font-semibold whitespace-nowrap">
                          四壞
                        </th>
                        <th className="py-2 pl-2 text-right font-semibold whitespace-nowrap">
                          三振
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlayer.gameBreakdown.map((gb) => (
                        <tr
                          key={gb.gameId}
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <td className="py-2.5 pr-2">
                            <button
                              type="button"
                              onClick={() => onJumpToGame(gb.gameId)}
                              className="text-left group"
                            >
                              <div className="font-semibold text-slate-900 group-hover:text-[#1E3A8A] transition-colors">
                                {gb.title}
                                {gb.gameId === activeGameId && (
                                  <span className="ml-1.5 text-[11px] font-semibold text-emerald-700">
                                    目前場次
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono-tabular">
                                {gb.date} · {gb.teamName} vs {gb.opponentName}
                              </div>
                            </button>
                          </td>
                          <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                            {gb.pa}
                          </td>
                          <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                            {gb.ab}
                          </td>
                          <td className="py-2.5 px-1.5 text-right font-mono-tabular font-semibold text-slate-900">
                            {gb.h}
                          </td>
                          <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                            {gb.hr}
                          </td>
                          <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                            {gb.rbi}
                          </td>
                          <td className="py-2.5 px-1.5 text-right font-mono-tabular text-slate-700">
                            {gb.bb}
                          </td>
                          <td className="py-2.5 pl-2 text-right font-mono-tabular text-slate-700">
                            {gb.so}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    納入彙整之本機比賽紀錄
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    點選上方選手列可單獨檢視該選手逐場明細，或點選下方比賽切換至單場紀錄
                  </p>
                </div>
                <span className="text-xs font-mono-tabular text-slate-500 shrink-0">
                  共 {games.length} 場
                </span>
              </div>

              <ul className="divide-y divide-slate-100">
                {games
                  .filter((g) =>
                    teamFilter === 'all'
                      ? true
                      : g.teamName.trim() === teamFilter
                  )
                  .map((g) => {
                    const gameRuns = g.plateAppearances.reduce(
                      (s, pa) => s + pa.runsScored,
                      0
                    );
                    const isCurrent = g.id === activeGameId;
                    return (
                      <li
                        key={g.id}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {g.title}
                            </span>
                            {isCurrent && (
                              <span className="text-xs font-semibold text-emerald-700 shrink-0">
                                目前場次
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono-tabular">
                            {g.date} · {g.teamName} {gameRuns} :{' '}
                            {g.opponentScore} {g.opponentName} ·{' '}
                            {g.plateAppearances.length} 打席
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onJumpToGame(g.id)}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-[#1E3A8A] whitespace-nowrap shrink-0"
                        >
                          開啟場次
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </>
          )}
        </section>

        {/* Right: Cumulative Hit Direction & Type Distribution (Team or Selected Player) */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {selectedPlayer
                ? `${selectedPlayer.name} · 累積擊球分佈`
                : '全隊累積擊球方向與型態'}
            </h2>
            <div className="font-mono-tabular text-xs text-slate-500 mt-0.5">
              <span>共 {activeSprayDirections.totalRecorded} 球</span>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              <span>
                外野 {activeSprayDirections.outfieldCount} ({sprayOutfieldPct}%)
              </span>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              <span>
                內野 {activeSprayDirections.infieldCount} ({sprayInfieldPct}%)
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <svg
              viewBox="0 0 220 184"
              className="w-full max-w-[320px] h-auto"
              role="img"
              aria-label="累積擊球方向分佈圖"
            >
              <path
                d="M 110 162 L 16 74 A 132 132 0 0 1 204 74 Z"
                fill="#ECFDF5"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <path
                d="M 110 162 L 50 106 A 84 84 0 0 1 170 106 Z"
                fill="#FEF3C7"
                fillOpacity="0.65"
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <polygon
                points="110,88 146,124 110,160 74,124"
                fill="#FFFFFF"
                fillOpacity="0.8"
                stroke="#CBD5E1"
                strokeWidth="1.2"
              />
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
                  const count = activeSprayDirections.byCode[code];
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

          <div className="space-y-2.5">
            {HIT_DIRECTION_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {group.title}
                  </span>
                  <span className="font-mono-tabular text-slate-500">
                    {group.id === 'outfield'
                      ? `${activeSprayDirections.outfieldCount} 球 (${sprayOutfieldPct}%)`
                      : `${activeSprayDirections.infieldCount} 球 (${sprayInfieldPct}%)`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {group.codes.map((code) => {
                    const def = HIT_DIRECTION_DEFINITIONS[code];
                    const count = activeSprayDirections.byCode[code];
                    const pct =
                      activeSprayDirections.totalRecorded > 0
                        ? Math.round(
                            (count / activeSprayDirections.totalRecorded) * 100
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
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-semibold text-slate-700">擊球型態</span>
                  <span className="text-slate-400" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono-tabular font-semibold text-[#1E3A8A]">
                    滾飛比 {formatGroundFlyRatio(activeSprayTypes)}
                  </span>
                </div>
                <span className="font-mono-tabular text-slate-500">
                  共 {activeSprayTypes.totalRecorded} 球
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {HIT_TYPE_CODES.map((code) => {
                  const def = HIT_TYPE_DEFINITIONS[code];
                  const count = activeSprayTypes.byCode[code];
                  const pct =
                    activeSprayTypes.totalRecorded > 0
                      ? Math.round(
                          (count / activeSprayTypes.totalRecorded) * 100
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
        </section>
      </div>
    </div>
  );
};

function downloadTextFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
