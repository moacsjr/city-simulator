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

/** Festival dust/dry leaves swirling over the city (spec, zenith stage). */
class LeafSystem {
  readonly mesh: THREE.InstancedMesh;
  private readonly seeds: Float32Array;
  private static readonly COUNT = 70;
  private static readonly FALL_TIME = 6;

  constructor() {
    this.mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.16, 0.02, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xc98a3a, roughness: 1 }),
      LeafSystem.COUNT,
    );
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.name = 'festival-leaves';
    this.seeds = new Float32Array(LeafSystem.COUNT);
    for (let i = 0; i < LeafSystem.COUNT; i++) this.seeds[i] = (i * 2654435761) % 1000;
  }

  tick(time: number, progress: number): void {
    // fade the whole layer in over 88→92%
    const layer = Math.min(Math.max((progress - 88) / 4, 0), 1);
    for (let i = 0; i < LeafSystem.COUNT; i++) {
      const seed = this.seeds[i];
      const phase = ((time * 0.9 + seed) % LeafSystem.FALL_TIME) / LeafSystem.FALL_TIME;
      const angle = seed * 0.618 + time * 0.25;
      const radius = 6 + (seed % 34);
      dummy.position.set(
        Math.cos(angle) * radius + Math.sin(time * 2 + seed) * 1.2,
        8 * (1 - phase) + 0.3,
        Math.sin(angle) * radius + Math.cos(time * 1.7 + seed) * 1.2,
      );
      dummy.rotation.set(time * 2 + seed, time * 3 + seed, 0);
      dummy.scale.setScalar(Math.max(layer * (0.6 + (seed % 5) * 0.2), 1e-5));
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** White foam flecks drifting downstream (river runs along X). */
class FoamSystem {
  readonly mesh: THREE.InstancedMesh;
  private static readonly COUNT = 36;

  constructor(
    private readonly riverZ: number,
    private readonly riverWidth: number,
  ) {
    this.mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.12, 5, 4),
      new THREE.MeshStandardMaterial({ color: 0xe8f2f6, roughness: 0.6 }),
      FoamSystem.COUNT,
    );
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.name = 'river-foam';
  }

  tick(time: number): void {
    const speed = 6; // world units/s downstream
    for (let i = 0; i < FoamSystem.COUNT; i++) {
      const lane = ((i * 37) % 10) / 10 - 0.5;
      const x = ((time * speed + i * 61) % 200) - 100;
      dummy.position.set(
        x,
        0.06,
        this.riverZ + lane * (this.riverWidth - 1.5) + Math.sin(time * 3 + i) * 0.3,
      );
      dummy.scale.setScalar(0.6 + Math.abs(Math.sin(time * 2 + i * 2)) * 0.7);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** Pendulum motion gated by progress (cathedral bells from the consecration on). */
export interface Oscillator {
  pivot: THREE.Object3D;
  amplitude: number;
  frequency: number;
  from: number;
}

export class AmbientAnimator {
  readonly smoke: SmokeSystem;
  readonly leaves: LeafSystem;
  readonly foam: FoamSystem;
  private readonly swayPools: InstancedEvolutive[] = [];
  private readonly spinners: Spinner[] = [];
  private readonly oscillators: Oscillator[] = [];
  private time = 0;

  constructor(river: { z: number; width: number }) {
    this.smoke = new SmokeSystem([
      { x: -1.5, y: 0.6, z: -1, from: 0, to: 13 }, // campfire (retires with the camp)
      { x: 3, y: 2.2, z: 9, from: 30, to: 100 }, // tavern/house chimneys near the plaza
      { x: -6, y: 2.2, z: 4, from: 45, to: 100 },
      { x: 8, y: 2.6, z: 2, from: 65, to: 100 },
    ]);
    this.leaves = new LeafSystem();
    this.foam = new FoamSystem(river.z, river.width);
  }

  addSway(...pools: InstancedEvolutive[]): void {
    this.swayPools.push(...pools);
  }

  addSpinner(...spinners: Spinner[]): void {
    this.spinners.push(...spinners);
  }

  addOscillator(...oscillators: Oscillator[]): void {
    this.oscillators.push(...oscillators);
  }

  tick(dt: number, progress: number): void {
    this.time += dt;
    for (const pool of this.swayPools) pool.tickSway(this.time);
    for (const spinner of this.spinners) spinner.pivot.rotation.z += spinner.speed * dt;
    for (const osc of this.oscillators) {
      osc.pivot.rotation.z =
        progress >= osc.from ? Math.sin(this.time * osc.frequency) * osc.amplitude : 0;
    }
    this.smoke.tick(dt, progress);
    this.leaves.tick(this.time, progress);
    this.foam.tick(this.time);
  }
}
