import { describe, expect, it } from 'vitest';
import {
  CAMP_RADIUS,
  clearingRadiusAt,
  generateForest,
  isInRiver,
  RIVER,
  treeRetireAt,
} from './cityLayout';

describe('generateForest', () => {
  it('is deterministic for the same seed', () => {
    expect(generateForest(1, 50)).toEqual(generateForest(1, 50));
  });

  it('differs across seeds', () => {
    expect(generateForest(1, 50)).not.toEqual(generateForest(2, 50));
  });

  it('produces the requested count', () => {
    expect(generateForest(1, 1200)).toHaveLength(1200);
  });

  it('respects exclusion zones (river band and camp)', () => {
    for (const tree of generateForest(5, 500)) {
      expect(isInRiver(tree.z, 2)).toBe(false);
      expect(Math.hypot(tree.x, tree.z)).toBeGreaterThanOrEqual(CAMP_RADIUS + 2);
    }
  });
});

describe('clearingRadiusAt / treeRetireAt', () => {
  it('clearing radius starts at camp radius and grows to max', () => {
    expect(clearingRadiusAt(0)).toBe(CAMP_RADIUS);
    expect(clearingRadiusAt(12)).toBe(CAMP_RADIUS);
    expect(clearingRadiusAt(85)).toBe(70);
    expect(clearingRadiusAt(100)).toBe(70);
  });

  it('retireAt is monotonic with distance', () => {
    const near = treeRetireAt(15)!;
    const far = treeRetireAt(50)!;
    expect(near).toBeLessThan(far);
  });

  it('trees beyond the max clearing radius never retire', () => {
    expect(treeRetireAt(71)).toBeUndefined();
    expect(treeRetireAt(90)).toBeUndefined();
  });

  it('retireAt inverts clearingRadiusAt', () => {
    for (const d of [10, 25, 40, 60, 70]) {
      expect(clearingRadiusAt(treeRetireAt(d)!)).toBeCloseTo(d);
    }
  });
});

describe('isInRiver', () => {
  it('detects the river band with margin', () => {
    expect(isInRiver(RIVER.z)).toBe(true);
    expect(isInRiver(RIVER.z + RIVER.width / 2 + 1)).toBe(false);
    expect(isInRiver(RIVER.z + RIVER.width / 2 + 1, 2)).toBe(true);
  });
});
