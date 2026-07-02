import type { ProgressDriven } from '../evolutive/registry';
import { gainsAt, MASTER_GAIN, TRACKS } from './trackGains';
import { proceduralLoop } from './proceduralAmbience';

/**
 * Spec SeamlessSoundtrack: AudioContext → per-track GainNode → master gain
 * (0.8, clipping protection) → destination. All 4 loops play silently from
 * initialize(); updateVolume only moves gains (equal-power, trackGains.ts).
 * MUST be constructed after a user pointerdown (autoplay policy).
 */
export class Soundtrack implements ProgressDriven {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private trackGains: GainNode[] = [];
  private muted = false;
  private lastProgress = 0;

  async initialize(): Promise<void> {
    if (this.context) return;
    const context = new AudioContext();
    this.context = context;
    this.master = context.createGain();
    this.master.gain.setValueAtTime(MASTER_GAIN, context.currentTime);
    this.master.connect(context.destination);

    await Promise.all(
      TRACKS.map(async (track, i) => {
        let buffer: AudioBuffer;
        try {
          const response = await fetch(track.url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          buffer = await context.decodeAudioData(await response.arrayBuffer());
        } catch {
          buffer = await proceduralLoop(track.id); // asset absent → procedural fallback
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gain = context.createGain();
        gain.gain.setValueAtTime(0, context.currentTime);
        source.connect(gain);
        gain.connect(this.master!);
        this.trackGains[i] = gain;
        source.start(0);
      }),
    );
    this.update(this.lastProgress);
  }

  update(progress: number): void {
    this.lastProgress = progress;
    if (!this.context) return;
    if (this.context.state === 'suspended') void this.context.resume();
    const gains = gainsAt(progress);
    const now = this.context.currentTime;
    for (let i = 0; i < gains.length; i++) {
      // setTargetAtTime instead of the spec's setValueAtTime: same values,
      // 30 ms smoothing kills zipper noise on fast slider scrubs.
      this.trackGains[i]?.gain.setTargetAtTime(gains[i], now, 0.03);
    }
  }

  /** Returns the new muted state. */
  toggleMuted(): boolean {
    this.muted = !this.muted;
    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : MASTER_GAIN,
        this.context.currentTime,
        0.02,
      );
    }
    return this.muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }
}
