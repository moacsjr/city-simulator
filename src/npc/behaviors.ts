/** Pure per-stage NPC behavior tables: class mix, colors, destination biases. */
import { clamp } from '../lib/progress';
import type { WaypointTag } from './waypointGraph';

export type NpcClass = 'peasant' | 'trader' | 'guard' | 'student' | 'noble';

export const CLASS_COLOR: Record<NpcClass, number> = {
  peasant: 0x8a6f45,
  trader: 0x4a6d8a,
  guard: 0x9d3b3b,
  student: 0x3f7a52,
  noble: 0x7a4a9d,
};

/** Fractions per class as the society matures (sums to 1). */
export function classMixAt(progress: number): Record<NpcClass, number> {
  const p = clamp(progress, 0, 100);
  const trader = p < 30 ? 0 : Math.min(0.25, ((p - 30) / 70) * 0.35);
  const guard = p < 50 ? 0 : Math.min(0.18, ((p - 50) / 50) * 0.3);
  const student = p < 72 ? 0 : Math.min(0.1, ((p - 72) / 28) * 0.15);
  const noble = p < 80 ? 0 : Math.min(0.08, ((p - 80) / 20) * 0.1);
  const peasant = 1 - trader - guard - student - noble;
  return { peasant, trader, guard, student, noble };
}

export function classCountsAt(progress: number, population: number): Record<NpcClass, number> {
  const mix = classMixAt(progress);
  const counts: Record<NpcClass, number> = {
    peasant: 0,
    trader: Math.floor(population * mix.trader),
    guard: Math.floor(population * mix.guard),
    student: Math.floor(population * mix.student),
    noble: Math.floor(population * mix.noble),
  };
  counts.peasant = population - counts.trader - counts.guard - counts.student - counts.noble;
  return counts;
}

/** Tag each class gravitates to (woodcutters early, guards on walls, ...). */
export function preferredTag(cls: NpcClass, progress: number): WaypointTag | null {
  switch (cls) {
    case 'guard':
      return progress >= 56 ? 'wall' : null;
    case 'trader':
      return progress >= 40 && progress < 55 ? 'dock' : 'market';
    case 'student':
      return 'market';
    case 'noble':
      return progress >= 62 ? 'castle' : 'market';
    case 'peasant':
      return progress < 30 ? 'forest' : null;
  }
}

/**
 * Pick the next waypoint for a random walk: prefer a neighbor with the class's
 * preferred tag, avoid immediate backtracking, else uniform among neighbors.
 * `rngValue` in [0,1) keeps this pure/deterministic for tests.
 */
export function pickNext(
  neighbors: ReadonlyArray<{ index: number; tag: WaypointTag }>,
  previousIndex: number,
  cls: NpcClass,
  progress: number,
  rngValue: number,
): number {
  if (neighbors.length === 0) return previousIndex;
  const tag = preferredTag(cls, progress);
  const tagged = tag ? neighbors.filter((n) => n.tag === tag) : [];
  if (tagged.length > 0 && rngValue < 0.6) {
    return tagged[Math.floor((rngValue / 0.6) * tagged.length)]!.index;
  }
  const nonBack = neighbors.filter((n) => n.index !== previousIndex);
  const pool = nonBack.length > 0 ? nonBack : neighbors;
  return pool[Math.floor(rngValue * pool.length)]!.index;
}
