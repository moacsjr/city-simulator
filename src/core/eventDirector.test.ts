import { describe, expect, it } from 'vitest';
import { activeEventAt, eventActivation, EVENTS } from './eventDirector';

describe('EVENTS', () => {
  it('covers the 11 spec thresholds', () => {
    expect(EVENTS.map((e) => e.at)).toEqual([0, 15, 25, 30, 45, 50, 55, 70, 75, 85, 100]);
  });
});

describe('eventActivation', () => {
  it('peaks at exactly the threshold', () => {
    for (const { at } of EVENTS) {
      expect(eventActivation(at, at)).toBe(1);
    }
  });

  it('is zero well before and well after the window', () => {
    expect(eventActivation(45, 40)).toBe(0);
    expect(eventActivation(45, 55)).toBe(0);
  });

  it('holds through the plateau then falls', () => {
    expect(eventActivation(45, 47)).toBe(1);
    expect(eventActivation(45, 49.5)).toBeGreaterThan(0);
    expect(eventActivation(45, 49.5)).toBeLessThan(1);
  });

  it('is a pure function of progress — backward scrub gives identical values', () => {
    const forward = [43, 44, 45, 46, 47, 48].map((p) => eventActivation(45, p));
    const backward = [48, 47, 46, 45, 44, 43].map((p) => eventActivation(45, p)).reverse();
    expect(forward).toEqual(backward);
  });
});

describe('activeEventAt', () => {
  it('resolves the correct event at each threshold', () => {
    expect(activeEventAt(15)?.name).toBe('Derrube da Floresta');
    expect(activeEventAt(55)?.name).toBe('Fecho das Muralhas');
    expect(activeEventAt(100)?.name).toBe('Grande Festival Medieval');
  });

  it('returns null between windows', () => {
    expect(activeEventAt(10)).toBeNull();
    expect(activeEventAt(40)).toBeNull();
    expect(activeEventAt(65)).toBeNull();
  });

  it('a jump leaves no stale activation (state derives from p alone)', () => {
    // jumping 20 → 82 must not report events near 20; 82 is past the 75-window tail (81)
    expect(activeEventAt(82)).toBeNull();
  });
});
