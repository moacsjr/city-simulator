import { mulberry32, randRange } from '../lib/random';
import { PLAZA_RADIUS, RIVER, SITES } from '../layout/cityLayout';
import { coloredBox, coloredCone, mergeParts, poolMaterial } from './geometryKit';
import { InstancedEvolutive, type InstanceDescriptor } from './instancedEvolutive';

const BANNER_COLORS = [0xb03a3a, 0x3a5fb0, 0xc9a227, 0x5a3ab0];

/** Festival layer (≥90%): banner poles around the plaza and along the walls. */
export function createBanners(seed = 53): InstancedEvolutive {
  const rng = mulberry32(seed);
  const instances: InstanceDescriptor[] = [];
  const spots: Array<[number, number]> = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    spots.push([Math.cos(a) * (PLAZA_RADIUS + 1.5), Math.sin(a) * (PLAZA_RADIUS + 1.5)]);
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const z = Math.sin(a) * 44;
    if (Math.abs(z - RIVER.z) < RIVER.width + 2) continue;
    spots.push([Math.cos(a) * 44, z]);
  }
  for (const [x, z] of spots) {
    const start = 90 + randRange(rng, 0, 4);
    const hex = BANNER_COLORS[Math.floor(rng() * BANNER_COLORS.length)];
    instances.push({
      x,
      z,
      rotationY: randRange(rng, 0, Math.PI * 2),
      appearAt: start,
      growStart: start,
      growEnd: start + 2,
      maxScale: 1,
      color: { from: hex, to: hex, start: 0, end: 1 },
    });
  }
  const geometry = mergeParts(
    coloredBox(0.12, 3.4, 0.12, 0x6e5a3a),
    coloredBox(0.9, 0.6, 0.05, 0xffffff, 3.0),
  );
  const banners = new InstancedEvolutive(geometry, poolMaterial(), instances);
  banners.mesh.name = 'banners';
  return banners;
}

/** Plaza fountain, decorated river boats, and the dock boat (40%+). */
export function createFestivalProps(): InstancedEvolutive[] {
  const fountain = new InstancedEvolutive(
    mergeParts(
      coloredBox(2.2, 0.5, 2.2, 0x9d968a),
      coloredBox(1.6, 0.15, 1.6, 0x4a90c2, 0.55),
      coloredCone(0.35, 1.1, 6, 0x9d968a, 0.5),
    ),
    poolMaterial(),
    [{ x: 0, z: 0, appearAt: 92, growStart: 92, growEnd: 95, maxScale: 1 }],
  );
  fountain.mesh.name = 'fountain';

  const boatGeometry = mergeParts(
    coloredBox(2.4, 0.4, 1.0, 0x6e4f2e, 0.3),
    coloredBox(0.1, 1.4, 0.1, 0x5c4226, 1.0),
    coloredBox(0.7, 0.5, 0.05, 0xc94a3a, 1.35),
  );
  const boats = new InstancedEvolutive(boatGeometry, poolMaterial(), [
    // structured dock boat appears with the Commercial Center stage
    { x: 8, z: RIVER.z, rotationY: 0.3, appearAt: 42, growStart: 42, growEnd: 45, maxScale: 1 },
    // decorated festival boats
    {
      x: -14,
      z: RIVER.z + 1,
      rotationY: -0.2,
      appearAt: 90,
      growStart: 90,
      growEnd: 93,
      maxScale: 1,
    },
    {
      x: 22,
      z: RIVER.z - 1,
      rotationY: 0.15,
      appearAt: 91,
      growStart: 91,
      growEnd: 94,
      maxScale: 1,
    },
    { x: -30, z: RIVER.z, rotationY: 0.4, appearAt: 93, growStart: 93, growEnd: 96, maxScale: 1 },
  ]);
  boats.mesh.name = 'boats';

  return [fountain, boats];
}


/** Wooden bridge (Growing Village) → stone bridge (Expansion) over the river. */
export function createBridges(): InstancedEvolutive[] {
  const span = RIVER.width + 3;
  const wooden = new InstancedEvolutive(
    mergeParts(
      coloredBox(3, 0.25, span, 0x8a6a42, 0.55),
      coloredBox(0.15, 0.5, span, 0x5c4226, 0.9),
    ),
    poolMaterial(),
    [
      {
        x: 0,
        z: RIVER.z,
        appearAt: 22,
        growStart: 22,
        growEnd: 26,
        maxScale: 1,
        retireAt: 62,
        retireSpan: 4,
      },
    ],
  );
  wooden.mesh.name = 'bridge-wood';

  const stone = new InstancedEvolutive(
    mergeParts(
      coloredBox(3.6, 0.4, span, 0x9d968a, 0.6),
      coloredBox(0.25, 0.6, span, 0x7b756b, 1.0),
    ),
    poolMaterial(),
    [{ x: 0, z: RIVER.z, appearAt: 62, growStart: 62, growEnd: 66, maxScale: 1 }],
  );
  stone.mesh.name = 'bridge-stone';

  return [wooden, stone];
}

/** Construction scaffolds occupying each build-event window (micro-narrative). */
export function createScaffolds(): InstancedEvolutive {
  const sites: Array<{ at: number; x: number; z: number }> = [
    { at: 30, x: 4, z: 8 }, // new housing near the plaza
    { at: 45, x: SITES.cathedral.x, z: SITES.cathedral.z + 4 },
    { at: 50, x: 0, z: 44 }, // wall rising at the north gate
    { at: 70, x: SITES.castle.x, z: SITES.castle.z - 5 },
    { at: 75, x: SITES.townHall.x, z: SITES.townHall.z + 4 },
    { at: 85, x: SITES.cathedral.x - 4, z: SITES.cathedral.z },
  ];
  const instances: InstanceDescriptor[] = sites.map(({ at, x, z }) => ({
    x,
    z,
    appearAt: at - 2,
    growStart: at - 2,
    growEnd: at,
    maxScale: 1,
    retireAt: at + 3,
    retireSpan: 3,
  }));
  const geometry = mergeParts(
    coloredBox(0.15, 3, 0.15, 0xa88c5f),
    coloredBox(2.4, 0.12, 0.8, 0xa88c5f, 1.5),
    coloredBox(2.4, 0.12, 0.8, 0xa88c5f, 2.6),
  );
  const scaffolds = new InstancedEvolutive(geometry, poolMaterial(), instances);
  scaffolds.mesh.name = 'scaffolds';
  return scaffolds;
}

