/**
 * Transition-chain math (spec Table 2): a plot evolves through up to 5
 * maturity levels. Each level is a separate instanced pool; the outgoing
 * level retires (shrinks/sinks) over the same window the incoming one grows.
 * Pure — returns InstanceEvolution windows consumed by InstancedEvolutive.
 */
import type { InstanceEvolution } from './instanceState';

/** Progress at which each maturity level starts, per chain. */
export const HOUSE_BANDS = [12, 25, 45, 65, 82] as const;
export const ROAD_BANDS = [14, 28, 46, 66, 84] as const;
export const FIELD_BANDS = [15, 30, 50, 70, 85] as const;

export interface ChainLevel {
  level: number;
  evolution: InstanceEvolution;
}

/**
 * Windows for one plot. `unlockAt` delays the whole chain (plots farther from
 * the center join later — a house built late starts directly at a higher
 * level, earlier levels are skipped). `jitter` staggers neighbors.
 */
export function chainWindows(
  bands: readonly number[],
  unlockAt = 0,
  jitter = 0,
  growSpan = 4,
): ChainLevel[] {
  const levels: ChainLevel[] = [];
  for (let l = 0; l < bands.length; l++) {
    const start = Math.max(bands[l], unlockAt) + jitter;
    const next = l + 1 < bands.length ? Math.max(bands[l + 1], unlockAt) + jitter : undefined;
    if (next !== undefined && next <= start) continue; // unlocked past this level
    levels.push({
      level: l,
      evolution: {
        appearAt: start,
        growStart: start,
        growEnd: start + growSpan,
        maxScale: 1,
        retireAt: next,
        retireSpan: growSpan,
      },
    });
  }
  return levels;
}
