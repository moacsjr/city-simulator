/**
 * Procedural fallback loops generated with OfflineAudioContext — keeps the
 * whole audio engine exercised end-to-end while the real CC0 mp3 files are
 * absent (see docs/audio.md). Each loop is ~8 s and seam-free enough for
 * ambience; dropping real files in public/assets/audio/ replaces these.
 */

const DURATION = 8;
const SAMPLE_RATE = 44100;

function noiseBuffer(ctx: OfflineAudioContext, amplitude = 1): AudioBuffer {
  const buffer = ctx.createBuffer(1, DURATION * SAMPLE_RATE, SAMPLE_RATE);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    // pink-ish noise via one-pole lowpass of white noise
    last = last * 0.98 + (Math.random() * 2 - 1) * 0.02;
    data[i] = last * amplitude * 40;
  }
  return buffer;
}

function scheduleBellHits(ctx: OfflineAudioContext, destination: AudioNode): void {
  const notes = [523.25, 587.33, 659.25, 783.99, 880]; // pentatonic-ish
  for (let t = 0.5; t < DURATION - 1; t += 1.7) {
    const osc = ctx.createOscillator();
    osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    osc.connect(gain).connect(destination);
    osc.start(t);
    osc.stop(t + 1.5);
  }
}

function scheduleKnocks(ctx: OfflineAudioContext, destination: AudioNode): void {
  for (let t = 0.3; t < DURATION - 0.5; t += 0.9 + Math.random() * 0.5) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 0.8);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    src.connect(filter).connect(gain).connect(destination);
    src.start(t);
    src.stop(t + 0.15);
  }
}

async function renderLoop(build: (ctx: OfflineAudioContext) => void): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, DURATION * SAMPLE_RATE, SAMPLE_RATE);
  build(ctx);
  return ctx.startRendering();
}

/** Base bed: filtered noise at the given center frequency and level. */
function bed(ctx: OfflineAudioContext, frequency: number, level: number): void {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  const gain = ctx.createGain();
  gain.gain.value = level;
  // slow LFO so the bed breathes like wind/crowd
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.18;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = level * 0.4;
  lfo.connect(lfoGain).connect(gain.gain);
  lfo.start(0);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(0);
}

/** Procedural loop per track id (spec ambience descriptions). */
export function proceduralLoop(id: string): Promise<AudioBuffer> {
  switch (id) {
    case 'selvagem': // wind, birds, river
      return renderLoop((ctx) => bed(ctx, 600, 0.5));
    case 'fundacao': // hammers, chickens, chatter
      return renderLoop((ctx) => {
        bed(ctx, 900, 0.3);
        scheduleKnocks(ctx, ctx.destination);
      });
    case 'cidade': // market murmur, blacksmith
      return renderLoop((ctx) => {
        bed(ctx, 1400, 0.45);
        scheduleKnocks(ctx, ctx.destination);
      });
    case 'auge': // festival music, dense crowd, bells
    default:
      return renderLoop((ctx) => {
        bed(ctx, 1600, 0.4);
        scheduleBellHits(ctx, ctx.destination);
      });
  }
}
