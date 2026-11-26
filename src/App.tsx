/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { BatterSlotBlock } from './components/BatterSlotBlock';
import { InningSelectorBlock } from './components/InningSelectorBlock';
import { LineupAndExportPanel } from './components/LineupAndExportPanel';
import { LiveFieldBanner } from './components/LiveFieldBanner';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { OutcomeSelectorBlock } from './components/OutcomeSelectorBlock';
import { RbiAndRunBlock } from './components/RbiAndRunBlock';
import { StatsAndLogPanel } from './components/StatsAndLogPanel';
import { TopScoreHeader } from './components/TopScoreHeader';
import {
  BasesState,
  GameRecord,
  InningHalf,
  OutcomeCode,
  PlateAppearance,
  PlayerLineupSlot,
} from './types/baseball';
import {
  calculatePlayerStats,
  getInningHalfLabel,
  OUTCOME_DEFINITIONS,
  predictPlaySimulation,
} from './utils/baseballEngine';
import {
  createNewGame,
  loadStoredState,
  saveStoredState,
  StoredAppState,
} from './utils/storage';

export default function App() {
  const [appState, setAppState] = useState<StoredAppState>(() =>
    loadStoredState()
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>('record');
  const [desktopRightTab, setDesktopRightTab] = useState<'stats' | 'manage'>(
    'stats'
  );
  const [pendingOutcome, setPendingOutcome] = useState<OutcomeCode | null>(
    null
  );
  const [pendingRbi, setPendingRbi] = useState(0);
  const [pendingRuns, setPendingRuns] = useState(0);
  const [pendingOutsRecorded, setPendingOutsRecorded] = useState(0);
  const [pendingBasesAfter, setPendingBasesAfter] = useState<BasesState>({
    first: false,
    second: false,
    third: false,
  });
  const [manualRbiEdited, setManualRbiEdited] = useState(false);
  const [manualRunsEdited, setManualRunsEdited] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    saveStoredState(appState);
  }, [appState]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const activeGame = useMemo(() => {
    return (
      appState.games.find((g) => g.id === appState.activeGameId) ??
      appState.games[0]
    );
  }, [appState]);

  const { players, totals } = useMemo(
    () =>
      calculatePlayerStats(activeGame.lineup, activeGame.plateAppearances),
    [activeGame.lineup, activeGame.plateAppearances]
  );

  const selectedBatter = useMemo(() => {
    return (
      activeGame.lineup.find((p) => p.slot === activeGame.currentBatterSlot) ??
      activeGame.lineup[0]
    );
  }, [activeGame.lineup, activeGame.currentBatterSlot]);

  const updateActiveGame = (updater: (game: GameRecord) => GameRecord) => {
    setAppState((prev) => ({
      ...prev,
      games: prev.games.map((g) =>
        g.id === prev.activeGameId ? { ...updater(g), updatedAt: Date.now() } : g
      ),
    }));
  };

  const handleSelectInning = (inning: number) => {
    updateActiveGame((g) => ({ ...g, currentInning: inning }));
  };

  const handleSelectHalf = (inningHalf: InningHalf) => {
    updateActiveGame((g) => ({ ...g, inningHalf }));
  };

  const handleAddExtraInning = () => {
    updateActiveGame((g) => {
      const nextMax = Math.min(12, g.maxInnings + 1);
      return {
        ...g,
        maxInnings: nextMax,
        currentInning: nextMax,
      };
    });
  };

  const handleSelectBatter = (slot: number) => {
    updateActiveGame((g) => ({ ...g, currentBatterSlot: slot }));
  };

  const handleToggleAutoAdvance = () => {
    updateActiveGame((g) => ({
      ...g,
      autoAdvanceBatter: !g.autoAdvanceBatter,
    }));
  };

  const handleSetOuts = (outs: number) => {
    updateActiveGame((g) => ({ ...g, outs }));
  };

  const handleToggleBase = (base: keyof BasesState) => {
    updateActiveGame((g) => ({
      ...g,
      bases: { ...g.bases, [base]: !g.bases[base] },
    }));
  };

  const handleClearField = () => {
    updateActiveGame((g) => ({
      ...g,
      outs: 0,
      bases: { first: false, second: false, third: false },
    }));
    setToastMessage('已清空壘包並歸零出局數');
  };

  useEffect(() => {
    if (pendingOutcome === null) {
      setPendingBasesAfter({ ...activeGame.bases });
    }
  }, [activeGame.bases, pendingOutcome]);

  const resetPendingPlay = () => {
    setPendingOutcome(null);
    setPendingRbi(0);
    setPendingRuns(0);
    setPendingOutsRecorded(0);
    setPendingBasesAfter({ ...activeGame.bases });
    setManualRbiEdited(false);
    setManualRunsEdited(false);
  };

  const handlePickOutcome = (code: OutcomeCode) => {
    const predicted = predictPlaySimulation(
      code,
      activeGame.bases,
      activeGame.outs
    );
    setPendingOutcome(code);
    if (!manualRbiEdited) {
      setPendingRbi(Math.min(4, predicted.rbi));
    }
    if (!manualRunsEdited) {
      setPendingRuns(Math.min(4, predicted.runsScored));
    }
    setPendingOutsRecorded(predicted.outsRecorded);
    setPendingBasesAfter(predicted.basesAfter);
  };

  const handleConfirmPlateAppearance = (advanceHalfInning: boolean) => {
    if (!pendingOutcome) return;
    const def = OUTCOME_DEFINITIONS[pendingOutcome];
    const outsBefore = activeGame.outs;
    const outsAfter = Math.min(3, outsBefore + pendingOutsRecorded);
    const basesAfterCommit = advanceHalfInning
      ? { first: false, second: false, third: false }
      : pendingBasesAfter;

    const newPa: PlateAppearance = {
      id: `pa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      inning: activeGame.currentInning,
      inningHalf: activeGame.inningHalf,
      batterSlot: selectedBatter.slot,
      batterName: selectedBatter.name,
      batterNumber: selectedBatter.number,
      outcome: pendingOutcome,
      rbi: pendingRbi,
      runsScored: pendingRuns,
      outsRecorded: pendingOutsRecorded,
      basesBefore: { ...activeGame.bases },
      basesAfter: { ...basesAfterCommit },
      outsBefore,
      outsAfter,
      timestamp: Date.now(),
    };

    updateActiveGame((g) => {
      const scheduledSlots = g.lineup
        .filter((m) => m.slot <= 9 || m.name.trim() !== '')
        .map((m) => m.slot);
      const currentIdx = scheduledSlots.indexOf(g.currentBatterSlot);
      const nextBatterSlot = g.autoAdvanceBatter
        ? scheduledSlots[(currentIdx + 1) % Math.max(1, scheduledSlots.length)] ?? 1
        : g.currentBatterSlot;

      let nextInning = g.currentInning;
      let nextHalf = g.inningHalf;
      let nextMaxInnings = g.maxInnings;
      let nextOuts = outsAfter >= 3 ? 2 : outsAfter;
      let nextBases = basesAfterCommit;

      if (advanceHalfInning) {
        if (g.inningHalf === 'top') {
          nextHalf = 'bottom';
        } else {
          nextHalf = 'top';
          nextInning = g.currentInning + 1;
          if (nextInning > nextMaxInnings && nextInning <= 12) {
            nextMaxInnings = nextInning;
          }
        }
        nextOuts = 0;
        nextBases = { first: false, second: false, third: false };
      }

      return {
        ...g,
        currentInning: Math.min(12, nextInning),
        inningHalf: nextHalf,
        maxInnings: nextMaxInnings,
        currentBatterSlot: nextBatterSlot,
        outs: nextOuts,
        bases: nextBases,
        plateAppearances: [...g.plateAppearances, newPa],
      };
    });

    setPendingOutcome(null);
    setPendingRbi(0);
    setPendingRuns(0);
    setPendingOutsRecorded(0);
    setManualRbiEdited(false);
    setManualRunsEdited(false);
    setToastMessage(
      advanceHalfInning
        ? `已紀錄 ${selectedBatter.slot}棒 ${def.label}，並推進至下一半局`
        : `已紀錄 ${getInningHalfLabel(activeGame.currentInning, activeGame.inningHalf)} · ${selectedBatter.slot}棒 ${def.label}`
    );
  };

  const handleUndoLastPa = () => {
    if (activeGame.plateAppearances.length === 0) return;
    const lastPa =
      activeGame.plateAppearances[activeGame.plateAppearances.length - 1];

    updateActiveGame((g) => ({
      ...g,
      currentInning: lastPa.inning,
      inningHalf: lastPa.inningHalf,
      currentBatterSlot: lastPa.batterSlot,
      outs: lastPa.outsBefore,
      bases: { ...lastPa.basesBefore },
      plateAppearances: g.plateAppearances.slice(0, -1),
    }));

    setToastMessage(
      `已復原：${lastPa.batterSlot}棒 ${OUTCOME_DEFINITIONS[lastPa.outcome].label}`
    );
  };

  const handleDeletePlateAppearance = (paId: string) => {
    const isLast =
      activeGame.plateAppearances[activeGame.plateAppearances.length - 1]?.id ===
      paId;
    if (isLast) {
      handleUndoLastPa();
      return;
    }

    updateActiveGame((g) => ({
      ...g,
      plateAppearances: g.plateAppearances.filter((pa) => pa.id !== paId),
    }));
    setToastMessage('已刪除該筆打席紀錄');
  };

  const handleUpdateGameMeta = (patch: Partial<GameRecord>) => {
    updateActiveGame((g) => ({ ...g, ...patch }));
  };

  const handleUpdateLineupMember = (
    slot: number,
    patch: Partial<PlayerLineupSlot>
  ) => {
    updateActiveGame((g) => {
      const updatedLineup = g.lineup.map((m) =>
        m.slot === slot ? { ...m, ...patch } : m
      );
      const clearedActiveExtra =
        slot >= 10 &&
        patch.name !== undefined &&
        patch.name.trim() === '' &&
        g.currentBatterSlot === slot;
      return {
        ...g,
        currentBatterSlot: clearedActiveExtra ? 1 : g.currentBatterSlot,
        lineup: updatedLineup,
      };
    });
  };

  const handleCreateNewGame = () => {
    const fresh = createNewGame({
      title: `新比賽紀錄 #${appState.games.length + 1}`,
      lineup: activeGame.lineup.map((m) => ({ ...m })),
      teamName: activeGame.teamName,
    });
    setAppState((prev) => ({
      activeGameId: fresh.id,
      games: [fresh, ...prev.games],
    }));
    setMobileTab('record');
    setToastMessage('已建立新比賽並保留先發名單');
  };

  const handleSwitchGame = (gameId: string) => {
    setAppState((prev) => ({ ...prev, activeGameId: gameId }));
    setToastMessage('已切換比賽場次');
  };

  const handleDeleteGame = (gameId: string) => {
    setAppState((prev) => {
      if (prev.games.length <= 1) return prev;
      const remaining = prev.games.filter((g) => g.id !== gameId);
      const nextActiveId =
        prev.activeGameId === gameId ? remaining[0].id : prev.activeGameId;
      return {
        activeGameId: nextActiveId,
        games: remaining,
      };
    });
    setToastMessage('已刪除比賽紀錄');
  };

  return (
    <div className="min-h-dvh bg-[#F8FAFC] text-slate-900 pb-20 lg:pb-10">
      <TopScoreHeader
        teamName={activeGame.teamName}
        opponentName={activeGame.opponentName}
        teamRuns={totals.runs}
        opponentScore={activeGame.opponentScore}
        canUndo={activeGame.plateAppearances.length > 0}
        onUndo={handleUndoLastPa}
      />

      <main className="max-w-6xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left / Mobile Record Tab: Live Field + 3 Required Blocks */}
          <div
            className={`lg:col-span-7 space-y-4 ${
              mobileTab === 'record' ? 'block' : 'hidden lg:block'
            }`}
          >
            <InningSelectorBlock
              currentInning={activeGame.currentInning}
              inningHalf={activeGame.inningHalf}
              maxInnings={activeGame.maxInnings}
              onSelectInning={handleSelectInning}
              onSelectHalf={handleSelectHalf}
              onAddExtraInning={handleAddExtraInning}
            />

            <LiveFieldBanner
              currentInning={activeGame.currentInning}
              inningHalf={activeGame.inningHalf}
              outs={activeGame.outs}
              bases={activeGame.bases}
              teamHits={totals.h}
              teamRuns={totals.runs}
              onSetOuts={handleSetOuts}
              onToggleBase={handleToggleBase}
              onClearField={handleClearField}
            />

            <BatterSlotBlock
              players={players}
              currentBatterSlot={activeGame.currentBatterSlot}
              autoAdvance={activeGame.autoAdvanceBatter}
              onSelectBatter={handleSelectBatter}
              onToggleAutoAdvance={handleToggleAutoAdvance}
              onUpdatePlayerName={(slot, name) =>
                handleUpdateLineupMember(slot, { name })
              }
            />

            <OutcomeSelectorBlock
              selectedBatterSlot={selectedBatter.slot}
              selectedBatterName={selectedBatter.name}
              selectedOutcome={pendingOutcome}
              onPickOutcome={handlePickOutcome}
            />

            <RbiAndRunBlock
              inning={activeGame.currentInning}
              inningHalf={activeGame.inningHalf}
              batter={selectedBatter}
              selectedOutcome={pendingOutcome}
              rbi={pendingRbi}
              runsScored={pendingRuns}
              outsRecorded={pendingOutsRecorded}
              currentOuts={activeGame.outs}
              basesAfter={pendingBasesAfter}
              onSelectRbi={(val) => {
                setPendingRbi(val);
                setManualRbiEdited(true);
              }}
              onSelectRuns={(val) => {
                setPendingRuns(val);
                setManualRunsEdited(true);
              }}
              onChangeOutsRecorded={setPendingOutsRecorded}
              onToggleBaseAfter={(base) =>
                setPendingBasesAfter((prev) => ({
                  ...prev,
                  [base]: !prev[base],
                }))
              }
              onResetPending={resetPendingPlay}
              onConfirm={handleConfirmPlateAppearance}
            />
          </div>

          {/* Right / Mobile Stats & Manage Tabs */}
          <div
            className={`lg:col-span-5 space-y-4 ${
              mobileTab !== 'record' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Desktop Right Column Tab Switcher */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setDesktopRightTab('stats')}
                className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  desktopRightTab === 'stats'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                打擊統計與流水 ({activeGame.plateAppearances.length})
              </button>
              <button
                type="button"
                onClick={() => setDesktopRightTab('manage')}
                className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  desktopRightTab === 'manage'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                先發名單與匯出
              </button>
            </div>

            {/* Stats View */}
            <div
              className={
                mobileTab === 'stats'
                  ? 'block'
                  : desktopRightTab === 'stats'
                  ? 'hidden lg:block'
                  : 'hidden'
              }
            >
              <StatsAndLogPanel
                game={activeGame}
                onDeletePlateAppearance={handleDeletePlateAppearance}
              />
            </div>

            {/* Lineup & Export View */}
            <div
              className={
                mobileTab === 'manage'
                  ? 'block'
                  : desktopRightTab === 'manage'
                  ? 'hidden lg:block'
                  : 'hidden'
              }
            >
              <LineupAndExportPanel
                activeGame={activeGame}
                allGames={appState.games}
                onUpdateGameMeta={handleUpdateGameMeta}
                onUpdateLineupMember={handleUpdateLineupMember}
                onCreateNewGame={handleCreateNewGame}
                onSwitchGame={handleSwitchGame}
                onDeleteGame={handleDeleteGame}
              />
            </div>
          </div>
        </div>
      </main>



      {/* Transient Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 lg:bottom-5 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg whitespace-nowrap max-w-[92vw] truncate"
        >
          {toastMessage}
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <MobileBottomNav
        activeTab={mobileTab}
        paCount={activeGame.plateAppearances.length}
        onChangeTab={setMobileTab}
      />
    </div>
  );
}
