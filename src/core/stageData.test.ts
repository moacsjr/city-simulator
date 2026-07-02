import { describe, expect, it } from 'vitest';
import { STAGES, lightingAt, stageAt } from './stageData';

describe('STAGES', () => {
  it('has 10 contiguous stages covering [0, 100]', () => {
    expect(STAGES).toHaveLength(10);
    expect(STAGES[0].from).toBe(0);
    expect(STAGES[STAGES.length - 1].to).toBe(100);
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i].from).toBe(STAGES[i - 1].to);
    }
  });
});

describe('stageAt', () => {
  it('resolves boundaries to the incoming stage', () => {
    expect(stageAt(0).name).toBe('Território Selvagem');
    expect(stageAt(10).name).toBe('Fundação');
    expect(stageAt(50).name).toBe('Cidade Murada');
  });

  it('resolves 100 (and beyond) to the last stage', () => {
    expect(stageAt(100).name).toBe('Auge');
    expect(stageAt(120).name).toBe('Auge');
  });
});

describe('lightingAt', () => {
  it('returns exact keyframe values at anchor points', () => {
    expect(lightingAt(0).sunIntensity).toBe(1.6);
    expect(lightingAt(100).sunIntensity).toBe(2.8);
    expect(lightingAt(50).fogNear).toBe(80);
  });

  it('interpolates linearly between keyframes', () => {
    // midpoint of the [0, 25] segment
    const mid = lightingAt(12.5);
    expect(mid.sunIntensity).toBeCloseTo((1.6 + 2.0) / 2);
    expect(mid.fogNear).toBeCloseTo((60 + 70) / 2);
  });

  it('warms the sun over the arc (blue channel drops, red rises)', () => {
    const cold = lightingAt(0).sun;
    const golden = lightingAt(100).sun;
    expect(golden.b).toBeLessThan(cold.b);
    expect(golden.r).toBeGreaterThanOrEqual(cold.r);
  });

  it('clamps out-of-range progress', () => {
    expect(lightingAt(-10)).toEqual(lightingAt(0));
    expect(lightingAt(200)).toEqual(lightingAt(100));
  });
});
