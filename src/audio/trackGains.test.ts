import { describe, expect, it } from 'vitest';
import { gainForTrack, gainsAt, MASTER_GAIN, TRACKS } from './trackGains';

describe('TRACKS', () => {
  it('matches the spec ranges', () => {
    expect(TRACKS.map((t) => t.range)).toEqual([
      [0.0, 0.3],
      [0.2, 0.6],
      [0.5, 0.8],
      [0.7, 1.0],
    ]);
    expect(MASTER_GAIN).toBe(0.8);
  });
});

describe('gainForTrack', () => {
  it('wilderness is full at t=0, festival full at t=1', () => {
    expect(gainForTrack(0, 0)).toBe(1);
    expect(gainForTrack(3, 1)).toBe(1);
  });

  it('is 1 in each exclusive zone', () => {
    expect(gainForTrack(0, 0.1)).toBe(1); // selvagem alone
    expect(gainForTrack(1, 0.4)).toBe(1); // fundacao alone
    expect(gainForTrack(2, 0.65)).toBe(1); // cidade alone
    expect(gainForTrack(3, 0.9)).toBe(1); // auge alone
  });

  it('is 0 outside its range', () => {
    expect(gainForTrack(0, 0.31)).toBe(0);
    expect(gainForTrack(1, 0.15)).toBe(0);
    expect(gainForTrack(3, 0.69)).toBe(0);
  });

  it('crosses at equal power in the middle of each overlap', () => {
    const sqrtHalf = Math.SQRT1_2;
    expect(gainForTrack(0, 0.25)).toBeCloseTo(sqrtHalf);
    expect(gainForTrack(1, 0.25)).toBeCloseTo(sqrtHalf);
    expect(gainForTrack(1, 0.55)).toBeCloseTo(sqrtHalf);
    expect(gainForTrack(2, 0.55)).toBeCloseTo(sqrtHalf);
    expect(gainForTrack(2, 0.75)).toBeCloseTo(sqrtHalf);
    expect(gainForTrack(3, 0.75)).toBeCloseTo(sqrtHalf);
  });

  it('preserves total acoustic power (Σ gain² = 1) across the whole arc', () => {
    for (let p = 0; p <= 100; p += 0.25) {
      const power = gainsAt(p).reduce((sum, g) => sum + g * g, 0);
      expect(power).toBeCloseTo(1, 6);
    }
  });

  it('has no discontinuities: max gain step over Δp=0.1 stays small', () => {
    let prev = gainsAt(0);
    for (let p = 0.1; p <= 100; p += 0.1) {
      const current = gainsAt(p);
      for (let i = 0; i < current.length; i++) {
        expect(Math.abs(current[i] - prev[i])).toBeLessThan(0.03);
      }
      prev = current;
    }
  });
});
