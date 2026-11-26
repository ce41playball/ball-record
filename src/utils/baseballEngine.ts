import {
  BasesState,
  GameRecord,
  HitDirectionCode,
  HitDirectionDefinition,
  HitDirectionSummary,
  HitTypeCode,
  HitTypeDefinition,
  HitTypeSummary,
  InningHalf,
  OutcomeCode,
  OutcomeDefinition,
  PlateAppearance,
  PlayerLineupSlot,
  PlayerStats,
  PlayPrediction,
  TeamTotals,
} from '../types/baseball';

export const INNING_LABELS: Record<number, string> = {
  1: '一局',
  2: '二局',
  3: '三局',
  4: '四局',
  5: '五局',
  6: '六局',
  7: '七局',
  8: '八局',
  9: '九局',
  10: '十局',
  11: '十一局',
  12: '十二局',
};

export function getInningLabel(inning: number): string {
  return INNING_LABELS[inning] ?? `${inning}局`;
}

export function getInningHalfLabel(inning: number, half: InningHalf): string {
  return `${getInningLabel(inning)}${half === 'top' ? '上' : '下'}`;
}

export const OUTCOME_DEFINITIONS: Record<OutcomeCode, OutcomeDefinition> = {
  '1B': {
    code: '1B',
    label: '一壘安打',
    shortLabel: '一安',
    category: 'hit',
    countsAsAtBat: true,
    isHit: true,
    totalBases: 1,
    defaultOuts: 0,
  },
  '2B': {
    code: '2B',
    label: '二壘安打',
    shortLabel: '二安',
    category: 'hit',
    countsAsAtBat: true,
    isHit: true,
    totalBases: 2,
    defaultOuts: 0,
  },
  '3B': {
    code: '3B',
    label: '三壘安打',
    shortLabel: '三安',
    category: 'hit',
    countsAsAtBat: true,
    isHit: true,
    totalBases: 3,
    defaultOuts: 0,
  },
  HR: {
    code: 'HR',
    label: '全壘打',
    shortLabel: '全壘',
    category: 'hit',
    countsAsAtBat: true,
    isHit: true,
    totalBases: 4,
    defaultOuts: 0,
  },
  BB: {
    code: 'BB',
    label: '四壞保送',
    shortLabel: '保送',
    category: 'reach',
    countsAsAtBat: false,
    isHit: false,
    totalBases: 0,
    defaultOuts: 0,
  },
  HBP: {
    code: 'HBP',
    label: '觸身球上壘',
    shortLabel: '觸身',
    category: 'reach',
    countsAsAtBat: false,
    isHit: false,
    totalBases: 0,
    defaultOuts: 0,
  },
  E: {
    code: 'E',
    label: '失誤上壘',
    shortLabel: '失誤',
    category: 'reach',
    countsAsAtBat: true,
    isHit: false,
    totalBases: 0,
    defaultOuts: 0,
  },
  FC: {
    code: 'FC',
    label: '野手選擇',
    shortLabel: '野選',
    category: 'reach',
    countsAsAtBat: true,
    isHit: false,
    totalBases: 0,
    defaultOuts: 1,
  },
  SO: {
    code: 'SO',
    label: '三振出局',
    shortLabel: '三振',
    category: 'out',
    countsAsAtBat: true,
    isHit: false,
    totalBases: 0,
    defaultOuts: 1,
  },
  GO: {
    code: 'GO',
    label: '滾地出局',
    shortLabel: '滾地',
    category: 'out',
    countsAsAtBat: true,
    isHit: false,
    totalBases: 0,
    defaultOuts: 1,
  },
  FO: {
    code: 'FO',
    label: '飛球出局',
    shortLabel: '飛球',
    category: 'out',
    countsAsAtBat: true,
    isHit: false,
    totalBases: 0,
    defaultOuts: 1,
  },
  DP: {
    code: 'DP',
    label: '雙殺打',
    shortLabel: '雙殺',
    category: 'out',
    countsAsAtBat: true,
    isHit: false,
    totalBases: 0,
    defaultOuts: 2,
  },
  SAC: {
    code: 'SAC',
    label: '犧牲觸擊',
    shortLabel: '犧觸',
    category: 'out',
    countsAsAtBat: false,
    isHit: false,
    totalBases: 0,
    defaultOuts: 1,
  },
  SF: {
    code: 'SF',
    label: '高飛犧牲打',
    shortLabel: '高飛犧',
    category: 'out',
    countsAsAtBat: false,
    isHit: false,
    totalBases: 0,
    defaultOuts: 1,
  },
};

export const OUTCOME_GROUPS: {
  id: 'hit' | 'reach' | 'out';
  title: string;
  codes: OutcomeCode[];
}[] = [
  {
    id: 'hit',
    title: '安打',
    codes: ['1B', '2B', '3B', 'HR'],
  },
  {
    id: 'reach',
    title: '保送與上壘',
    codes: ['BB', 'HBP', 'E', 'FC'],
  },
  {
    id: 'out',
    title: '出局與犧牲',
    codes: ['SO', 'GO', 'FO', 'DP', 'SAC', 'SF'],
  },
];

export const HIT_DIRECTION_DEFINITIONS: Record<
  HitDirectionCode,
  HitDirectionDefinition
> = {
  LF: { code: 'LF', label: '左外野', shortLabel: '左外', zone: 'outfield' },
  CF: { code: 'CF', label: '中外野', shortLabel: '中外', zone: 'outfield' },
  RF: { code: 'RF', label: '右外野', shortLabel: '右外', zone: 'outfield' },
  P: { code: 'P', label: '投手', shortLabel: '投', zone: 'infield' },
  C: { code: 'C', label: '捕手', shortLabel: '捕', zone: 'infield' },
  '1B': { code: '1B', label: '一壘', shortLabel: '一壘', zone: 'infield' },
  '2B': { code: '2B', label: '二壘', shortLabel: '二壘', zone: 'infield' },
  '3B': { code: '3B', label: '三壘', shortLabel: '三壘', zone: 'infield' },
  SS: { code: 'SS', label: '游擊', shortLabel: '游擊', zone: 'infield' },
};

export const HIT_DIRECTION_GROUPS: {
  id: 'outfield' | 'infield';
  title: string;
  codes: HitDirectionCode[];
}[] = [
  {
    id: 'outfield',
    title: '外野',
    codes: ['LF', 'CF', 'RF'],
  },
  {
    id: 'infield',
    title: '內野',
    codes: ['P', 'C', '1B', '2B', '3B', 'SS'],
  },
];

export function calculateHitDirectionStats(
  plateAppearances: PlateAppearance[],
  batterSlotFilter: number | 'all' = 'all'
): HitDirectionSummary {
  const byCode: Record<HitDirectionCode, number> = {
    LF: 0,
    CF: 0,
    RF: 0,
    P: 0,
    C: 0,
    '1B': 0,
    '2B': 0,
    '3B': 0,
    SS: 0,
  };
  let totalRecorded = 0;
  let outfieldCount = 0;
  let infieldCount = 0;

  for (const pa of plateAppearances) {
    if (batterSlotFilter !== 'all' && pa.batterSlot !== batterSlotFilter) {
      continue;
    }
    const dir = pa.hitDirection;
    if (!dir || !(dir in HIT_DIRECTION_DEFINITIONS)) continue;
    byCode[dir] += 1;
    totalRecorded += 1;
    if (HIT_DIRECTION_DEFINITIONS[dir].zone === 'outfield') {
      outfieldCount += 1;
    } else {
      infieldCount += 1;
    }
  }

  return {
    totalRecorded,
    outfieldCount,
    infieldCount,
    byCode,
  };
}

export const HIT_TYPE_DEFINITIONS: Record<HitTypeCode, HitTypeDefinition> = {
  LD: { code: 'LD', label: '平飛球' },
  FB: { code: 'FB', label: '高飛球' },
  GB: { code: 'GB', label: '滾地球' },
};

export const HIT_TYPE_CODES: HitTypeCode[] = ['LD', 'FB', 'GB'];

export function calculateHitTypeStats(
  plateAppearances: PlateAppearance[],
  batterSlotFilter: number | 'all' = 'all'
): HitTypeSummary {
  const byCode: Record<HitTypeCode, number> = {
    LD: 0,
    FB: 0,
    GB: 0,
  };
  let totalRecorded = 0;

  for (const pa of plateAppearances) {
    if (batterSlotFilter !== 'all' && pa.batterSlot !== batterSlotFilter) {
      continue;
    }
    const type = pa.hitType;
    if (!type || !(type in HIT_TYPE_DEFINITIONS)) continue;
    byCode[type] += 1;
    totalRecorded += 1;
  }

  return {
    totalRecorded,
    byCode,
  };
}

export function countRunners(bases: BasesState): number {
  return (bases.first ? 1 : 0) + (bases.second ? 1 : 0) + (bases.third ? 1 : 0);
}

export function predictPlaySimulation(
  outcome: OutcomeCode,
  bases: BasesState,
  currentOuts: number
): PlayPrediction {
  const nextBases: BasesState = { ...bases };
  let runsScored = 0;
  let rbi = 0;
  let outsRecorded = 0;

  switch (outcome) {
    case '1B': {
      // Standard single: 3B & 2B score, 1B -> 2B, batter -> 1B
      if (bases.third) runsScored += 1;
      if (bases.second) runsScored += 1;
      nextBases.third = false;
      nextBases.second = bases.first;
      nextBases.first = true;
      rbi = runsScored;
      break;
    }
    case '2B': {
      if (bases.third) runsScored += 1;
      if (bases.second) runsScored += 1;
      nextBases.third = bases.first;
      nextBases.second = true;
      nextBases.first = false;
      rbi = runsScored;
      break;
    }
    case '3B': {
      runsScored = countRunners(bases);
      nextBases.first = false;
      nextBases.second = false;
      nextBases.third = true;
      rbi = runsScored;
      break;
    }
    case 'HR': {
      runsScored = countRunners(bases) + 1;
      nextBases.first = false;
      nextBases.second = false;
      nextBases.third = false;
      rbi = runsScored;
      break;
    }
    case 'BB':
    case 'HBP': {
      // Forced advance only
      if (bases.first && bases.second && bases.third) {
        runsScored = 1;
        rbi = 1;
        nextBases.first = true;
        nextBases.second = true;
        nextBases.third = true;
      } else if (bases.first && bases.second) {
        nextBases.first = true;
        nextBases.second = true;
        nextBases.third = true;
      } else if (bases.first) {
        nextBases.first = true;
        nextBases.second = true;
      } else {
        nextBases.first = true;
      }
      break;
    }
    case 'E': {
      // Reach on error: runners advance 1 base, 0 RBI by rule
      if (bases.third) runsScored += 1;
      nextBases.third = bases.second;
      nextBases.second = bases.first;
      nextBases.first = true;
      rbi = 0;
      break;
    }
    case 'FC': {
      // Fielder's choice: batter reaches 1B, lead runner out if any
      const hasRunners = countRunners(bases) > 0;
      if (hasRunners) {
        outsRecorded = 1;
        if (bases.third) {
          nextBases.third = bases.second;
          nextBases.second = bases.first;
          nextBases.first = true;
        } else if (bases.second) {
          nextBases.second = bases.first;
          nextBases.first = true;
        } else {
          nextBases.first = true;
        }
      } else {
        outsRecorded = 0;
        nextBases.first = true;
      }
      break;
    }
    case 'SO':
    case 'FO': {
      outsRecorded = 1;
      break;
    }
    case 'GO': {
      outsRecorded = 1;
      break;
    }
    case 'DP': {
      const remainingOuts = Math.max(1, 3 - currentOuts);
      outsRecorded = Math.min(2, remainingOuts);
      // Clear lead runner if possible
      if (bases.first) {
        nextBases.first = false;
      } else if (bases.second) {
        nextBases.second = false;
      } else if (bases.third) {
        nextBases.third = false;
      }
      break;
    }
    case 'SAC': {
      outsRecorded = 1;
      if (currentOuts + outsRecorded < 3) {
        if (bases.third) {
          runsScored += 1;
          rbi += 1;
        }
        nextBases.third = bases.second;
        nextBases.second = bases.first;
        nextBases.first = false;
      }
      break;
    }
    case 'SF': {
      outsRecorded = 1;
      if (currentOuts + outsRecorded < 3 && bases.third) {
        runsScored = 1;
        rbi = 1;
        nextBases.third = false;
      }
      break;
    }
  }

  const totalOuts = currentOuts + outsRecorded;
  const inningEnding = totalOuts >= 3;

  if (inningEnding) {
    // Runs on a 3rd out force/strikeout generally don't count; keep safe default 0 unless user overrides
    return {
      basesAfter: { first: false, second: false, third: false },
      outsRecorded: Math.max(0, 3 - currentOuts),
      runsScored: 0,
      rbi: 0,
      inningEnding: true,
    };
  }

  return {
    basesAfter: nextBases,
    outsRecorded,
    runsScored,
    rbi,
    inningEnding: false,
  };
}

export function calculatePlayerStats(
  lineup: PlayerLineupSlot[],
  plateAppearances: PlateAppearance[]
): { players: PlayerStats[]; totals: TeamTotals } {
  const players: PlayerStats[] = lineup.map((member) => {
    const pas = plateAppearances.filter((pa) => pa.batterSlot === member.slot);
    let ab = 0;
    let h = 0;
    let singles = 0;
    let doubles = 0;
    let triples = 0;
    let hr = 0;
    let bb = 0;
    let hbp = 0;
    let so = 0;
    let sac = 0;
    let sf = 0;
    let rbi = 0;
    const outcomes: OutcomeCode[] = [];

    for (const pa of pas) {
      const def = OUTCOME_DEFINITIONS[pa.outcome];
      outcomes.push(pa.outcome);
      if (def.countsAsAtBat) ab += 1;
      if (def.isHit) h += 1;
      if (pa.outcome === '1B') singles += 1;
      if (pa.outcome === '2B') doubles += 1;
      if (pa.outcome === '3B') triples += 1;
      if (pa.outcome === 'HR') hr += 1;
      if (pa.outcome === 'BB') bb += 1;
      if (pa.outcome === 'HBP') hbp += 1;
      if (pa.outcome === 'SO') so += 1;
      if (pa.outcome === 'SAC') sac += 1;
      if (pa.outcome === 'SF') sf += 1;
      rbi += pa.rbi;
    }

    const avg = ab > 0 ? h / ab : null;
    const obpDenom = ab + bb + hbp + sf;
    const obp = obpDenom > 0 ? (h + bb + hbp) / obpDenom : null;
    const totalBases = singles + doubles * 2 + triples * 3 + hr * 4;
    const slg = ab > 0 ? totalBases / ab : null;
    const ops = obp !== null && slg !== null ? obp + slg : null;

    return {
      slot: member.slot,
      number: member.number,
      name: member.name,
      pa: pas.length,
      ab,
      h,
      singles,
      doubles,
      triples,
      hr,
      bb,
      hbp,
      so,
      sac,
      sf,
      rbi,
      avg,
      obp,
      slg,
      ops,
      outcomes,
    };
  });

  const paTotal = plateAppearances.length;
  const abTotal = players.reduce((sum, p) => sum + p.ab, 0);
  const hTotal = players.reduce((sum, p) => sum + p.h, 0);
  const hrTotal = players.reduce((sum, p) => sum + p.hr, 0);
  const bbTotal = players.reduce((sum, p) => sum + p.bb, 0);
  const soTotal = players.reduce((sum, p) => sum + p.so, 0);
  const rbiTotal = players.reduce((sum, p) => sum + p.rbi, 0);
  const runsTotal = plateAppearances.reduce((sum, pa) => sum + pa.runsScored, 0);

  return {
    players,
    totals: {
      pa: paTotal,
      ab: abTotal,
      h: hTotal,
      hr: hrTotal,
      bb: bbTotal,
      so: soTotal,
      rbi: rbiTotal,
      runs: runsTotal,
      avg: abTotal > 0 ? hTotal / abTotal : null,
    },
  };
}

export function formatAvg(val: number | null): string {
  if (val === null) return '---';
  if (val >= 1) return val.toFixed(3);
  return val.toFixed(3).replace(/^0/, '');
}

export function calculateInningRuns(
  plateAppearances: PlateAppearance[],
  maxInnings: number
): { inning: number; runs: number; hits: number }[] {
  const result: { inning: number; runs: number; hits: number }[] = [];
  for (let i = 1; i <= maxInnings; i++) {
    const inningPas = plateAppearances.filter((pa) => pa.inning === i);
    const runs = inningPas.reduce((s, p) => s + p.runsScored, 0);
    const hits = inningPas.filter((p) => OUTCOME_DEFINITIONS[p.outcome].isHit).length;
    result.push({ inning: i, runs, hits });
  }
  return result;
}

export function formatGameSummaryText(game: GameRecord): string {
  const { players, totals } = calculatePlayerStats(game.lineup, game.plateAppearances);
  const inningScores = calculateInningRuns(game.plateAppearances, game.maxInnings);

  const attackLabel = game.teamAttackOrder === 'second' ? '後攻' : '先攻';
  const lines: string[] = [];
  lines.push(`【${game.title}】${game.date}`);
  lines.push(
    `${game.teamName}(${attackLabel}) ${totals.runs} : ${game.opponentScore} ${game.opponentName}`
  );
  lines.push(
    `團隊打擊：${totals.ab}打數 ${totals.h}安打 · ${totals.rbi}打點 · ${totals.bb}保送 · ${totals.so}三振 · 打擊率 ${formatAvg(totals.avg)}`
  );
  lines.push('');
  lines.push(
    '逐局得分：' +
      inningScores.map((x) => `${x.inning}局(${x.runs})`).join(' ')
  );
  lines.push('');
  lines.push('--- 打者個人數據 ---');
  const exportPlayers = players.filter(
    (p) => p.slot <= 9 || p.name.trim() !== '' || p.pa > 0
  );
  for (const p of exportPlayers) {
    const outcomeStr =
      p.outcomes.length > 0
        ? p.outcomes.map((o) => OUTCOME_DEFINITIONS[o].shortLabel).join(' / ')
        : '尚無打席';
    lines.push(
      `${p.slot}棒 #${p.number || '-'} ${p.name}：${p.ab}-${p.h} (${p.rbi}打點, AVG ${formatAvg(p.avg)})｜${outcomeStr}`
    );
  }
  const directionSummary = calculateHitDirectionStats(game.plateAppearances);
  const hitTypeSummary = calculateHitTypeStats(game.plateAppearances);
  if (directionSummary.totalRecorded > 0) {
    const outfieldLine = HIT_DIRECTION_GROUPS[0].codes
      .map((c) => `${HIT_DIRECTION_DEFINITIONS[c].label} ${directionSummary.byCode[c]}`)
      .join(' / ');
    const infieldLine = HIT_DIRECTION_GROUPS[1].codes
      .map((c) => `${HIT_DIRECTION_DEFINITIONS[c].label} ${directionSummary.byCode[c]}`)
      .join(' / ');
    lines.push('');
    lines.push(`--- 擊球方向統計（共 ${directionSummary.totalRecorded} 球）---`);
    lines.push(`外野 (${directionSummary.outfieldCount})：${outfieldLine}`);
    lines.push(`內野 (${directionSummary.infieldCount})：${infieldLine}`);
  }
  if (hitTypeSummary.totalRecorded > 0) {
    const typeLine = HIT_TYPE_CODES.map(
      (c) => `${HIT_TYPE_DEFINITIONS[c].label} ${hitTypeSummary.byCode[c]}`
    ).join(' / ');
    lines.push(`擊球型態（共 ${hitTypeSummary.totalRecorded} 球）：${typeLine}`);
  }

  return lines.join('\n');
}

export function generateCsvExport(game: GameRecord): string {
  const { players, totals } = calculatePlayerStats(game.lineup, game.plateAppearances);
  const directionSummary = calculateHitDirectionStats(game.plateAppearances);
  const hitTypeSummary = calculateHitTypeStats(game.plateAppearances);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  const rows: string[] = [];
  rows.push(['比賽名稱', game.title, '日期', game.date].map(escape).join(','));
  rows.push(
    ['我方隊伍', game.teamName, '得分', totals.runs, '對手', game.opponentName, '對手得分', game.opponentScore]
      .map(escape)
      .join(',')
  );
  rows.push('');
  rows.push(
    ['棒次', '背號', '姓名', '打席(PA)', '打數(AB)', '安打(H)', '一安', '二安', '三安', '全壘打', '打點(RBI)', '保送(BB)', '觸身(HBP)', '三振(SO)', '打擊率(AVG)', '上壘率(OBP)', '長打率(SLG)', '打席歷程']
      .map(escape)
      .join(',')
  );

  const exportPlayers = players.filter(
    (p) => p.slot <= 9 || p.name.trim() !== '' || p.pa > 0
  );
  for (const p of exportPlayers) {
    rows.push(
      [
        `${p.slot}棒`,
        p.number,
        p.name,
        p.pa,
        p.ab,
        p.h,
        p.singles,
        p.doubles,
        p.triples,
        p.hr,
        p.rbi,
        p.bb,
        p.hbp,
        p.so,
        formatAvg(p.avg),
        formatAvg(p.obp),
        formatAvg(p.slg),
        p.outcomes.map((o) => OUTCOME_DEFINITIONS[o].label).join(' / '),
      ]
        .map(escape)
        .join(',')
    );
  }

  rows.push('');
  rows.push(['擊球方向統計', `共 ${directionSummary.totalRecorded} 球`].map(escape).join(','));
  rows.push(['區域', '擊球方向', '代碼', '次數', '佔比'].map(escape).join(','));
  for (const group of HIT_DIRECTION_GROUPS) {
    for (const code of group.codes) {
      const def = HIT_DIRECTION_DEFINITIONS[code];
      const count = directionSummary.byCode[code];
      const pct =
        directionSummary.totalRecorded > 0
          ? `${Math.round((count / directionSummary.totalRecorded) * 100)}%`
          : '0%';
      rows.push(
        [group.title, def.label, def.code, count, pct].map(escape).join(',')
      );
    }
  }

  rows.push('');
  rows.push(['擊球型態統計', `共 ${hitTypeSummary.totalRecorded} 球`].map(escape).join(','));
  rows.push(['擊球型態', '代碼', '次數', '佔比'].map(escape).join(','));
  for (const code of HIT_TYPE_CODES) {
    const def = HIT_TYPE_DEFINITIONS[code];
    const count = hitTypeSummary.byCode[code];
    const pct =
      hitTypeSummary.totalRecorded > 0
        ? `${Math.round((count / hitTypeSummary.totalRecorded) * 100)}%`
        : '0%';
    rows.push([def.label, def.code, count, pct].map(escape).join(','));
  }

  rows.push('');
  rows.push(['逐打席詳細紀錄'].map(escape).join(','));
  rows.push(['序號', '局數', '半局', '棒次', '背號', '姓名', '打席結果', '擊球方向', '擊球型態', '打點', '得分', '記錄出局數'].map(escape).join(','));

  game.plateAppearances.forEach((pa, idx) => {
    const dirLabel = pa.hitDirection
      ? HIT_DIRECTION_DEFINITIONS[pa.hitDirection].label
      : '';
    const typeLabel = pa.hitType
      ? HIT_TYPE_DEFINITIONS[pa.hitType].label
      : '';
    rows.push(
      [
        idx + 1,
        getInningLabel(pa.inning),
        pa.inningHalf === 'top' ? '上半' : '下半',
        `${pa.batterSlot}棒`,
        pa.batterNumber,
        pa.batterName,
        OUTCOME_DEFINITIONS[pa.outcome].label,
        dirLabel,
        typeLabel,
        pa.rbi,
        pa.runsScored,
        pa.outsRecorded,
      ]
        .map(escape)
        .join(',')
    );
  });

  // Add UTF-8 BOM so Excel opens Traditional Chinese cleanly
  return '\uFEFF' + rows.join('\r\n');
}
