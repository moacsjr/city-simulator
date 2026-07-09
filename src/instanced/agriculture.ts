import * as THREE from 'three';
import { chainWindows, FIELD_BANDS } from '../lib/chains';
import { generateFieldPlots } from '../layout/cityLayout';
import type { InstancedModelId } from '../models/manifest';
import { EMPTY_MODELS, type ModelLibrary } from '../models/modelLibrary';
import { InstancedEvolutive, type InstanceDescriptor } from './instancedEvolutive';

/** Agriculture chain: gardens → plowed fields → farms → vineyards (color + size). */
const LEVEL_STYLE = [
  { size: 2.5, from: 0x557a3a, to: 0x557a3a }, // wild scrub / first gardens
  { size: 4.0, from: 0x5f8a3e, to: 0x6b8f3c }, // domestic gardens
  { size: 6.5, from: 0x8a7a3a, to: 0x9d8a3e }, // plowed cereal fields
  { size: 8.0, from: 0xa08a38, to: 0xb59a40 }, // organized farm
  { size: 9.0, from: 0x6a7a35, to: 0x7d8a3a }, // vineyards
] as const;

export function createAgriculture(
  seed = 23,
  plotCount = 36,
  models: ModelLibrary = EMPTY_MODELS,
): InstancedEvolutive[] {
  const plots = generateFieldPlots(seed, plotCount);
  const perLevel: InstanceDescriptor[][] = LEVEL_STYLE.map(() => []);

  for (const plot of plots) {
    for (const { level, evolution } of chainWindows(FIELD_BANDS, plot.unlockAt, 0, 6)) {
      const style = LEVEL_STYLE[level];
      perLevel[level].push({
        ...evolution,
        x: plot.x,
        z: plot.z,
        rotationY: plot.rotationY,
        color: {
          from: style.from,
          to: style.to,
          start: evolution.growStart,
          end: evolution.growEnd + 10,
        },
      });
    }
  }

  return perLevel
    .map((instances, level) => {
      if (instances.length === 0) return null;
      const style = LEVEL_STYLE[level];
      const asset = models.pool(`field-l${level}` as InstancedModelId, () => ({
        geometry: new THREE.BoxGeometry(style.size, 0.12, style.size * 0.8),
        material: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }),
      }));
      const pool = new InstancedEvolutive(asset.geometry, asset.material, instances);
      pool.mesh.name = `fields-l${level}`;
      return pool;
    })
    .filter((pool): pool is InstancedEvolutive => pool !== null);
}
