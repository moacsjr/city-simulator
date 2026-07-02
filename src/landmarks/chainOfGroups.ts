import * as THREE from 'three';
import { EvolutiveObject } from '../evolutive/evolutiveObject';

export interface LandmarkStage {
  at: number;
  build: () => THREE.Object3D;
}

/**
 * Landmark chain: each maturity stage is its own group at the same site;
 * stage N retires while stage N+1 grows (same crossfade the instanced
 * chains use, but with true opacity since landmarks are individual meshes).
 */
export function chainOfGroups(
  site: { x: number; z: number },
  stages: LandmarkStage[],
  growSpan = 6,
): EvolutiveObject[] {
  return stages.map((stage, i) => {
    const object = stage.build();
    object.position.set(site.x, 0, site.z);
    const next = stages[i + 1]?.at;
    return new EvolutiveObject(object, {
      appearAt: stage.at,
      growStart: stage.at,
      growEnd: stage.at + growSpan,
      maxScale: 1,
      retireAt: next,
      retireSpan: growSpan,
    });
  });
}
