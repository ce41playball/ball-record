export type InningHalf = 'top' | 'bottom';

export type OutcomeCode =
  | '1B'
  | '2B'
  | '3B'
  | 'HR'
  | 'BB'
  | 'HBP'
  | 'E'
  | 'FC'
  | 'SO'
  | 'GO'
  | 'FO'
  | 'DP'
  | 'SAC'
  | 'SF';

export type OutcomeCategory = 'hit' | 'reach' | 'out';

export interface OutcomeDefinition {
  code: OutcomeCode;
  label: string;
  shortLabel: string;
  category: OutcomeCategory;
  countsAsAtBat: boolean;
  isHit: boolean;
  totalBases: number;
  defaultOuts: number;
}

export type HitDirectionCode =
  | 'LF'
  | 'CF'
  | 'RF'
  | 'P'
  | 'C'
  | '1B'
  | '2B'
  | '3B'
  | 'SS';

export type HitDirectionZone = 'outfield' | 'infield';

export type HitTypeCode = 'LD' | 'FB' | 'GB';

export interface HitTypeDefinition {
  code: HitTypeCode;
  label: string;
}

export interface HitTypeSummary {
  totalRecorded: number;
  byCode: Record<HitTypeCode, number>;
}

export interface HitDirectionDefinition {
  code: HitDirectionCode;
  label: string;
  shortLabel: string;
  zone: HitDirectionZone;
}

export interface HitDirectionSummary {
  totalRecorded: number;
  outfieldCount: number;
  infieldCount: number;
  byCode: Record<HitDirectionCode, number>;
}

export interface BasesState {
  first: boolean;
  second: boolean;
  third: boolean;
}

export interface PlayerLineupSlot {
  slot: number; // 1 to 15
  number: string; // jersey number, e.g. "07"
  name: string;
}

export interface PlateAppearance {
  id: string;
  inning: number; // 1 to 12
  inningHalf: InningHalf;
  batterSlot: number; // 1 to 15
  batterName: string;
  batterNumber: string;
  outcome: OutcomeCode;
  hitDirection?: HitDirectionCode | null;
  hitType?: HitTypeCode | null;
  rbi: number;
  runsScored: number;
  outsRecorded: number;
  basesBefore: BasesState;
  basesAfter: BasesState;
  outsBefore: number;
  outsAfter: number;
  timestamp: number;
}

export type TeamAttackOrder = 'first' | 'second';

export interface GameRecord {
  id: string;
  title: string;
  date: string;
  teamName: string;
  opponentName: string;
  teamAttackOrder: TeamAttackOrder;
  maxInnings: number; // default 9, expandable to 12
  currentInning: number;
  inningHalf: InningHalf;
  currentBatterSlot: number;
  autoAdvanceBatter: boolean;
  outs: number; // 0, 1, 2
  bases: BasesState;
  opponentScore: number;
  lineup: PlayerLineupSlot[];
  plateAppearances: PlateAppearance[];
  createdAt: number;
  updatedAt: number;
}

export interface PlayerStats {
  slot: number;
  number: string;
  name: string;
  pa: number;
  ab: number;
  h: number;
  singles: number;
  doubles: number;
  triples: number;
  hr: number;
  bb: number;
  hbp: number;
  so: number;
  sac: number;
  sf: number;
  rbi: number;
  avg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  outcomes: OutcomeCode[];
}

export interface TeamTotals {
  pa: number;
  ab: number;
  h: number;
  hr: number;
  bb: number;
  so: number;
  rbi: number;
  runs: number;
  avg: number | null;
}

export interface PlayPrediction {
  basesAfter: BasesState;
  outsRecorded: number;
  runsScored: number;
  rbi: number;
  inningEnding: boolean;
}
