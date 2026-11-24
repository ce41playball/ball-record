import { GameRecord, PlayerLineupSlot } from '../types/baseball';

const STORAGE_KEY = 'diamondlog_baseball_tracker_v1';

export interface StoredAppState {
  activeGameId: string;
  games: GameRecord[];
}

export function createDefaultLineup(): PlayerLineupSlot[] {
  const defaultNumbers = ['01', '06', '24', '55', '18', '09', '12', '27', '04'];
  const defaultNames = [
    '第一棒選手',
    '第二棒選手',
    '第三棒選手',
    '第四棒選手',
    '第五棒選手',
    '第六棒選手',
    '第七棒選手',
    '第八棒選手',
    '第九棒選手',
  ];

  return Array.from({ length: 9 }, (_, i) => ({
    slot: i + 1,
    number: defaultNumbers[i],
    name: defaultNames[i],
  }));
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
        const activeExists = parsed.games.some((g) => g.id === parsed.activeGameId);
        return {
          activeGameId: activeExists ? parsed.activeGameId : parsed.games[0].id,
          games: parsed.games,
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
