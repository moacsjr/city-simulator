import * as THREE from 'three';
import { EvolutiveObject } from '../evolutive/evolutiveObject';

/**
 * Stage-1 pioneer camp: rudimentary hut + campfire near the origin.
 * Both retire early — the growing settlement (M3 house chains) replaces them.
 */
export function createCamp(): EvolutiveObject[] {
  const hutRoofMaterial = new THREE.MeshStandardMaterial({ color: 0x7a5b34, roughness: 1 });
  const hut = new THREE.Group();
  hut.name = 'pioneer-hut';
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.4, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 1 }),
  );
  walls.position.y = 0.7;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.1, 4), hutRoofMaterial);
  roof.position.y = 1.95;
  roof.rotation.y = Math.PI / 4;
  hut.add(walls, roof);
  hut.position.set(2.5, 0, 1.5);

  const fire = new THREE.Group();
  fire.name = 'campfire';
  const logs = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.55, 0.25, 7),
    new THREE.MeshStandardMaterial({ color: 0x4c3a26, roughness: 1 }),
  );
  logs.position.y = 0.12;
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.7, 6),
    new THREE.MeshStandardMaterial({
      color: 0xff8c2e,
      emissive: 0xff6a00,
      emissiveIntensity: 1.5,
    }),
  );
  flame.position.y = 0.55;
  fire.add(logs, flame);
  fire.position.set(-1.5, 0, -1);

  return [
    new EvolutiveObject(hut, {
      appearAt: 0,
      growStart: 0,
      growEnd: 3,
      maxScale: 1,
      retireAt: 18,
      retireSpan: 5,
    }),
    new EvolutiveObject(fire, {
      appearAt: 0,
      growStart: 0,
      growEnd: 1.5,
      maxScale: 1,
      retireAt: 13,
      retireSpan: 4,
    }),
  ];
}
