/**
 * Core interpolation math from spec/city-simulator.md.
 * All object state derives from the single global progress value.
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smoothstep 3t² − 2t³ over [edge0, edge1], per spec scale animation. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export interface EvolutiveConfig {
  appearAt: number;
  growStart: number;
  growEnd: number;
  maxScale: number;
}

/** Scale of an evolutive object at a given progress (0–100). */
export function evolutiveScale(config: EvolutiveConfig, progress: number): number {
  if (progress < config.appearAt) return 0;
  return smoothstep(config.growStart, config.growEnd, progress) * config.maxScale;
}

/**
 * Equal-power crossfade gains for a normalized transition t in [0, 1].
 * Constant perceived loudness: gainA² + gainB² = 1.
 */
export function equalPowerCrossfade(t: number): { gainA: number; gainB: number } {
  const clamped = clamp(t, 0, 1);
  return {
    gainA: Math.cos((clamped * Math.PI) / 2),
    gainB: Math.sin((clamped * Math.PI) / 2),
  };
}
