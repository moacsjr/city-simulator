import { describe, expect, it } from 'vitest';
import {
  generateFieldPlots,
  generateHousePlots,
  generateRoadSegments,
  isInRiver,
  PLAZA_RADIUS,
  plotUnlockAt,
  SITES,
} from './cityLayout';

describe('generateHousePlots', () => {
  const plots = generateHousePlots(11, 140);

  it('is deterministic and produces the requested count', () => {
    expect(plots).toEqual(generateHousePlots(11, 140));
    expect(plots).toHaveLength(140);
  });

  it('avoids river, plaza and landmark sites', () => {
    for (const plot of plots) {
      expect(isInRiver(plot.z, 3)).toBe(false);
      expect(Math.hypot(plot.x, plot.z)).toBeGreaterThanOrEqual(PLAZA_RADIUS + 2);
      for (const site of Object.values(SITES)) {
        expect(Math.hypot(plot.x - site.x, plot.z - site.z)).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it('keeps minimum spacing between plots', () => {
    for (let i = 0; i < plots.length; i++) {
      for (let j = i + 1; j < plots.length; j++) {
        expect(Math.hypot(plots[i].x - plots[j].x, plots[i].z - plots[j].z)).toBeGreaterThanOrEqual(
          4,
        );
      }
    }
  });
});

describe('plotUnlockAt', () => {
  it('grows with distance', () => {
    expect(plotUnlockAt(0)).toBe(10);
    expect(plotUnlockAt(21)).toBeCloseTo(37.5);
    expect(plotUnlockAt(42)).toBe(65);
    expect(plotUnlockAt(100)).toBe(65); // clamped
  });
});

describe('generateFieldPlots', () => {
  it('places fields outside the housing ring, away from the river', () => {
    for (const plot of generateFieldPlots(23, 36)) {
      expect(Math.hypot(plot.x, plot.z)).toBeGreaterThanOrEqual(48 - 0.001);
      expect(isInRiver(plot.z, 5)).toBe(false);
    }
  });
});

describe('generateRoadSegments', () => {
  const segments = generateRoadSegments();

  it('is deterministic and skips the river gap', () => {
    expect(segments).toEqual(generateRoadSegments());
    for (const seg of segments) {
      if (seg.rotationY === 0) expect(isInRiver(seg.z)).toBe(false);
    }
  });

  it('unlocks outward from the center', () => {
    const center = segments.find((s) => s.x === 0 && Math.abs(s.z) < 2)!;
    const far = segments.find((s) => s.x === 0 && s.z > 40)!;
    expect(center.unlockAt).toBeLessThan(far.unlockAt);
  });
});
