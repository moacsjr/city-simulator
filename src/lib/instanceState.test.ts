import { describe, expect, it } from 'vitest';
import { colorFactorAt, instanceScaleAt } from './instanceState';

describe('instanceScaleAt', () => {
  const grow = { appearAt: 10, growStart: 10, growEnd: 20, maxScale: 2 };

  it('is 0 before appearAt and maxScale after growEnd', () => {
    expect(instanceScaleAt(grow, 5)).toBe(0);
    expect(instanceScaleAt(grow, 20)).toBe(2);
    expect(instanceScaleAt(grow, 100)).toBe(2);
  });

  it('shrinks out over the retire span', () => {
    const tree = { ...grow, retireAt: 50, retireSpan: 10 };
    expect(instanceScaleAt(tree, 49)).toBe(2);
    expect(instanceScaleAt(tree, 55)).toBeCloseTo(1); // smoothstep midpoint
    expect(instanceScaleAt(tree, 60)).toBe(0);
    expect(instanceScaleAt(tree, 100)).toBe(0);
  });

  it('uses default retire span of 6', () => {
    const tree = { ...grow, retireAt: 50 };
    expect(instanceScaleAt(tree, 56)).toBe(0);
    expect(instanceScaleAt(tree, 55)).toBeGreaterThan(0);
  });

  it('never returns negative scale', () => {
    const tree = { ...grow, retireAt: 30, retireSpan: 5 };
    for (let p = 0; p <= 100; p += 0.5) {
      expect(instanceScaleAt(tree, p)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('colorFactorAt', () => {
  it('ramps 0→1 over the window', () => {
    expect(colorFactorAt(70, 80, 60)).toBe(0);
    expect(colorFactorAt(70, 80, 75)).toBe(0.5);
    expect(colorFactorAt(70, 80, 90)).toBe(1);
  });

  it('handles a zero-width window as a step', () => {
    expect(colorFactorAt(50, 50, 49)).toBe(0);
    expect(colorFactorAt(50, 50, 50)).toBe(1);
  });
});
