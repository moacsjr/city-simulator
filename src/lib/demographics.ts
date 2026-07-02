/** Demographic curve (spec Table 3): piecewise-linear NPC count vs progress. */
import { clamp } from './progress';

export const POPULATION_ANCHORS: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [15, 10],
  [25, 20],
  [30, 35],
  [45, 50],
  [50, 60],
  [55, 80],
  [70, 120],
  [75, 150],
  [85, 220],
  [100, 300],
];

export const MAX_POPULATION = 300;

export function populationAt(progress: number): number {
  const p = clamp(progress, 0, 100);
  for (let i = 0; i < POPULATION_ANCHORS.length - 1; i++) {
    const [p0, n0] = POPULATION_ANCHORS[i];
    const [p1, n1] = POPULATION_ANCHORS[i + 1];
    if (p >= p0 && p <= p1) {
      return Math.round(n0 + ((p - p0) / (p1 - p0)) * (n1 - n0));
    }
  }
  return MAX_POPULATION;
}
