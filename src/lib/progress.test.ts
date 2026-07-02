import { describe, expect, it } from 'vitest';
import { clamp, equalPowerCrossfade, evolutiveScale, lerp, smoothstep } from './progress';

describe('clamp', () => {
  it('clamps below, inside, above', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(2, 0, 1)).toBe(1);
  });
});

describe('lerp', () => {
  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 1)).toBe(10);
  });
});

describe('smoothstep', () => {
  it('is 0 before edge0 and 1 after edge1', () => {
    expect(smoothstep(20, 40, 10)).toBe(0);
    expect(smoothstep(20, 40, 50)).toBe(1);
  });

  it('is 0.5 at the midpoint', () => {
    expect(smoothstep(20, 40, 30)).toBeCloseTo(0.5);
  });

  it('has zero slope at the edges (ease-in/ease-out)', () => {
    const eps = 1e-4;
    expect(smoothstep(0, 1, eps) / eps).toBeLessThan(0.01);
    expect((1 - smoothstep(0, 1, 1 - eps)) / eps).toBeLessThan(0.01);
  });
});

describe('evolutiveScale', () => {
  const config = { appearAt: 20, growStart: 20, growEnd: 40, maxScale: 3 };

  it('is 0 before appearAt', () => {
    expect(evolutiveScale(config, 10)).toBe(0);
  });

  it('reaches maxScale at growEnd', () => {
    expect(evolutiveScale(config, 40)).toBe(3);
    expect(evolutiveScale(config, 100)).toBe(3);
  });

  it('is halfway (smoothstepped) at the middle of the grow window', () => {
    expect(evolutiveScale(config, 30)).toBeCloseTo(1.5);
  });
});

describe('equalPowerCrossfade', () => {
  it('starts fully on A, ends fully on B', () => {
    expect(equalPowerCrossfade(0)).toEqual({ gainA: 1, gainB: 0 });
    const end = equalPowerCrossfade(1);
    expect(end.gainA).toBeCloseTo(0);
    expect(end.gainB).toBeCloseTo(1);
  });

  it('keeps constant power across the fade', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const { gainA, gainB } = equalPowerCrossfade(t);
      expect(gainA * gainA + gainB * gainB).toBeCloseTo(1);
    }
  });

  it('clamps t outside [0, 1]', () => {
    expect(equalPowerCrossfade(-1).gainA).toBe(1);
    expect(equalPowerCrossfade(2).gainB).toBeCloseTo(1);
  });
});
