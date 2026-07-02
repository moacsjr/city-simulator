/**
 * Pure stage/lighting data per spec/city-simulator.md Table 1.
 * Lighting evolves cold/desaturated (wilderness) → warm/golden/contrasted (zenith).
 * No THREE imports — fully unit-testable.
 */
import { hexToRgb, lerpRgb, type Rgb } from '../lib/color';
import { clamp } from '../lib/progress';

export interface Stage {
  from: number;
  to: number;
  name: string;
}

export const STAGES: readonly Stage[] = [
  { from: 0, to: 10, name: 'Território Selvagem' },
  { from: 10, to: 20, name: 'Fundação' },
  { from: 20, to: 30, name: 'Vila Crescente' },
  { from: 30, to: 40, name: 'Aldeia Organizada' },
  { from: 40, to: 50, name: 'Centro Comercial' },
  { from: 50, to: 60, name: 'Cidade Murada' },
  { from: 60, to: 70, name: 'Expansão' },
  { from: 70, to: 80, name: 'Prosperidade' },
  { from: 80, to: 90, name: 'Capital Medieval' },
  { from: 90, to: 100, name: 'Auge' },
];

export function stageAt(progress: number): Stage {
  const p = clamp(progress, 0, 100);
  return STAGES.find((s) => p >= s.from && p < s.to) ?? STAGES[STAGES.length - 1];
}

export interface LightingState {
  sky: Rgb;
  sun: Rgb;
  sunIntensity: number;
  ambient: Rgb;
  ambientIntensity: number;
  fog: Rgb;
  fogNear: number;
  fogFar: number;
  /** Sun elevation in degrees above the horizon (low = long shadows). */
  sunElevation: number;
}

interface LightingKeyframe extends Omit<LightingState, 'sky' | 'sun' | 'ambient' | 'fog'> {
  p: number;
  sky: number;
  sun: number;
  ambient: number;
  fog: number;
}

const KEYFRAMES: readonly LightingKeyframe[] = [
  // Wilderness: cold, low-saturation, long diffuse shadows.
  {
    p: 0,
    sky: 0x9db4c4,
    sun: 0xd8e2ec,
    sunIntensity: 1.6,
    ambient: 0x8fa3b3,
    ambientIntensity: 0.55,
    fog: 0xaabfcc,
    fogNear: 60,
    fogFar: 220,
    sunElevation: 22,
  },
  // Rural community: slightly warmer, more defined light.
  {
    p: 25,
    sky: 0xa3c4de,
    sun: 0xf5ecd8,
    sunIntensity: 2.0,
    ambient: 0x9cabb5,
    ambientIntensity: 0.48,
    fog: 0xb5c8d4,
    fogNear: 70,
    fogFar: 250,
    sunElevation: 32,
  },
  // Commercial center: clear yellow sunlight, higher contrast.
  {
    p: 50,
    sky: 0x87ceeb,
    sun: 0xffeebb,
    sunIntensity: 2.3,
    ambient: 0xa8b4ba,
    ambientIntensity: 0.42,
    fog: 0xbcd2de,
    fogNear: 80,
    fogFar: 280,
    sunElevation: 42,
  },
  // Prosperity: warm stone city, strong light.
  {
    p: 75,
    sky: 0x92c2e4,
    sun: 0xffdf96,
    sunIntensity: 2.55,
    ambient: 0xb0a89a,
    ambientIntensity: 0.38,
    fog: 0xcfd3c8,
    fogNear: 85,
    fogFar: 300,
    sunElevation: 38,
  },
  // Zenith: golden, contrasted, festive.
  {
    p: 100,
    sky: 0xf0bf7e,
    sun: 0xffb85c,
    sunIntensity: 2.8,
    ambient: 0xc9a377,
    ambientIntensity: 0.34,
    fog: 0xe6bd8a,
    fogNear: 90,
    fogFar: 320,
    sunElevation: 28,
  },
];

export function lightingAt(progress: number): LightingState {
  const p = clamp(progress, 0, 100);
  let a = KEYFRAMES[0];
  let b = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (p >= KEYFRAMES[i].p && p <= KEYFRAMES[i + 1].p) {
      a = KEYFRAMES[i];
      b = KEYFRAMES[i + 1];
      break;
    }
  }
  const t = a.p === b.p ? 0 : (p - a.p) / (b.p - a.p);
  const mix = (x: number, y: number) => x + (y - x) * t;
  return {
    sky: lerpRgb(hexToRgb(a.sky), hexToRgb(b.sky), t),
    sun: lerpRgb(hexToRgb(a.sun), hexToRgb(b.sun), t),
    sunIntensity: mix(a.sunIntensity, b.sunIntensity),
    ambient: lerpRgb(hexToRgb(a.ambient), hexToRgb(b.ambient), t),
    ambientIntensity: mix(a.ambientIntensity, b.ambientIntensity),
    fog: lerpRgb(hexToRgb(a.fog), hexToRgb(b.fog), t),
    fogNear: mix(a.fogNear, b.fogNear),
    fogFar: mix(a.fogFar, b.fogFar),
    sunElevation: mix(a.sunElevation, b.sunElevation),
  };
}
