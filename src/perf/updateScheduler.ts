/**
 * Per-frame work budget: caps expensive decisions (NPC path picks) per tick.
 * Overflow work simply waits for the next frame — bounded CPU per frame.
 */
export class FrameBudget {
  private used = 0;

  constructor(readonly limit: number) {}

  reset(): void {
    this.used = 0;
  }

  /** True while the budget lasts this frame. */
  take(): boolean {
    if (this.used >= this.limit) return false;
    this.used++;
    return true;
  }

  get remaining(): number {
    return this.limit - this.used;
  }
}

/** Quality tier: pure decision from device hints (testable). */
export interface Quality {
  pixelRatioCap: number;
  treeCount: number;
  decisionBudget: number;
}

export function qualityFor(isCoarsePointer: boolean, screenWidth: number): Quality {
  const mobile = isCoarsePointer && screenWidth < 900;
  return mobile
    ? { pixelRatioCap: 1.5, treeCount: 500, decisionBudget: 16 }
    : { pixelRatioCap: 2, treeCount: 1200, decisionBudget: 32 };
}

/** DOM-reading wrapper (thin adapter over qualityFor). */
export function detectQuality(): Quality {
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const width = typeof window !== 'undefined' ? window.screen.width : 1920;
  return qualityFor(coarse, width);
}
