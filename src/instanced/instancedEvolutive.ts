import * as THREE from 'three';
import { colorFactorAt, instanceScaleAt, type InstanceEvolution } from '../lib/instanceState';
import type { ProgressDriven } from '../evolutive/registry';

export interface InstanceDescriptor extends InstanceEvolution {
  x: number;
  z: number;
  rotationY?: number;
  /** Geometry origin offset: instance y = yOffset · scale (keeps base on the ground). */
  yOffset?: number;
  /** Optional per-instance color lerp over a progress window. */
  color?: { from: number; to: number; start: number; end: number };
}

const dummy = new THREE.Object3D();
const colorA = new THREE.Color();
const colorB = new THREE.Color();
const mixed = new THREE.Color();

/**
 * Base for all repeated assets (spec mandate): one InstancedMesh with
 * DynamicDrawUsage; per-instance smoothstep grow/retire and color lerp.
 * Instanced assets "materialize" by scale-from-zero (InstancedMesh has no
 * per-instance opacity — documented deviation D2).
 */
export interface SwayOptions {
  /** Max tilt in radians applied on the Z axis (wind flutter). */
  amplitude: number;
  frequency: number;
}

export class InstancedEvolutive implements ProgressDriven {
  readonly mesh: THREE.InstancedMesh;
  private readonly scales: Float32Array;

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    private readonly instances: InstanceDescriptor[],
    private readonly sway?: SwayOptions,
  ) {
    this.mesh = new THREE.InstancedMesh(geometry, material, instances.length);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scales = new Float32Array(instances.length);
    if (instances.some((i) => i.color)) {
      for (let i = 0; i < instances.length; i++) {
        const c = instances[i].color;
        this.mesh.setColorAt(i, c ? colorA.setHex(c.from) : colorA.setHex(0xffffff));
      }
    }
  }

  private composeAt(i: number, scale: number, tiltZ = 0): void {
    const inst = this.instances[i];
    dummy.position.set(inst.x, (inst.yOffset ?? 0) * scale, inst.z);
    dummy.rotation.set(0, inst.rotationY ?? 0, tiltZ);
    dummy.scale.setScalar(Math.max(scale, 1e-5));
    dummy.updateMatrix();
    this.mesh.setMatrixAt(i, dummy.matrix);
  }

  update(progress: number): void {
    for (let i = 0; i < this.instances.length; i++) {
      const inst = this.instances[i];
      const scale = instanceScaleAt(inst, progress);
      this.scales[i] = scale;
      this.composeAt(i, scale);

      if (inst.color) {
        const t = colorFactorAt(inst.color.start, inst.color.end, progress);
        mixed.lerpColors(colorA.setHex(inst.color.from), colorB.setHex(inst.color.to), t);
        this.mesh.setColorAt(i, mixed);
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  /** Clock-driven wind flutter for visible instances (banners, canopies). */
  tickSway(time: number): void {
    if (!this.sway) return;
    let dirty = false;
    for (let i = 0; i < this.instances.length; i++) {
      if (this.scales[i] <= 0) continue;
      const tilt = Math.sin(time * this.sway.frequency + i * 1.7) * this.sway.amplitude;
      this.composeAt(i, this.scales[i], tilt);
      dirty = true;
    }
    if (dirty) this.mesh.instanceMatrix.needsUpdate = true;
  }
}
