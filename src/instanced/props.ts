import { mulberry32, randRange } from '../lib/random';
import { PLAZA_RADIUS } from '../layout/cityLayout';
import { EMPTY_MODELS, type ModelLibrary } from '../models/modelLibrary';
import { coloredBox, coloredCone, mergeParts, poolMaterial } from './geometryKit';
import { InstancedEvolutive, type InstanceDescriptor } from './instancedEvolutive';

/** Communal well at the plaza edge (Foundation stage). */
function wellDescriptor(): InstanceDescriptor {
  return { x: 3.5, z: 4, appearAt: 12, growStart: 12, growEnd: 16, maxScale: 1 };
}

/** Market stalls ring the plaza (Organized Village → permanent market). */
export function createMarketStalls(
  seed = 31,
  count = 10,
  models: ModelLibrary = EMPTY_MODELS,
): InstancedEvolutive {
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
  const asset = models.pool('market-stall', () => ({
    geometry: mergeParts(
      coloredBox(1.4, 0.8, 0.9, 0x8a6f45),
      coloredCone(1.2, 0.5, 4, 0xb0503c, 1.1, true),
    ),
    material: poolMaterial(),
  }));
  const stalls = new InstancedEvolutive(asset.geometry, asset.material, instances);
  stalls.mesh.name = 'market-stalls';
  return stalls;
}

/** Tavern near the plaza (Organized Village), with a hanging sign. */
export function createTavern(models: ModelLibrary = EMPTY_MODELS): InstancedEvolutive {
  const asset = models.pool('tavern', () => ({
    geometry: mergeParts(
      coloredBox(3.0, 2.0, 2.4, 0x8a6a42),
      coloredCone(2.5, 1.2, 4, 0x66492a, 2.0, true),
      coloredBox(0.08, 0.9, 0.5, 0x5c4226, 1.6), // sign post arm
    ),
    material: poolMaterial(),
  }));
  const tavern = new InstancedEvolutive(asset.geometry, asset.material, [
    { x: -4, z: 9.5, rotationY: Math.PI, appearAt: 32, growStart: 32, growEnd: 36, maxScale: 1 },
  ]);
  tavern.mesh.name = 'tavern';
  return tavern;
}

/** Stable for draft animals (Growing Village). */
export function createStable(models: ModelLibrary = EMPTY_MODELS): InstancedEvolutive {
  const asset = models.pool('stable', () => ({
    geometry: mergeParts(
      coloredBox(3.4, 1.4, 2.2, 0x9a7b50),
      coloredCone(2.8, 0.9, 4, 0x6e4f2e, 1.4, true),
      coloredBox(3.6, 0.7, 0.12, 0x5c4226, 0.35), // open front rail
    ),
    material: poolMaterial(),
  }));
  const stable = new InstancedEvolutive(asset.geometry, asset.material, [
    { x: 10, z: 12, rotationY: -0.6, appearAt: 22, growStart: 22, growEnd: 26, maxScale: 1 },
  ]);
  stable.mesh.name = 'stable';
  return stable;
}

/** Structured river dock with stacked cargo (Commercial Center). */
export function createDock(models: ModelLibrary = EMPTY_MODELS): InstancedEvolutive {
  const asset = models.pool('dock', () => ({
    geometry: mergeParts(
      coloredBox(4.5, 0.25, 2.6, 0x8a6a42, 0.5),
      coloredBox(0.2, 0.6, 0.2, 0x5c4226, 0.25),
      coloredBox(0.9, 0.7, 0.9, 0xa8895c, 0.95), // crates
      coloredBox(0.6, 0.5, 0.6, 0x9a7b50, 1.55),
    ),
    material: poolMaterial(),
  }));
  const dock = new InstancedEvolutive(asset.geometry, asset.material, [
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

export function createWell(models: ModelLibrary = EMPTY_MODELS): InstancedEvolutive {
  const asset = models.pool('well', () => ({
    geometry: mergeParts(
      coloredBox(1.0, 0.7, 1.0, 0x9d968a),
      coloredCone(0.9, 0.6, 4, 0x6e4f2e, 1.4, true),
    ),
    material: poolMaterial(),
  }));
  const well = new InstancedEvolutive(asset.geometry, asset.material, [wellDescriptor()]);
  well.mesh.name = 'well';
  return well;
}
