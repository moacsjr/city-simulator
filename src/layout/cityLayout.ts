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

/** Central plaza (market square) kept clear of houses. */
export const PLAZA_RADIUS = 6;

/** Landmark sites (individual meshes allowed: Cathedral, Castle, Town Hall). */
export const SITES = {
  castle: { x: 26, z: 24 },
  cathedral: { x: -12, z: 10 },
  townHall: { x: 9, z: -9 },
} as const;

const SITE_CLEARANCE = 8;
const HOUSE_MAX_RADIUS = 42;

/** Progress at which a plot at `distance` from the origin becomes buildable. */
export function plotUnlockAt(distance: number): number {
  const t = clamp(distance / HOUSE_MAX_RADIUS, 0, 1);
  return 10 + t * 55; // nearest plots at 10%, city edge at ~65%
}

export interface Plot {
  x: number;
  z: number;
  rotationY: number;
  unlockAt: number;
}

function nearSite(x: number, z: number): boolean {
  return Object.values(SITES).some((s) => Math.hypot(x - s.x, z - s.z) < SITE_CLEARANCE);
}

function nearRoad(x: number, z: number): boolean {
  // road cross: north-south at x=0, east-west at z=5 (see generateRoadSegments)
  return (Math.abs(x) < 2.5 && z > RIVER.z) || Math.abs(z - 5) < 2.5;
}

export function generateHousePlots(seed = 11, count = 140): Plot[] {
  const rng = mulberry32(seed);
  const plots: Plot[] = [];
  while (plots.length < count) {
    const x = randRange(rng, -HOUSE_MAX_RADIUS, HOUSE_MAX_RADIUS);
    const z = randRange(rng, -HOUSE_MAX_RADIUS, HOUSE_MAX_RADIUS);
    const distance = Math.hypot(x, z);
    if (distance > HOUSE_MAX_RADIUS || distance < PLAZA_RADIUS + 2) continue;
    if (isInRiver(z, 3) || nearSite(x, z) || nearRoad(x, z)) continue;
    if (plots.some((p) => Math.hypot(p.x - x, p.z - z) < 4)) continue; // min spacing
    plots.push({
      x,
      z,
      rotationY: randRange(rng, 0, Math.PI * 2),
      unlockAt: plotUnlockAt(distance) + randRange(rng, 0, 4),
    });
  }
  return plots;
}

export function generateFieldPlots(seed = 23, count = 36): Plot[] {
  const rng = mulberry32(seed);
  const plots: Plot[] = [];
  while (plots.length < count) {
    const angle = randRange(rng, 0, Math.PI * 2);
    const radius = randRange(rng, HOUSE_MAX_RADIUS + 6, 68);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (isInRiver(z, 5)) continue;
    if (plots.some((p) => Math.hypot(p.x - x, p.z - z) < 9)) continue;
    plots.push({
      x,
      z,
      rotationY: randRange(rng, 0, Math.PI * 2),
      unlockAt: plotUnlockAt(radius) + randRange(rng, 0, 5),
    });
  }
  return plots;
}

export interface RoadSegment {
  x: number;
  z: number;
  rotationY: number;
  unlockAt: number;
}

/** Road cross: north-south main road (bridging the river) + east-west road. */
export function generateRoadSegments(step = 2): RoadSegment[] {
  const segments: RoadSegment[] = [];
  for (let z = RIVER.z - 14; z <= 44; z += step) {
    if (isInRiver(z)) continue; // the bridge covers the gap (M6 prop)
    segments.push({ x: 0, z, rotationY: 0, unlockAt: plotUnlockAt(Math.abs(z)) });
  }
  for (let x = -44; x <= 44; x += step) {
    if (Math.abs(x) < step) continue; // crossing already covered
    segments.push({ x, z: 5, rotationY: Math.PI / 2, unlockAt: plotUnlockAt(Math.abs(x)) });
  }
  return segments;
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
