import type * as THREE from 'three';
import { chainWindows, HOUSE_BANDS } from '../lib/chains';
import { mulberry32, randRange } from '../lib/random';
import { generateHousePlots } from '../layout/cityLayout';
import { coloredBox, coloredCone, mergeParts, poolMaterial } from './geometryKit';
import { InstancedEvolutive, type InstanceDescriptor } from './instancedEvolutive';

/** House chain (spec Table 2): hut → wood house → beam house → stone house → townhouse. */
function levelGeometry(level: number): THREE.BufferGeometry {
  switch (level) {
    case 0: // branch/thatch hut
      return coloredCone(1.1, 1.6, 5, 0x8a6f45, 0);
    case 1: // simple rustic wood house
      return mergeParts(
        coloredBox(1.8, 1.2, 1.5, 0x9a7b50),
        coloredCone(1.5, 0.9, 4, 0x6e4f2e, 1.2, true),
      );
    case 2: // larger family house, exposed beams
      return mergeParts(
        coloredBox(2.4, 1.6, 2.0, 0xa8895c),
        coloredBox(2.5, 0.15, 2.1, 0x5c4226, 1.0),
        coloredCone(2.0, 1.1, 4, 0x66492a, 1.6, true),
      );
    case 3: // stone masonry house
      return mergeParts(
        coloredBox(2.6, 1.9, 2.2, 0x9d968a),
        coloredCone(2.2, 1.2, 4, 0x8a4a32, 1.9, true),
      );
    default: // multi-story townhouse with balcony
      return mergeParts(
        coloredBox(2.6, 3.0, 2.3, 0xb0a894),
        coloredBox(3.0, 0.25, 1.0, 0x5c4226, 1.7),
        coloredCone(2.3, 1.4, 4, 0x7d3b28, 3.0, true),
      );
  }
}

/** 5 instanced pools sharing the same plots; levels hand off per chainWindows. */
export function createHouses(seed = 11, plotCount = 140): InstancedEvolutive[] {
  const plots = generateHousePlots(seed, plotCount);
  const rng = mulberry32(seed * 7);
  const perLevel: InstanceDescriptor[][] = HOUSE_BANDS.map(() => []);

  for (const plot of plots) {
    const scale = randRange(rng, 0.85, 1.15);
    for (const { level, evolution } of chainWindows(HOUSE_BANDS, plot.unlockAt)) {
      perLevel[level].push({
        ...evolution,
        maxScale: scale,
        x: plot.x,
        z: plot.z,
        rotationY: plot.rotationY,
      });
    }
  }

  return perLevel
    .filter((instances) => instances.length > 0)
    .map((instances, level) => {
      const pool = new InstancedEvolutive(levelGeometry(level), poolMaterial(), instances);
      pool.mesh.name = `houses-l${level}`;
      return pool;
    });
}
