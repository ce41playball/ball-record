import { GameRecord, PlayerLineupSlot } from '../types/baseball';

const STORAGE_KEY = 'diamondlog_baseball_tracker_v1';

export interface StoredAppState {
  activeGameId: string;
  games: GameRecord[];
}

export const MAX_LINEUP_SLOTS = 15;

const LEGACY_STARTER_DEFAULT_NAMES: Record<number, string> = {
  1: '第一棒選手',
  2: '第二棒選手',
  3: '第三棒選手',
  4: '第四棒選手',
  5: '第五棒選手',
  6: '第六棒選手',
  7: '第七棒選手',
  8: '第八棒選手',
  9: '第九棒選手',
};

const LEGACY_EXTRA_DEFAULT_NAMES: Record<number, string> = {
  10: '第十棒選手',
  11: '第十一棒選手',
  12: '第十二棒選手',
  13: '第十三棒選手',
  14: '第十四棒選手',
  15: '第十五棒選手',
};

export function createDefaultLineup(): PlayerLineupSlot[] {
  const defaultNumbers = [
    '01', '06', '24', '55', '18',
    '09', '12', '27', '04', '',
    '', '', '', '', '',
  ];
  const defaultNames = [
    '第一棒',
    '第二棒',
    '第三棒',
    '第四棒',
    '第五棒',
    '第六棒',
    '第七棒',
    '第八棒',
    '第九棒',
    '',
    '',
    '',
    '',
    '',
    '',
  ];

  return Array.from({ length: MAX_LINEUP_SLOTS }, (_, i) => ({
    slot: i + 1,
    number: defaultNumbers[i],
    name: defaultNames[i],
    position: '',
  }));
}

function normalizeLineup(
  existing?: PlayerLineupSlot[],
  plateAppearances: GameRecord['plateAppearances'] = []
): PlayerLineupSlot[] {
  const defaults = createDefaultLineup();
  if (!Array.isArray(existing) || existing.length === 0) {
    return defaults;
  }
  const bySlot = new Map(existing.map((m) => [m.slot, m]));
  return defaults.map((def) => {
    const saved = bySlot.get(def.slot);
    if (!saved) return def;
    const hasPa = plateAppearances.some((pa) => pa.batterSlot === def.slot);
    if (
      def.slot >= 10 &&
      !hasPa &&
      saved.name === LEGACY_EXTRA_DEFAULT_NAMES[def.slot]
    ) {
      return { ...saved, name: '', number: '', position: saved.position ?? '' };
    }
    if (
      def.slot <= 9 &&
      saved.name === LEGACY_STARTER_DEFAULT_NAMES[def.slot]
    ) {
      return { ...saved, name: def.name, position: saved.position ?? '' };
    }
    return { ...saved, position: saved.position ?? '' };
  });
}

export function createNewGame(overrides?: Partial<GameRecord>): GameRecord {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const id = `game_${now}_${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    title: overrides?.title || '例行賽紀錄',
    date: overrides?.date || today,
    teamName: overrides?.teamName || '我方球隊',
    opponentName: overrides?.opponentName || '對手球隊',
    teamAttackOrder: overrides?.teamAttackOrder || 'first',
    maxInnings: 9,
    currentInning: 1,
    inningHalf: 'top',
    currentBatterSlot: 1,
    autoAdvanceBatter: true,
    outs: 0,
    bases: { first: false, second: false, third: false },
    opponentScore: 0,
    lineup: createDefaultLineup(),
    plateAppearances: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function loadStoredState(): StoredAppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredAppState;
      if (parsed && Array.isArray(parsed.games) && parsed.games.length > 0) {
        const normalizedGames = parsed.games.map((g) => ({
          ...g,
          teamAttackOrder: g.teamAttackOrder ?? 'first',
          lineup: normalizeLineup(g.lineup, g.plateAppearances),
        }));
        const activeExists = normalizedGames.some(
          (g) => g.id === parsed.activeGameId
        );
        return {
          activeGameId: activeExists
            ? parsed.activeGameId
            : normalizedGames[0].id,
          games: normalizedGames,
        };
      }
    }
  } catch {
    // Fallback to fresh game if localStorage unavailable or corrupted
  }

  const initialGame = createNewGame();
  return {
    activeGameId: initialGame.id,
    games: [initialGame],
  };
}

export function saveStoredState(state: StoredAppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors silently
  }
}
