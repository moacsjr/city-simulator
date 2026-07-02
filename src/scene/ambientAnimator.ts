import * as THREE from 'three';
import type { InstancedEvolutive } from '../instanced/instancedEvolutive';

/**
 * Clock-driven ambient motion (allowed by the spec — like wind and smoke):
 * banner flutter, mill rotors, smoke columns. Object EXISTENCE still derives
 * from progress; only the idle animation runs on the clock.
 */

export interface Spinner {
  pivot: THREE.Object3D;
  speed: number; // rad/s around local Z
}

interface SmokeEmitter {
  x: number;
  y: number;
  z: number;
  /** Progress window in which the emitter is active. */
  from: number;
  to: number;
}

const SMOKE_PER_EMITTER = 6;
const SMOKE_LIFETIME = 3.2;
const dummy = new THREE.Object3D();

class SmokeSystem {
  readonly mesh: THREE.InstancedMesh;
  private readonly ages: Float32Array;

  constructor(private readonly emitters: SmokeEmitter[]) {
    const count = emitters.length * SMOKE_PER_EMITTER;
    this.mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.22, 6, 5),
      new THREE.MeshStandardMaterial({
        color: 0xb9bcbf,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
      count,
    );
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.name = 'smoke';
    this.ages = new Float32Array(count);
    for (let i = 0; i < count; i++)
      this.ages[i] = (i % SMOKE_PER_EMITTER) * (SMOKE_LIFETIME / SMOKE_PER_EMITTER);
  }

  tick(dt: number, progress: number): void {
    for (let e = 0; e < this.emitters.length; e++) {
      const emitter = this.emitters[e];
      const active = progress >= emitter.from && progress <= emitter.to;
      for (let s = 0; s < SMOKE_PER_EMITTER; s++) {
        const i = e * SMOKE_PER_EMITTER + s;
        this.ages[i] = (this.ages[i] + dt) % SMOKE_LIFETIME;
        const t = this.ages[i] / SMOKE_LIFETIME;
        const scale = active ? (0.4 + 0.8 * t) * Math.sin(Math.PI * Math.min(t * 1.6, 1)) : 0;
        dummy.position.set(
          emitter.x + Math.sin(t * 5 + i) * 0.3 + t * 0.8, // wind drift
          emitter.y + t * 3,
          emitter.z + Math.cos(t * 4 + i) * 0.2,
        );
        dummy.scale.setScalar(Math.max(scale, 1e-5));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

export class AmbientAnimator {
  readonly smoke: SmokeSystem;
  private readonly swayPools: InstancedEvolutive[] = [];
  private readonly spinners: Spinner[] = [];
  private time = 0;

  constructor() {
    this.smoke = new SmokeSystem([
      { x: -1.5, y: 0.6, z: -1, from: 0, to: 13 }, // campfire (retires with the camp)
      { x: 3, y: 2.2, z: 9, from: 30, to: 100 }, // tavern/house chimneys near the plaza
      { x: -6, y: 2.2, z: 4, from: 45, to: 100 },
      { x: 8, y: 2.6, z: 2, from: 65, to: 100 },
    ]);
  }

  addSway(...pools: InstancedEvolutive[]): void {
    this.swayPools.push(...pools);
  }

  addSpinner(...spinners: Spinner[]): void {
    this.spinners.push(...spinners);
  }

  tick(dt: number, progress: number): void {
    this.time += dt;
    for (const pool of this.swayPools) pool.tickSway(this.time);
    for (const spinner of this.spinners) spinner.pivot.rotation.z += spinner.speed * dt;
    this.smoke.tick(dt, progress);
  }
}
