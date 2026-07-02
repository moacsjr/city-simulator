/** Pure color math (no THREE import) so lighting keyframes stay unit-testable. */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: number): Rgb {
  return {
    r: ((hex >> 16) & 0xff) / 255,
    g: ((hex >> 8) & 0xff) / 255,
    b: (hex & 0xff) / 255,
  };
}

export function rgbToHex(color: Rgb): number {
  const to255 = (v: number) => Math.round(Math.min(Math.max(v, 0), 1) * 255);
  return (to255(color.r) << 16) | (to255(color.g) << 8) | to255(color.b);
}

export function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}
