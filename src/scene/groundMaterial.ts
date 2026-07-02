import { MeshStandardNodeMaterial } from 'three/webgpu';
import { color, float, length, mix, positionWorld, smoothstep, uniform } from 'three/tsl';
import type { ProgressDriven } from '../evolutive/registry';

/**
 * TSL ground material: grass → paved stone radially from the city center,
 * driven by ONE progress uniform (spec mandate: no material swaps; blend in
 * shader). TSL compiles to WGSL and GLSL, so the WebGL2 fallback shares it.
 */
export function createGroundMaterial(): {
  material: MeshStandardNodeMaterial;
  driver: ProgressDriven;
} {
  const uProgress = uniform(0); // 0..1

  const distance = length(positionWorld.xz);
  // paved radius grows 0 → 34 world units as progress runs 0.35 → 0.9
  const paveRadius = smoothstep(float(0.35), float(0.9), uProgress).mul(34);
  const paveMask = smoothstep(paveRadius, paveRadius.sub(7), distance);

  const grass = color(0x4a7c3a);
  const cobble = color(0x8d8578);

  const material = new MeshStandardNodeMaterial();
  material.colorNode = mix(grass, cobble, paveMask);
  material.roughnessNode = mix(float(1.0), float(0.75), paveMask);

  return {
    material,
    driver: {
      update(progress: number) {
        uProgress.value = progress / 100;
      },
    },
  };
}
