export type AgeCohort = '18-24' | '25-34' | '35-44' | '45+';
export type Frequency = 'Daily' | 'Weekly' | 'Occasional';
export type TestLocation = 'Mall Kiosk' | 'University Campus' | 'Corporate Lounge';
export type BrandChoice = 'coca-cola' | 'competitor' | 'tie';
export type ModuleId = 'terminal' | 'reveal' | 'dashboard';
export type DateRangeKey = 'all' | '24h' | '7d' | '30d';

export interface SensoryMetric {
  key: string;
  label: string;
  hint: string;
}

export const SENSORY_METRICS: SensoryMetric[] = [
  { key: 'carbonation', label: 'Carbonation Bite', hint: 'CO2 Effervescence' },
  { key: 'brix', label: 'Brix / Sweetness Balance', hint: 'Sugar-acid harmony' },
  { key: 'acidity', label: 'Acidity & Citrus Crispness', hint: 'Bright top notes' },
  { key: 'aroma', label: 'Caramel & Spice Aroma Note', hint: 'Nose / bouquet' },
  { key: 'mouthfeel', label: 'Syrup Mouthfeel / Viscosity', hint: 'Body & weight' },
  { key: 'aftertaste', label: 'Aftertaste Cleanliness', hint: 'Finish length' },
];

export const AGE_COHORTS: AgeCohort[] = ['18-24', '25-34', '35-44', '45+'];
export const FREQUENCIES: Frequency[] = ['Daily', 'Weekly', 'Occasional'];
export const LOCATIONS: TestLocation[] = ['Mall Kiosk', 'University Campus', 'Corporate Lounge'];

export const COKE_LOGO_URL =
  'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg';

export const BRAND = {
  coke: '#F40009',
  cokeHover: '#D10007',
  cokeSubtle: 'rgba(244, 0, 9, 0.08)',
  competitor: '#3B82F6',
  tie: '#94A3B8',
  nav: '#09090B',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  edge: '#E2E8F0',
} as const;

/** National organoleptic baselines (means per metric, 1-10) */
export const NATIONAL_BASELINE_COKES = [8.8, 9.0, 8.7, 8.9, 8.8, 9.1];
export const NATIONAL_BASELINE_COMP = [7.0, 7.3, 6.9, 7.2, 7.0, 7.2];

export interface Evaluation {
  id: string;
  timestamp: string; // ISO
  location: TestLocation;
  ageCohort: AgeCohort;
  frequency: Frequency;
  batchCoke: number; // 3-digit code that secretly is Coca-Cola
  batchComp: number; // 3-digit code that secretly is competitor
  cokeScores: number[];
  compScores: number[];
  preference: BrandChoice;
  cokeMean: number;
  compMean: number;
}

export interface Filters {
  location: TestLocation | 'All';
  age: AgeCohort | 'All';
  range: DateRangeKey;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clampScore(v: number): number {
  const r = Math.round(v * 10) / 10;
  if (r < 1) return 1;
  if (r > 10) return 10;
  return r;
}

function pickWeighted<T>(rand: () => number, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let x = rand() * total;
  for (let i = 0; i < items.length; i++) {
    x -= weights[i];
    if (x <= 0) return items[i];
  }
  return items[items.length - 1];
}

function gauss(rand: () => number): number {
  // Box-Muller approx via sum of uniforms
  return (rand() + rand() + rand() + rand() - 2) / 1.2;
}

export function meanOf(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function randomBatchCode(rand: () => number = Math.random): number {
  return 100 + Math.floor(rand() * 900);
}

export function generateSeedEvaluations(count = 1240): Evaluation[] {
  const rand = mulberry32(20260214);
  const out: Evaluation[] = [];
  const now = Date.now();
  const fourteenDays = 14 * 24 * 3600 * 1000;

  for (let i = 0; i < count; i++) {
    const r = rand();
    let preference: BrandChoice;
    if (r < 0.684) preference = 'coca-cola';
    else if (r < 0.684 + 0.246) preference = 'competitor';
    else preference = 'tie';

    const location = pickWeighted(rand, LOCATIONS, [0.38, 0.33, 0.29]);
    const ageCohort = pickWeighted(rand, AGE_COHORTS, [0.28, 0.34, 0.22, 0.16]);
    const frequency = pickWeighted(rand, FREQUENCIES, [0.42, 0.38, 0.2]);

    const cokeScores: number[] = [];
    const compScores: number[] = [];
    for (let m = 0; m < 6; m++) {
      const cokeBase = NATIONAL_BASELINE_COKES[m];
      const compBase = NATIONAL_BASELINE_COMP[m];
      if (preference === 'coca-cola') {
        cokeScores.push(clampScore(cokeBase + gauss(rand) * 0.55));
        compScores.push(clampScore(compBase + gauss(rand) * 0.8 - 0.15));
      } else if (preference === 'competitor') {
        cokeScores.push(clampScore(cokeBase + gauss(rand) * 0.8 - 1.1));
        compScores.push(clampScore(compBase + gauss(rand) * 0.6 + 1.15));
      } else {
        cokeScores.push(clampScore(7.9 + gauss(rand) * 0.7));
        compScores.push(clampScore(7.8 + gauss(rand) * 0.7));
      }
    }

    const ts = new Date(now - Math.floor(rand() * fourteenDays)).toISOString();
    out.push({
      id: `SES-${String(100000 + i).slice(1)}`,
      timestamp: ts,
      location,
      ageCohort,
      frequency,
      batchCoke: 100 + Math.floor(rand() * 900),
      batchComp: 100 + Math.floor(rand() * 900),
      cokeScores,
      compScores,
      preference,
      cokeMean: Math.round(meanOf(cokeScores) * 100) / 100,
      compMean: Math.round(meanOf(compScores) * 100) / 100,
    });
  }
  // newest first
  out.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  return out;
}

export function applyFilters(list: Evaluation[], f: Filters): Evaluation[] {
  const now = Date.now();
  return list.filter((e) => {
    if (f.location !== 'All' && e.location !== f.location) return false;
    if (f.age !== 'All' && e.ageCohort !== f.age) return false;
    if (f.range !== 'all') {
      const age = now - +new Date(e.timestamp);
      if (f.range === '24h' && age > 24 * 3600 * 1000) return false;
      if (f.range === '7d' && age > 7 * 24 * 3600 * 1000) return false;
      if (f.range === '30d' && age > 30 * 24 * 3600 * 1000) return false;
    }
    return true;
  });
}

export interface KpiSummary {
  n: number;
  cokeShare: number;
  compShare: number;
  tieShare: number;
  cokeMean: number;
  compMean: number;
  loyalty: number; // blind-to-brand conversion proxy
}

export function summarize(list: Evaluation[]): KpiSummary {
  const n = list.length;
  if (n === 0) {
    return { n: 0, cokeShare: 0, compShare: 0, tieShare: 0, cokeMean: 0, compMean: 0, loyalty: 0 };
  }
  const cokeWins = list.filter((e) => e.preference === 'coca-cola').length;
  const compWins = list.filter((e) => e.preference === 'competitor').length;
  const ties = n - cokeWins - compWins;
  const cokeMean = meanOf(list.map((e) => e.cokeMean));
  const compMean = meanOf(list.map((e) => e.compMean));
  // Loyalty proxy: share of coke-blind-winners who are Daily/Weekly drinkers, scaled to ~84%
  const cokeLoyalBase = list.filter(
    (e) => e.preference === 'coca-cola' && e.frequency !== 'Occasional',
  ).length;
  const loyalty = n === 0 ? 0 : (cokeWins === 0 ? 0 : Math.min(98, (cokeLoyalBase / Math.max(1, cokeWins)) * 100 * 0.97 + 8));
  return {
    n,
    cokeShare: (cokeWins / n) * 100,
    compShare: (compWins / n) * 100,
    tieShare: (ties / n) * 100,
    cokeMean,
    compMean,
    loyalty,
  };
}

export function fmtPct(v: number, digits = 1): string {
  return `${v.toFixed(digits)}%`;
}

export function fmtMean(v: number): string {
  return v.toFixed(1);
}
