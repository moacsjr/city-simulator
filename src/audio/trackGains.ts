/**
 * Pure gain math for the 4 ambience layers (spec tracksConfig).
 * Equal-power crossfades: within each overlap zone the outgoing track follows
 * cos(u·π/2) and the incoming sin(u·π/2), so Σgain² = 1 at every progress —
 * constant acoustic power, no pops (see docs/audio.md for the spec deviation).
 */
import { clamp } from '../lib/progress';

export interface TrackConfig {
  id: string;
  url: string;
  range: readonly [number, number];
}

export const TRACKS: readonly TrackConfig[] = [
  { id: 'selvagem', url: '/assets/audio/wilderness.mp3', range: [0.0, 0.3] },
  { id: 'fundacao', url: '/assets/audio/hamlet.mp3', range: [0.2, 0.6] },
  { id: 'cidade', url: '/assets/audio/urban_market.mp3', range: [0.5, 0.8] },
  { id: 'auge', url: '/assets/audio/medieval_festival.mp3', range: [0.7, 1.0] },
];

/** Master gain fixed at 0.8 — clipping protection (spec mandate). */
export const MASTER_GAIN = 0.8;

/**
 * Gain of track `index` at normalized progress t∈[0,1].
 * Fade zones are the overlaps with the neighboring tracks' ranges:
 * rise over [min, prevMax], full between, fall over [nextMin, max].
 */
export function gainForTrack(index: number, t: number): number {
  const [min, max] = TRACKS[index].range;
  const p = clamp(t, 0, 1);
  if (p < min || p > max) return 0;

  const riseEnd = index > 0 ? Math.min(TRACKS[index - 1].range[1], max) : min;
  const fallStart = index < TRACKS.length - 1 ? Math.max(TRACKS[index + 1].range[0], min) : max;

  if (p < riseEnd) {
    const u = (p - min) / (riseEnd - min);
    return Math.sin((u * Math.PI) / 2); // incoming: equal-power rise
  }
  if (p > fallStart) {
    const u = (p - fallStart) / (max - fallStart);
    return Math.cos((u * Math.PI) / 2); // outgoing: equal-power fall
  }
  return 1;
}

/** Gains for all tracks at progress (0–100 scale, as the store emits). */
export function gainsAt(progress: number): number[] {
  const t = clamp(progress / 100, 0, 1);
  return TRACKS.map((_, i) => gainForTrack(i, t));
}
