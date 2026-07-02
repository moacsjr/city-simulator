import * as THREE from 'three';
import { RIVER, WORLD_HALF } from '../layout/cityLayout';

/** Static ground + river strip (placeholder material until the TSL blend in M3). */
export function createTerrain(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'terrain';

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD_HALF * 2 + 10, WORLD_HALF * 2 + 10),
    new THREE.MeshStandardMaterial({ color: 0x4a7c3a, roughness: 1 }),
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

  return group;
}
