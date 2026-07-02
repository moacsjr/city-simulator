import * as THREE from 'three';
import { generateForest } from '../layout/cityLayout';
import { InstancedEvolutive } from './instancedEvolutive';

const LEAF_GREEN = 0x1f441e;
const LEAF_AUTUMN = 0x8b5a2b;
const TREE_HEIGHT = 2.5;

/**
 * ~1200 low-poly pines as ONE InstancedMesh (spec sample geometry).
 * Trees near the city retire (shrink out) as the clearing radius grows;
 * leaves turn autumn brown over progress 70→80 (spec autumn switch).
 */
export function createForest(seed = 1, count = 1200): InstancedEvolutive {
  const spots = generateForest(seed, count);
  const geometry = new THREE.ConeGeometry(0.4, TREE_HEIGHT, 6);
  // Base color white: final color = material × instanceColor (green→brown lerp).
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.1,
  });

  const forest = new InstancedEvolutive(
    geometry,
    material,
    spots.map((tree) => ({
      x: tree.x,
      z: tree.z,
      rotationY: tree.rotationY,
      yOffset: TREE_HEIGHT / 2,
      appearAt: -1,
      growStart: -1,
      growEnd: 0, // grow window ends at 0 → already fully grown when p=0
      maxScale: tree.scale,
      retireAt: tree.retireAt,
      color: { from: LEAF_GREEN, to: LEAF_AUTUMN, start: 70, end: 80 },
    })),
  );
  forest.mesh.name = 'forest';
  return forest;
}
