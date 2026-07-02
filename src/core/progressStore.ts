import { clamp } from '../lib/progress';

export type ProgressListener = (progress: number) => void;

/**
 * Single source of truth for the global progress value (0–100).
 * Every system derives its state from this store; nothing else holds time.
 */
export class ProgressStore {
  private progress: number;
  private playing = false;
  private readonly listeners = new Set<ProgressListener>();

  /** Progress units per second while auto-playing (4 → full arc in 25 s). */
  ratePerSecond: number;

  constructor(initial = 0, ratePerSecond = 4) {
    this.progress = clamp(initial, 0, 100);
    this.ratePerSecond = ratePerSecond;
  }

  get value(): number {
    return this.progress;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  set(value: number): void {
    const next = clamp(value, 0, 100);
    if (next === this.progress) return;
    this.progress = next;
    for (const listener of this.listeners) listener(next);
  }

  subscribe(listener: ProgressListener, emitImmediately = true): () => void {
    this.listeners.add(listener);
    if (emitImmediately) listener(this.progress);
    return () => this.listeners.delete(listener);
  }

  play(): void {
    if (this.progress >= 100) this.set(0);
    this.playing = true;
  }

  pause(): void {
    this.playing = false;
  }

  toggle(): void {
    if (this.playing) this.pause();
    else this.play();
  }

  /** Advance auto-play by dt seconds. Call once per frame. */
  tick(dtSeconds: number): void {
    if (!this.playing) return;
    this.set(this.progress + this.ratePerSecond * dtSeconds);
    if (this.progress >= 100) this.playing = false;
  }
}
