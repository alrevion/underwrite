import { expect, test } from "vitest";
import { split, vested } from "./split";

test("split sums to exactly 100.0, weights shift shares, vesting has a cliff", () => {
  const s = (a: number, b: number, c: number, d: number) => ({ name: "", score: { idea: a, execution: b, capital: c, time: d } });
  const w = { idea: 1, execution: 3, capital: 2, time: 4 };
  for (const team of [[s(7, 5, 1, 9), s(3, 8, 6, 10), s(5, 5, 5, 2)], [s(1, 1, 1, 1), s(1, 1, 1, 1), s(1, 1, 1, 1)], [s(0, 0, 0, 0), s(0, 0, 0, 0)]]) {
    const out = split(team, w);
    expect(Math.round(out.reduce((a, b) => a + b, 0) * 10)).toBe(1000);
  }
  expect(split([s(1, 1, 1, 1), s(1, 1, 1, 1), s(1, 1, 1, 1)], w)).toEqual([33.4, 33.3, 33.3]);
  const [a, b] = split([s(10, 0, 0, 0), s(0, 10, 0, 0)], { idea: 1, execution: 3, capital: 0, time: 0 });
  expect([a, b]).toEqual([25, 75]);
  expect([vested(11), vested(12), vested(48), vested(60)]).toEqual([0, 0.25, 1, 1]);
});
