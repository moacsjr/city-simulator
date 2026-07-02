import { clamp, evolutiveScale, smoothstep } from './progress';

/** Per-instance evolution config: grow by smoothstep, optionally retire (shrink away). */
export interface InstanceEvolution {
  appearAt: number;
  growStart: number;
  growEnd: number;
  maxScale: number;
  /** Progress at which the instance starts shrinking out (e.g. forest clearing). */
  retireAt?: number;
  /** Progress span of the retire shrink (default 6). */
  retireSpan?: number;
}

export function instanceScaleAt(evolution: InstanceEvolution, progress: number): number {
  let scale = evolutiveScale(evolution, progress);
  if (evolution.retireAt !== undefined && progress >= evolution.retireAt) {
    const span = evolution.retireSpan ?? 6;
    scale *= 1 - smoothstep(evolution.retireAt, evolution.retireAt + span, progress);
  }
  return scale;
}

/** Normalized color-lerp factor over a progress window [start, end]. */
export function colorFactorAt(start: number, end: number, progress: number): number {
  if (end === start) return progress >= end ? 1 : 0;
  return clamp((progress - start) / (end - start), 0, 1);
}
