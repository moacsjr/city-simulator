import * as THREE from 'three';
import type { EvolutiveObject } from '../evolutive/evolutiveObject';
import { SITES } from '../layout/cityLayout';
import { EMPTY_MODELS, type ModelLibrary } from '../models/modelLibrary';
import { chainOfGroups } from './chainOfGroups';
import { DARK_STONE, DARK_WOOD, part, ROOF_SLATE, STONE, WOOD } from './buildKit';

/** Religious chain: wooden chapel → parish church → Romanesque → Gothic cathedral. */

function chapel(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(2.2, 1.8, 3), WOOD, 0, 0.9, 0));
  g.add(part(new THREE.ConeGeometry(1.9, 1, 4), DARK_WOOD, 0, 2.3, 0));
  g.add(part(new THREE.BoxGeometry(0.15, 0.9, 0.15), DARK_WOOD, 0, 3.2, 0));
  g.add(part(new THREE.BoxGeometry(0.55, 0.15, 0.15), DARK_WOOD, 0, 3.35, 0));
  return g;
}

function parishChurch(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(3, 2.6, 4.5), STONE, 0, 1.3, 0));
  g.add(part(new THREE.ConeGeometry(2.6, 1.3, 4), ROOF_SLATE, 0, 3.25, 0));
  g.add(part(new THREE.BoxGeometry(1.1, 4, 1.1), STONE, 0, 2, 2.2));
  g.add(part(new THREE.ConeGeometry(0.95, 1.2, 4), ROOF_SLATE, 0, 4.6, 2.2));
  return g;
}

function romanesqueChurch(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(4, 3.6, 7), STONE, 0, 1.8, 0));
  g.add(part(new THREE.ConeGeometry(3.4, 1.6, 4), ROOF_SLATE, 0, 4.4, 0));
  const apse = part(new THREE.CylinderGeometry(2, 2, 3.6, 12), DARK_STONE, 0, 1.8, -3.5);
  g.add(apse);
  g.add(part(new THREE.BoxGeometry(1.4, 5.5, 1.4), STONE, 0, 2.75, 3.4));
  g.add(part(new THREE.ConeGeometry(1.2, 1.5, 4), ROOF_SLATE, 0, 6.25, 3.4));
  return g;
}

function gothicCathedral(): { group: THREE.Object3D; bellPivot: THREE.Object3D } {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(5, 6, 10), STONE, 0, 3, 0));
  g.add(part(new THREE.ConeGeometry(4, 2.4, 4), ROOF_SLATE, 0, 7.2, 0));
  for (const dx of [-1.8, 1.8]) {
    g.add(part(new THREE.BoxGeometry(1.6, 9, 1.6), STONE, dx, 4.5, 4.6));
    g.add(part(new THREE.ConeGeometry(1.3, 3.2, 6), ROOF_SLATE, dx, 10.6, 4.6));
  }
  g.add(part(new THREE.ConeGeometry(0.9, 4, 6), ROOF_SLATE, 0, 10.2, -1)); // crossing spire

  // bell hanging between the front towers; pivot swings from the consecration on
  const bellPivot = new THREE.Group();
  bellPivot.name = 'bell';
  const bell = part(new THREE.ConeGeometry(0.5, 0.7, 8), 0xc9a227, 0, -0.55, 0);
  bellPivot.add(bell);
  bellPivot.position.set(0, 8.6, 4.6);
  g.add(bellPivot);

  return { group: g, bellPivot };
}

export interface Cathedral {
  evolutives: EvolutiveObject[];
  bellPivot: THREE.Object3D;
}

export function createCathedral(models: ModelLibrary = EMPTY_MODELS): Cathedral {
  // Model convention: a node named `bell` in cathedral-s3.glb becomes the
  // swinging pivot; absent → detached dummy (model shows, bell just doesn't swing).
  const gothicModel = models.landmark('cathedral-s3');
  const gothic = gothicModel
    ? { group: gothicModel.object, bellPivot: gothicModel.findPivot('bell') ?? new THREE.Group() }
    : gothicCathedral();
  const evolutives = chainOfGroups(SITES.cathedral, [
    { at: 30, build: () => models.landmark('cathedral-s0')?.object ?? chapel() },
    { at: 45, build: () => models.landmark('cathedral-s1')?.object ?? parishChurch() },
    { at: 58, build: () => models.landmark('cathedral-s2')?.object ?? romanesqueChurch() },
    { at: 76, build: () => gothic.group },
  ]);
  return { evolutives, bellPivot: gothic.bellPivot };
}
