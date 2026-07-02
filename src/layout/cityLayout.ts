/**
 * Seeded, pure city layout — positions only, no THREE imports.
 * World: 200×200 ground centered at origin; city nucleates at the origin
 * beside the river, forest fills the rest.
 */
import { clamp } from '../lib/progress';
import { mulberry32, randRange } from '../lib/random';

export const WORLD_HALF = 95;

/** River: straight band crossing the map along X. */
export const RIVER = { z: -28, width: 6 } as const;

/** Initial camp zone around the origin (kept clear of trees). */
export const CAMP_RADIUS = 8;

/** Radius the city has cleared of forest at a given progress (linear growth). */
const CLEAR_START_P = 12; // Derrube da Floresta event at 15% falls inside the first window
const CLEAR_END_P = 85;
const CLEAR_MAX_RADIUS = 70;

export function clearingRadiusAt(progress: number): number {
  const t = clamp((progress - CLEAR_START_P) / (CLEAR_END_P - CLEAR_START_P), 0, 1);
  return CAMP_RADIUS + t * (CLEAR_MAX_RADIUS - CAMP_RADIUS);
}

/** Progress at which a tree at `distance` from the origin gets cleared. */
export function treeRetireAt(distance: number): number | undefined {
  if (distance > CLEAR_MAX_RADIUS) return undefined;
  if (distance <= CAMP_RADIUS) return CLEAR_START_P;
  const t = (distance - CAMP_RADIUS) / (CLEAR_MAX_RADIUS - CAMP_RADIUS);
  return CLEAR_START_P + t * (CLEAR_END_P - CLEAR_START_P);
}

export function isInRiver(z: number, margin = 0): boolean {
  return Math.abs(z - RIVER.z) <= RIVER.width / 2 + margin;
}

export interface TreeSpot {
  x: number;
  z: number;
  scale: number;
  rotationY: number;
  retireAt?: number;
}

export function generateForest(seed = 1, count = 1200): TreeSpot[] {
  const rng = mulberry32(seed);
  const trees: TreeSpot[] = [];
  while (trees.length < count) {
    const x = randRange(rng, -WORLD_HALF, WORLD_HALF);
    const z = randRange(rng, -WORLD_HALF, WORLD_HALF);
    if (isInRiver(z, 2)) continue;
    const distance = Math.hypot(x, z);
    if (distance < CAMP_RADIUS + 2) continue;
    trees.push({
      x,
      z,
      scale: randRange(rng, 0.7, 1.4),
      rotationY: randRange(rng, 0, Math.PI * 2),
      retireAt: treeRetireAt(distance),
    });
  }
  return trees;
}
