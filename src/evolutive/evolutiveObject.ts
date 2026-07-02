import * as THREE from 'three';
import { instanceScaleAt, type InstanceEvolution } from '../lib/instanceState';
import { clamp } from '../lib/progress';
import type { ProgressDriven } from './registry';

export interface ColorTransition {
  material: THREE.MeshStandardMaterial;
  from: THREE.Color;
  to: THREE.Color;
}

export interface EvolutiveObjectConfig extends InstanceEvolution {
  colorTransitions?: ColorTransition[];
}

/**
 * Spec's EvolutiveObject for individual (landmark) meshes: visibility,
 * smoothstep scale, opacity ramp between appearAt→growStart, color lerp.
 */
export class EvolutiveObject implements ProgressDriven {
  private readonly materials: THREE.Material[] = [];

  constructor(
    readonly object: THREE.Object3D,
    private readonly config: EvolutiveObjectConfig,
  ) {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) {
          mat.transparent = true;
          this.materials.push(mat);
        }
      }
    });
  }

  update(progress: number): void {
    const { appearAt, growStart, growEnd, colorTransitions } = this.config;

    const scale = instanceScaleAt(this.config, progress);
    if (progress < appearAt || scale <= 0) {
      this.object.visible = false;
      return;
    }
    this.object.visible = true;

    const localFactor = clamp((progress - growStart) / (growEnd - growStart), 0, 1);
    this.object.scale.setScalar(Math.max(scale, 1e-4));

    let opacity = 1;
    if (progress < growStart && growStart !== appearAt) {
      opacity = (progress - appearAt) / (growStart - appearAt);
    }
    for (const mat of this.materials) mat.opacity = opacity;

    if (colorTransitions && localFactor > 0) {
      for (const { material, from, to } of colorTransitions) {
        material.color.lerpColors(from, to, localFactor);
      }
    }
  }
}
