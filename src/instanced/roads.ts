import * as THREE from 'three';
import { generateRoadSegments } from '../layout/cityLayout';
import { EMPTY_MODELS, type ModelLibrary } from '../models/modelLibrary';
import { InstancedEvolutive } from './instancedEvolutive';

const DIRT = 0x7a6242;
const STONE = 0x8d8578;

/**
 * Road cross as flat instanced slabs. Paving = per-instance color lerp
 * dirt → granite over the segment's own window (spec: no material swaps;
 * blend driven by progress). Segments unlock outward from the center.
 */
export function createRoads(models: ModelLibrary = EMPTY_MODELS): InstancedEvolutive {
  const segments = generateRoadSegments();
  const asset = models.pool('road', () => ({
    geometry: new THREE.BoxGeometry(3, 0.06, 2.1),
    material: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }),
  }));

  const roads = new InstancedEvolutive(
    asset.geometry,
    asset.material,
    segments.map((seg) => ({
      x: seg.x,
      z: seg.z,
      rotationY: seg.rotationY,
      appearAt: seg.unlockAt,
      growStart: seg.unlockAt,
      growEnd: seg.unlockAt + 3,
      maxScale: 1,
      // dirt trail → paved stone as the city matures around the segment
      color: { from: DIRT, to: STONE, start: seg.unlockAt + 20, end: seg.unlockAt + 35 },
    })),
  );
  roads.mesh.name = 'roads';
  return roads;
}
