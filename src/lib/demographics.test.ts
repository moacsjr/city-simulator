import { describe, expect, it } from 'vitest';
import { populationAt, POPULATION_ANCHORS } from './demographics';

describe('populationAt', () => {
  it('matches every spec anchor exactly', () => {
    for (const [p, n] of POPULATION_ANCHORS) {
      expect(populationAt(p)).toBe(n);
    }
  });

  it('interpolates linearly between anchors', () => {
    // between [15,10] and [25,20]: p=20 → 15
    expect(populationAt(20)).toBe(15);
    // between [85,220] and [100,300]: p=92.5 → 260
    expect(populationAt(92.5)).toBe(260);
  });

  it('is monotonically non-decreasing', () => {
    let last = 0;
    for (let p = 0; p <= 100; p += 0.5) {
      const n = populationAt(p);
      expect(n).toBeGreaterThanOrEqual(last);
      last = n;
    }
  });

  it('clamps outside [0, 100]', () => {
    expect(populationAt(-10)).toBe(3);
    expect(populationAt(150)).toBe(300);
  });
});
