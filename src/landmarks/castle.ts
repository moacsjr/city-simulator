import * as THREE from 'three';
import type { EvolutiveObject } from '../evolutive/evolutiveObject';
import { SITES } from '../layout/cityLayout';
import { chainOfGroups } from './chainOfGroups';
import { DARK_STONE, DARK_WOOD, part, ROOF_SLATE, STONE, WOOD } from './buildKit';

/** Castle chain: watchtower → palisade fort → military castle → seigneurial complex. */

function watchtower(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(1.2, 5, 1.2), WOOD, 0, 2.5, 0));
  g.add(part(new THREE.ConeGeometry(1.2, 1, 4), DARK_WOOD, 0, 5.5, 0));
  return g;
}

function palisadeFort(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(1.4, 6, 1.4), WOOD, 0, 3, 0));
  g.add(part(new THREE.ConeGeometry(1.4, 1.1, 4), DARK_WOOD, 0, 6.55, 0));
  const ring = part(new THREE.CylinderGeometry(5.5, 5.5, 2, 12, 1, true), DARK_WOOD, 0, 1, 0);
  (ring.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  g.add(ring);
  return g;
}

function militaryCastle(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(5, 7, 5), STONE, 0, 3.5, 0));
  for (const [dx, dz] of [
    [-3, -3],
    [3, -3],
    [-3, 3],
    [3, 3],
  ]) {
    g.add(part(new THREE.CylinderGeometry(1, 1.1, 6, 8), DARK_STONE, dx, 3, dz));
    g.add(part(new THREE.ConeGeometry(1.2, 1.4, 8), ROOF_SLATE, dx, 6.7, dz));
  }
  return g;
}

function seigneurialComplex(): THREE.Object3D {
  const g = militaryCastle();
  g.add(part(new THREE.BoxGeometry(2.6, 10, 2.6), STONE, 0, 5, 0)); // keep rises taller
  g.add(part(new THREE.ConeGeometry(2.1, 2, 4), ROOF_SLATE, 0, 11, 0));
  const wall = part(new THREE.CylinderGeometry(8, 8, 2.6, 16, 1, true), DARK_STONE, 0, 1.3, 0);
  (wall.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  g.add(wall);
  return g;
}

export function createCastle(): EvolutiveObject[] {
  return chainOfGroups(SITES.castle, [
    { at: 22, build: watchtower },
    { at: 42, build: palisadeFort },
    { at: 62, build: militaryCastle },
    { at: 82, build: seigneurialComplex },
  ]);
}
