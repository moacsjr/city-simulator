import * as THREE from 'three';
import { EvolutiveObject } from '../evolutive/evolutiveObject';
import { SITES } from '../layout/cityLayout';
import { EMPTY_MODELS, type ModelLibrary } from '../models/modelLibrary';
import { DARK_WOOD, part, ROOF_RED, STONE } from './buildKit';

function buildTownHall(): THREE.Object3D {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(4.5, 3, 3.5), STONE, 0, 1.5, 0));
  g.add(part(new THREE.ConeGeometry(3.2, 1.6, 4), ROOF_RED, 0, 3.8, 0));
  g.add(part(new THREE.BoxGeometry(1.1, 5.5, 1.1), STONE, 1.4, 2.75, 0)); // clock tower
  g.add(part(new THREE.ConeGeometry(0.95, 1.4, 4), ROOF_RED, 1.4, 6.2, 0));
  g.add(part(new THREE.BoxGeometry(1.6, 1.2, 0.2), DARK_WOOD, 0, 0.6, 1.76)); // door
  return g;
}

/** Town hall: single landmark, appears in the Prosperity stage. */
export function createTownHall(models: ModelLibrary = EMPTY_MODELS): EvolutiveObject {
  const g = models.landmark('town-hall')?.object ?? buildTownHall();
  g.name = 'town-hall';
  g.position.set(SITES.townHall.x, 0, SITES.townHall.z);

  return new EvolutiveObject(g, { appearAt: 72, growStart: 72, growEnd: 78, maxScale: 1 });
}
