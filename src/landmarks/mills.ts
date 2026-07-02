import * as THREE from 'three';
import { EvolutiveObject } from '../evolutive/evolutiveObject';
import { RIVER } from '../layout/cityLayout';
import type { Spinner } from '../scene/ambientAnimator';
import { DARK_WOOD, part, ROOF_RED, STONE, WOOD } from './buildKit';

export interface Mill {
  evolutive: EvolutiveObject;
  spinner: Spinner;
}

/** Watermill by the river (Growing Village, 20–30%): wheel turns with the current. */
export function createWatermill(): Mill {
  const group = new THREE.Group();
  group.name = 'watermill';
  group.add(part(new THREE.BoxGeometry(2.6, 2.2, 2.2), WOOD, 0, 1.1, 0));
  group.add(part(new THREE.ConeGeometry(2.1, 1.2, 4), DARK_WOOD, 0, 2.8, 0));

  const pivot = new THREE.Group();
  const wheel = part(new THREE.CylinderGeometry(1.3, 1.3, 0.25, 10), DARK_WOOD);
  wheel.rotation.x = Math.PI / 2;
  pivot.add(wheel);
  for (let i = 0; i < 4; i++) {
    const paddle = part(new THREE.BoxGeometry(0.35, 2.9, 0.18), WOOD);
    paddle.rotation.z = (i / 4) * Math.PI;
    pivot.add(paddle);
  }
  pivot.position.set(1.7, 1.1, 0);
  group.add(pivot);

  group.position.set(15, 0, RIVER.z + RIVER.width / 2 + 1.4);

  return {
    evolutive: new EvolutiveObject(group, {
      appearAt: 22,
      growStart: 22,
      growEnd: 26,
      maxScale: 1,
    }),
    spinner: { pivot, speed: 0.8 },
  };
}

/** Large windmill on the hills outside the walls (Expansion, 60–70%). */
export function createWindmill(): Mill {
  const group = new THREE.Group();
  group.name = 'windmill';
  group.add(part(new THREE.CylinderGeometry(1.2, 1.8, 4.5, 8), STONE, 0, 2.25, 0));
  group.add(part(new THREE.ConeGeometry(1.5, 1.4, 8), ROOF_RED, 0, 5.2, 0));

  const pivot = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const blade = part(new THREE.BoxGeometry(0.5, 3.6, 0.08), WOOD, 0, 1.8, 0);
    const arm = new THREE.Group();
    arm.add(blade);
    arm.rotation.z = (i / 4) * Math.PI * 2;
    pivot.add(arm);
  }
  pivot.position.set(0, 4.4, 1.55);
  group.add(pivot);

  group.position.set(-38, 0, 34);

  return {
    evolutive: new EvolutiveObject(group, {
      appearAt: 62,
      growStart: 62,
      growEnd: 67,
      maxScale: 1,
    }),
    spinner: { pivot, speed: 0.5 },
  };
}
