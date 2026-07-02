import { describe, expect, it } from 'vitest';
import { hexToRgb, lerpRgb, rgbToHex } from './color';

describe('hexToRgb / rgbToHex', () => {
  it('round-trips common colors', () => {
    for (const hex of [0x000000, 0xffffff, 0x87ceeb, 0xe0a44c]) {
      expect(rgbToHex(hexToRgb(hex))).toBe(hex);
    }
  });

  it('extracts channels correctly', () => {
    expect(hexToRgb(0xff0000)).toEqual({ r: 1, g: 0, b: 0 });
    expect(hexToRgb(0x00ff00)).toEqual({ r: 0, g: 1, b: 0 });
    expect(hexToRgb(0x0000ff)).toEqual({ r: 0, g: 0, b: 1 });
  });
});

describe('lerpRgb', () => {
  it('interpolates channel-wise', () => {
    const mid = lerpRgb({ r: 0, g: 0, b: 0 }, { r: 1, g: 0.5, b: 0 }, 0.5);
    expect(mid).toEqual({ r: 0.5, g: 0.25, b: 0 });
  });

  it('returns endpoints at t=0 and t=1', () => {
    const a = { r: 0.1, g: 0.2, b: 0.3 };
    const b = { r: 0.9, g: 0.8, b: 0.7 };
    expect(lerpRgb(a, b, 0)).toEqual(a);
    expect(lerpRgb(a, b, 1)).toEqual(b);
  });
});
