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

export function createWell(): InstancedEvolutive {
  const geometry = mergeParts(
    coloredBox(1.0, 0.7, 1.0, 0x9d968a),
    coloredCone(0.9, 0.6, 4, 0x6e4f2e, 1.4, true),
  );
  const well = new InstancedEvolutive(geometry, poolMaterial(), [wellDescriptor()]);
  well.mesh.name = 'well';
  return well;
}
