import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  Minus,
  Plus,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { GameRecord, PlayerLineupSlot } from '../types/baseball';
import {
  formatGameSummaryText,
  generateCsvExport,
} from '../utils/baseballEngine';

interface LineupAndExportPanelProps {
  activeGame: GameRecord;
  allGames: GameRecord[];
  onUpdateGameMeta: (patch: Partial<GameRecord>) => void;
  onUpdateLineupMember: (slot: number, patch: Partial<PlayerLineupSlot>) => void;
  onCreateNewGame: () => void;
  onSwitchGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
}

export const LineupAndExportPanel: React.FC<LineupAndExportPanelProps> = ({
  activeGame,
  allGames,
  onUpdateGameMeta,
  onUpdateLineupMember,
  onCreateNewGame,
  onSwitchGame,
  onDeleteGame,
}) => {
  const [copiedText, setCopiedText] = useState(false);

  const handleCopySummary = async () => {
    const summary = formatGameSummaryText(activeGame);
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback download if clipboard permission denied
      handleDownloadFile(
        summary,
        `${activeGame.title}_${activeGame.date}_戰報.txt`,
        'text/plain;charset=utf-8'
      );
    }
  };

  const handleDownloadCsv = () => {
    const csv = generateCsvExport(activeGame);
    handleDownloadFile(
      csv,
      `${activeGame.title}_${activeGame.date}_打擊紀錄.csv`,
      'text/csv;charset=utf-8'
    );
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(activeGame, null, 2);
    handleDownloadFile(
      json,
      `${activeGame.title}_${activeGame.date}_備份.json`,
      'application/json;charset=utf-8'
    );
  };

  return (
    <div className="space-y-4">
      {/* Matchup & Opponent Score */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        <h2 className="text-base font-bold text-slate-900">比賽資訊與對手比數</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-600">比賽名稱</span>
            <input
              type="text"
              value={activeGame.title}
              onChange={(e) => onUpdateGameMeta({ title: e.target.value })}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#1E3A8A]"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-600">比賽日期</span>
            <input
              type="date"
              value={activeGame.date}
              onChange={(e) => onUpdateGameMeta({ date: e.target.value })}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-mono-tabular text-slate-900 focus:outline-none focus:border-[#1E3A8A]"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-600">我方隊名</span>
            <input
              type="text"
              value={activeGame.teamName}
              onChange={(e) => onUpdateGameMeta({ teamName: e.target.value })}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#1E3A8A]"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-600">對手隊名</span>
            <input
              type="text"
              value={activeGame.opponentName}
              onChange={(e) =>
                onUpdateGameMeta({ opponentName: e.target.value })
              }
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#1E3A8A]"
            />
          </label>
        </div>

        {/* Opponent Score Adjustment */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-800">
              {activeGame.opponentName || '對手'} 目前得分
            </div>
            <div className="text-xs text-slate-500">
              我方得分會依據打席紀錄自動累積
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onUpdateGameMeta({
                  opponentScore: Math.max(0, activeGame.opponentScore - 1),
                })
              }
              aria-label="減少對手得分"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-800 active:scale-[0.96]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-display-num text-2xl font-bold w-8 text-center text-slate-900">
              {activeGame.opponentScore}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateGameMeta({
                  opponentScore: activeGame.opponentScore + 1,
                })
              }
              aria-label="增加對手得分"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-800 active:scale-[0.96]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 1~15 Lineup Roster Editor */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            先發打序名單（1～{activeGame.lineup.length}棒）
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            第 11～15 棒姓名空白代表未安排出場，填寫姓名後將顯示於記分輸入頁面
          </p>
        </div>

        <div className="space-y-2">
          {activeGame.lineup.map((member) => (
            <div
              key={member.slot}
              className="flex items-center gap-2"
            >
              <span className="font-mono-tabular text-xs font-bold text-[#1E3A8A] w-9 shrink-0">
                {member.slot}棒
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="背號"
                value={member.number}
                onChange={(e) =>
                  onUpdateLineupMember(member.slot, { number: e.target.value })
                }
                aria-label={`${member.slot}棒背號`}
                className="w-16 h-11 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center font-mono-tabular text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#1E3A8A] shrink-0"
              />
              <input
                type="text"
                placeholder={
                  member.slot >= 11
                    ? `第 ${member.slot} 棒姓名（空白代表未出場）`
                    : `第 ${member.slot} 棒球員姓名`
                }
                value={member.name}
                onChange={(e) =>
                  onUpdateLineupMember(member.slot, { name: e.target.value })
                }
                aria-label={`${member.slot}棒姓名`}
                className="flex-1 min-w-0 h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Export Summary Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            匯出比賽紀錄摘要
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            所有資料皆自動儲存於本機瀏覽器，亦可隨時匯出保存或分享
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4" />
                <span>已複製戰報</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>複製文字戰報</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>下載 CSV 報表</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>下載 JSON 備份</span>
          </button>
        </div>
      </section>

      {/* Saved Games Switcher */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            本機比賽紀錄管理
          </h2>
          <button
            type="button"
            onClick={onCreateNewGame}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 active:scale-[0.97] whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>開新比賽</span>
          </button>
        </div>

        <ul className="divide-y divide-slate-100">
          {allGames.map((g) => {
            const isCurrent = g.id === activeGame.id;
            return (
              <li
                key={g.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => onSwitchGame(g.id)}
                  className="flex-1 min-w-0 text-left py-1 space-y-0.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold truncate ${
                        isCurrent ? 'text-[#1E3A8A]' : 'text-slate-900'
                      }`}
                    >
                      {g.title}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-semibold text-emerald-700 shrink-0">
                        目前場次
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono-tabular">
                    {g.date} · {g.teamName} vs {g.opponentName} ·{' '}
                    {g.plateAppearances.length} 打席
                  </div>
                </button>

                {allGames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteGame(g.id)}
                    aria-label={`刪除比賽 ${g.title}`}
                    className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

function handleDownloadFile(content: string, filename: string, mime: string) {
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
