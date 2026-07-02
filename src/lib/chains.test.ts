import { describe, expect, it } from 'vitest';
import { chainWindows, HOUSE_BANDS } from './chains';
import { instanceScaleAt } from './instanceState';

describe('chainWindows', () => {
  it('produces all levels for an unlocked plot', () => {
    const levels = chainWindows(HOUSE_BANDS, 0);
    expect(levels.map((l) => l.level)).toEqual([0, 1, 2, 3, 4]);
  });

  it('skips levels the plot unlocked past', () => {
    // unlockAt 50 → bands 12 and 25 are skipped (next band ≤ start), 45 clamps to 50
    const levels = chainWindows(HOUSE_BANDS, 50);
    expect(levels.map((l) => l.level)).toEqual([2, 3, 4]);
    expect(levels[0].evolution.appearAt).toBe(50);
  });

  it('hands off: outgoing retires exactly when incoming appears', () => {
    const levels = chainWindows(HOUSE_BANDS, 0, 2);
    for (let i = 0; i < levels.length - 1; i++) {
      expect(levels[i].evolution.retireAt).toBe(levels[i + 1].evolution.appearAt);
    }
  });

  it('last level never retires', () => {
    const levels = chainWindows(HOUSE_BANDS, 0);
    expect(levels[levels.length - 1].evolution.retireAt).toBeUndefined();
  });

  it('exactly one level dominates well inside each band', () => {
    const levels = chainWindows(HOUSE_BANDS, 0);
    for (const probe of [20, 40, 60, 80, 95]) {
      const scales = levels.map((l) => instanceScaleAt(l.evolution, probe));
      const active = scales.filter((s) => s > 0.99);
      expect(active).toHaveLength(1);
    }
  });

  it('crossfades at band boundaries: outgoing shrinks while incoming grows', () => {
    const levels = chainWindows(HOUSE_BANDS, 0);
    const midTransition = HOUSE_BANDS[1] + 2; // halfway through the span-4 window
    const l0 = instanceScaleAt(levels[0].evolution, midTransition);
    const l1 = instanceScaleAt(levels[1].evolution, midTransition);
    expect(l0).toBeGreaterThan(0);
    expect(l0).toBeLessThan(1);
    expect(l1).toBeGreaterThan(0);
    expect(l1).toBeLessThan(1);
  });
});
