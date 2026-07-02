import * as THREE from 'three';
import type { ProgressDriven } from '../evolutive/registry';
import { RIVER, WORLD_HALF } from '../layout/cityLayout';
import { createGroundMaterial } from './groundMaterial';

/** Ground (TSL grass→pavement blend) + river strip. */
export function createTerrain(): { group: THREE.Group; driver: ProgressDriven } {
  const group = new THREE.Group();
  group.name = 'terrain';

  const { material, driver } = createGroundMaterial();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD_HALF * 2 + 10, WORLD_HALF * 2 + 10),
    material,
  );
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD_HALF * 2 + 10, RIVER.width),
    new THREE.MeshStandardMaterial({ color: 0x3b6f9e, roughness: 0.25, metalness: 0.1 }),
  );
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, 0.02, RIVER.z);
  group.add(river);

  return { group, driver };
}
