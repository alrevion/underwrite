// Founder equity split: weighted contribution scores -> percentages that sum to exactly 100.0.
export const FACTORS = ["idea", "execution", "capital", "time"] as const;
export type Factor = (typeof FACTORS)[number];
export type Founder = { name: string; score: Record<Factor, number> }; // each 0..10
export type Weights = Record<Factor, number>; // any non-negative numbers

/** Largest-remainder rounding to 0.1, so the shares always add to exactly 1000 tenths. */
export function split(founders: Founder[], w: Weights): number[] {
  const n = founders.length;
  if (!n) return [];
  const raw = founders.map(() => 0);
  let used = 0;
  for (const f of FACTORS) {
    const total = founders.reduce((a, x) => a + Math.max(0, x.score[f]), 0);
    const wt = Math.max(0, w[f]);
    if (total <= 0 || wt <= 0) continue;
    used += wt;
    founders.forEach((x, i) => { raw[i]! += (wt * Math.max(0, x.score[f])) / total; });
  }
  const shares = used > 0 ? raw.map((v) => (v / used) * 1000) : raw.map(() => 1000 / n);
  const floor = shares.map(Math.floor);
  let left = 1000 - floor.reduce((a, b) => a + b, 0);
  shares.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left-- > 0) floor[i]!++; });
  return floor.map((v) => v / 10);
}

/** 4-year vesting, 1-year cliff: share of the grant vested after `month` months. */
export function vested(month: number): number {
  if (month < 12) return 0;
  return Math.min(1, month / 48);
}
