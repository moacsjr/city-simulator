import { mulberry32, randRange } from '../lib/random';
import { PLAZA_RADIUS } from '../layout/cityLayout';
import { coloredBox, coloredCone, mergeParts, poolMaterial } from './geometryKit';
import { InstancedEvolutive, type InstanceDescriptor } from './instancedEvolutive';

/** Communal well at the plaza edge (Foundation stage). */
function wellDescriptor(): InstanceDescriptor {
  return { x: 3.5, z: 4, appearAt: 12, growStart: 12, growEnd: 16, maxScale: 1 };
}

/** Market stalls ring the plaza (Organized Village → permanent market). */
export function createMarketStalls(seed = 31, count = 10): InstancedEvolutive {
  const rng = mulberry32(seed);
  const instances: InstanceDescriptor[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + randRange(rng, -0.15, 0.15);
    const radius = PLAZA_RADIUS - 1 + randRange(rng, 0, 1.2);
    const start = 32 + randRange(rng, 0, 10);
    instances.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      rotationY: -angle,
      appearAt: start,
      growStart: start,
      growEnd: start + 3,
      maxScale: randRange(rng, 0.9, 1.1),
    });
  }
  const geometry = mergeParts(
    coloredBox(1.4, 0.8, 0.9, 0x8a6f45),
    coloredCone(1.2, 0.5, 4, 0xb0503c, 1.1, true),
  );
  const stalls = new InstancedEvolutive(geometry, poolMaterial(), instances);
  stalls.mesh.name = 'market-stalls';
  return stalls;
}

/** Tavern near the plaza (Organized Village), with a hanging sign. */
export function createTavern(): InstancedEvolutive {
  const geometry = mergeParts(
    coloredBox(3.0, 2.0, 2.4, 0x8a6a42),
    coloredCone(2.5, 1.2, 4, 0x66492a, 2.0, true),
    coloredBox(0.08, 0.9, 0.5, 0x5c4226, 1.6), // sign post arm
  );
  const tavern = new InstancedEvolutive(geometry, poolMaterial(), [
    { x: -4, z: 9.5, rotationY: Math.PI, appearAt: 32, growStart: 32, growEnd: 36, maxScale: 1 },
  ]);
  tavern.mesh.name = 'tavern';
  return tavern;
}

/** Stable for draft animals (Growing Village). */
export function createStable(): InstancedEvolutive {
  const geometry = mergeParts(
    coloredBox(3.4, 1.4, 2.2, 0x9a7b50),
    coloredCone(2.8, 0.9, 4, 0x6e4f2e, 1.4, true),
    coloredBox(3.6, 0.7, 0.12, 0x5c4226, 0.35), // open front rail
  );
  const stable = new InstancedEvolutive(geometry, poolMaterial(), [
    { x: 10, z: 12, rotationY: -0.6, appearAt: 22, growStart: 22, growEnd: 26, maxScale: 1 },
  ]);
  stable.mesh.name = 'stable';
  return stable;
}

/** Structured river dock with stacked cargo (Commercial Center). */
export function createDock(): InstancedEvolutive {
  const geometry = mergeParts(
    coloredBox(4.5, 0.25, 2.6, 0x8a6a42, 0.5),
    coloredBox(0.2, 0.6, 0.2, 0x5c4226, 0.25),
    coloredBox(0.9, 0.7, 0.9, 0xa8895c, 0.95), // crates
    coloredBox(0.6, 0.5, 0.6, 0x9a7b50, 1.55),
  );
  const dock = new InstancedEvolutive(geometry, poolMaterial(), [
    {
      x: 5,
      z: -24.2,
      rotationY: 0,
      appearAt: 42,
      growStart: 42,
      growEnd: 46,
      maxScale: 1,
    },
  ]);
  dock.mesh.name = 'dock';
  return dock;
}

export function createWell(): InstancedEvolutive {
  const geometry = mergeParts(
    coloredBox(1.0, 0.7, 1.0, 0x9d968a),
    coloredCone(0.9, 0.6, 4, 0x6e4f2e, 1.4, true),
  );
  const well = new InstancedEvolutive(geometry, poolMaterial(), [wellDescriptor()]);
  well.mesh.name = 'well';
  return well;
}
