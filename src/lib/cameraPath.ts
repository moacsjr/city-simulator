/**
 * Pure camera framing vs progress. The 50–60% walled-city reveal (spec:
 * "marked camera change") is a progress-mapped dolly-out, not a timer.
 */
import { smoothstep } from './progress';

export interface CameraFraming {
  radius: number;
  height: number;
}

export function cameraAt(progress: number): CameraFraming {
  const reveal = smoothstep(50, 60, progress);
  return {
    radius: 44 + reveal * 20,
    height: 27 + reveal * 10,
  };
}
