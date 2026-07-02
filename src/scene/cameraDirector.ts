import type * as THREE from 'three';
import { cameraAt } from '../lib/cameraPath';
import type { ProgressDriven } from '../evolutive/registry';

const ORBIT_SPEED = 0.035; // rad/s — slow ambient orbit (clock-driven, allowed)
const SMOOTHING = 2.5;

/** Idle orbit + progress-driven dolly (wall reveal at 50–60%). */
export class CameraDirector implements ProgressDriven {
  private azimuth = Math.PI / 4;
  private radius = cameraAt(0).radius;
  private height = cameraAt(0).height;
  private targetRadius = this.radius;
  private targetHeight = this.height;

  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  update(progress: number): void {
    const framing = cameraAt(progress);
    this.targetRadius = framing.radius;
    this.targetHeight = framing.height;
  }

  tick(dt: number): void {
    this.azimuth += ORBIT_SPEED * dt;
    const k = Math.min(1, SMOOTHING * dt);
    this.radius += (this.targetRadius - this.radius) * k;
    this.height += (this.targetHeight - this.height) * k;
    this.camera.position.set(
      Math.cos(this.azimuth) * this.radius,
      this.height,
      Math.sin(this.azimuth) * this.radius,
    );
    this.camera.lookAt(0, 2, 0);
  }
}
