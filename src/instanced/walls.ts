import { RIVER } from '../layout/cityLayout';
import { coloredBox, coloredCone, mergeParts, poolMaterial } from './geometryKit';
import { InstancedEvolutive, type InstanceDescriptor } from './instancedEvolutive';

const WALL_RADIUS = 46;
const SEGMENTS = 72;
const STONE = 0x8d8578;
const DARK_STONE = 0x7b756b;

/**
 * Defensive ring: wall segments rise stone by stone 50→58% (staggered by
 * angle, spec "first wall stones begin rising" at 50), towers at 52→60,
 * gate towers flank the north road. Gaps where the river crosses the ring.
 */
export function createWalls(): InstancedEvolutive[] {
  const walls: InstanceDescriptor[] = [];
  const towers: InstanceDescriptor[] = [];

  for (let i = 0; i < SEGMENTS; i++) {
    const angle = (i / SEGMENTS) * Math.PI * 2;
    const x = Math.cos(angle) * WALL_RADIUS;
    const z = Math.sin(angle) * WALL_RADIUS;
    if (Math.abs(z - RIVER.z) < RIVER.width / 2 + 2) continue; // river gap
    if (Math.abs(x) < 3 && z > 0) continue; // north gate opening
    const start = 50 + (i % 12) * 0.6; // staggered rise
    walls.push({
      x,
      z,
      rotationY: -angle,
      appearAt: start,
      growStart: start,
      growEnd: start + 5,
      maxScale: 1,
    });
    if (i % 9 === 0) {
      towers.push({
        x,
        z,
        rotationY: -angle,
        appearAt: start + 2,
        growStart: start + 2,
        growEnd: start + 8,
        maxScale: 1,
      });
    }
  }

  // gate towers flanking the north road exit
  for (const gx of [-3.4, 3.4]) {
    towers.push({
      x: gx,
      z: WALL_RADIUS,
      appearAt: 55,
      growStart: 55,
      growEnd: 60,
      maxScale: 1.15,
    });
  }

  const wallPool = new InstancedEvolutive(
    mergeParts(coloredBox(4.4, 3.2, 1.2, STONE), coloredBox(4.4, 0.5, 0.4, DARK_STONE, 3.4)),
    poolMaterial(),
    walls,
  );
  wallPool.mesh.name = 'walls';

  const towerPool = new InstancedEvolutive(
    mergeParts(coloredBox(2.2, 5, 2.2, DARK_STONE), coloredCone(1.8, 1.6, 4, 0x5a6470, 5, true)),
    poolMaterial(),
    towers,
  );
  towerPool.mesh.name = 'wall-towers';

  return [wallPool, towerPool];
}
