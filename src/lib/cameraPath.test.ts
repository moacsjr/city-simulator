import { describe, expect, it } from 'vitest';
import { cameraAt } from './cameraPath';

describe('cameraAt', () => {
  it('is flat before the reveal', () => {
    expect(cameraAt(0)).toEqual(cameraAt(50));
    expect(cameraAt(0).radius).toBe(44);
    expect(cameraAt(0).height).toBe(27);
  });

  it('dollies out across 50→60 (walled-city reveal)', () => {
    const mid = cameraAt(55);
    expect(mid.radius).toBeCloseTo(54); // smoothstep midpoint
    expect(mid.height).toBeCloseTo(32);
  });

  it('is flat after the reveal', () => {
    expect(cameraAt(60)).toEqual(cameraAt(100));
    expect(cameraAt(100).radius).toBe(64);
    expect(cameraAt(100).height).toBe(37);
  });

  it('is monotonic through the reveal', () => {
    let last = 0;
    for (let p = 48; p <= 62; p += 0.5) {
      const { radius } = cameraAt(p);
      expect(radius).toBeGreaterThanOrEqual(last);
      last = radius;
    }
  });
});
