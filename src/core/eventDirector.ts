/**
 * Programmatic events (spec Table 3): each threshold is an ACTIVATION WINDOW
 * in progress space, not a fired one-shot — scrubbing backwards or jumping
 * stays consistent because activation is a pure function of progress.
 * Window shape: rises over [at-2, at], holds, falls over [at+3, at+6].
 */
import { smoothstep } from '../lib/progress';

export interface CityEvent {
  at: number;
  name: string;
}

export const EVENTS: readonly CityEvent[] = [
  { at: 0, name: 'Fundação do Acampamento' },
  { at: 15, name: 'Derrube da Floresta' },
  { at: 25, name: 'Consolidação da Vila' },
  { at: 30, name: 'Construção de Novas Moradias' },
  { at: 45, name: 'Edificação da Igreja' },
  { at: 50, name: 'Fortificação Urbana' },
  { at: 55, name: 'Fecho das Muralhas' },
  { at: 70, name: 'Construção do Castelo' },
  { at: 75, name: 'Inauguração da Universidade' },
  { at: 85, name: 'Consagração da Catedral' },
  { at: 100, name: 'Grande Festival Medieval' },
];

export function eventActivation(at: number, progress: number): number {
  const rise = smoothstep(at - 2, at, progress);
  const fall = 1 - smoothstep(at + 3, at + 6, progress);
  return rise * fall;
}

/** Most active event at progress, or null when none is meaningfully active. */
export function activeEventAt(progress: number): CityEvent | null {
  let best: CityEvent | null = null;
  let bestActivation = 0.1; // ignore faint tails
  for (const event of EVENTS) {
    const activation = eventActivation(event.at, progress);
    if (activation > bestActivation) {
      bestActivation = activation;
      best = event;
    }
  }
  return best;
}
