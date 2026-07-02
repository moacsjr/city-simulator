import { mulberry32, randRange } from '../lib/random';
import { generateFieldPlots } from '../layout/cityLayout';
import { coloredBox, mergeParts, paint, poolMaterial, translated } from './geometryKit';
import { InstancedEvolutive, type InstanceDescriptor } from './instancedEvolutive';
import * as THREE from 'three';

/** Farm animals as instanced pools: chickens near the camp, livestock in fields. */
export function createAnimals(seed = 41): InstancedEvolutive[] {
  const rng = mulberry32(seed);

  const chickens: InstanceDescriptor[] = [];
  for (let i = 0; i < 12; i++) {
    const a = randRange(rng, 0, Math.PI * 2);
    const r = randRange(rng, 4, 9);
    const start = 10 + randRange(rng, 0, 8);
    chickens.push({
      x: Math.cos(a) * r,
      z: Math.sin(a) * r + 3,
      rotationY: randRange(rng, 0, Math.PI * 2),
      appearAt: start,
      growStart: start,
      growEnd: start + 2,
      maxScale: randRange(rng, 0.8, 1.1),
    });
  }
  const chickenPool = new InstancedEvolutive(
    mergeParts(
      translated(paint(new THREE.SphereGeometry(0.16, 6, 5), 0xf2ede2), 0, 0.16, 0),
      translated(paint(new THREE.ConeGeometry(0.05, 0.1, 4), 0xd08030), 0, 0.24, 0.16),
    ),
    poolMaterial(),
    chickens,
  );
  chickenPool.mesh.name = 'chickens';

  const livestock: InstanceDescriptor[] = [];
  for (const plot of generateFieldPlots(seed, 36)) {
    if (rng() < 0.5) continue; // some fields get grazing animals
    const herd = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < herd; i++) {
      const start = Math.max(25, plot.unlockAt) + randRange(rng, 0, 6);
      livestock.push({
        x: plot.x + randRange(rng, -3, 3),
        z: plot.z + randRange(rng, -3, 3),
        rotationY: randRange(rng, 0, Math.PI * 2),
        appearAt: start,
        growStart: start,
        growEnd: start + 3,
        maxScale: randRange(rng, 0.85, 1.15),
      });
    }
  }
  const livestockPool = new InstancedEvolutive(
    mergeParts(
      coloredBox(0.7, 0.45, 0.4, 0xd8d3c8, 0.45),
      translated(paint(new THREE.SphereGeometry(0.16, 6, 5), 0xc9c2b4), 0, 0.72, 0.3),
    ),
    poolMaterial(),
    livestock,
  );
  livestockPool.mesh.name = 'livestock';

  return [chickenPool, livestockPool];
}
