/**
 * Dev-only template exporter: rebuilds every procedural asset via the real
 * factories and exports one .glb per manifest id. The downloads are editable
 * starter files (correct footprint, colors, and named `spinner`/`bell` pivots)
 * for swapping models into public/assets/models/.
 *
 * Served at /export-models.html in dev; not part of the production build.
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createAgriculture } from '../instanced/agriculture';
import { createAnimals } from '../instanced/animals';
import {
  createBanners,
  createBridges,
  createFestivalProps,
  createScaffolds,
} from '../instanced/festival';
import { createForest } from '../instanced/forest';
import { createHouses } from '../instanced/houses';
import {
  createDock,
  createMarketStalls,
  createStable,
  createTavern,
  createWell,
} from '../instanced/props';
import { createRoads } from '../instanced/roads';
import { createWalls } from '../instanced/walls';
import type { InstancedEvolutive } from '../instanced/instancedEvolutive';
import { createCamp } from '../landmarks/camp';
import { createCastle } from '../landmarks/castle';
import { createCathedral } from '../landmarks/cathedral';
import { createTownHall } from '../landmarks/townHall';
import { createWatermill, createWindmill } from '../landmarks/mills';
import { MODEL_MANIFEST, type ModelId } from '../models/manifest';

/** Instanced pools carry their template on mesh.name → manifest id. */
const POOL_NAME_TO_ID: Record<string, ModelId> = {
  forest: 'tree',
  'houses-l0': 'house-l0',
  'houses-l1': 'house-l1',
  'houses-l2': 'house-l2',
  'houses-l3': 'house-l3',
  'houses-l4': 'house-l4',
  'fields-l0': 'field-l0',
  'fields-l1': 'field-l1',
  'fields-l2': 'field-l2',
  'fields-l3': 'field-l3',
  'fields-l4': 'field-l4',
  roads: 'road',
  walls: 'wall',
  'wall-towers': 'wall-tower',
  chickens: 'chicken',
  livestock: 'livestock',
  well: 'well',
  tavern: 'tavern',
  stable: 'stable',
  dock: 'dock',
  'market-stalls': 'market-stall',
  banners: 'banner',
  fountain: 'fountain',
  boats: 'boat',
  'bridge-wood': 'bridge-wood',
  'bridge-stone': 'bridge-stone',
  scaffolds: 'scaffold',
};

function buildTemplates(): Map<ModelId, THREE.Object3D> {
  const templates = new Map<ModelId, THREE.Object3D>();

  const pools: InstancedEvolutive[] = [
    createForest(1, 1),
    createRoads(),
    createWell(),
    createTavern(),
    createStable(),
    createDock(),
    createMarketStalls(),
    ...createHouses(),
    ...createAgriculture(),
    ...createWalls(),
    ...createAnimals(),
    ...createBridges(),
    ...createFestivalProps(),
    createBanners(),
    createScaffolds(),
  ];
  for (const pool of pools) {
    const id = POOL_NAME_TO_ID[pool.mesh.name];
    if (!id) continue;
    const mesh = new THREE.Mesh(pool.mesh.geometry, pool.mesh.material);
    mesh.name = id;
    // The forest cone is center-origin (legacy); templates follow the
    // origin-at-ground authoring convention.
    if (id === 'tree') mesh.geometry.translate(0, 1.25, 0);
    templates.set(id, mesh);
  }

  const [hut, fire] = createCamp();
  const castle = createCastle();
  const cathedral = createCathedral();
  const landmarks: Array<[ModelId, THREE.Object3D]> = [
    ['camp-hut', hut.object],
    ['campfire', fire.object],
    ['castle-s0', castle[0].object],
    ['castle-s1', castle[1].object],
    ['castle-s2', castle[2].object],
    ['castle-s3', castle[3].object],
    ['cathedral-s0', cathedral.evolutives[0].object],
    ['cathedral-s1', cathedral.evolutives[1].object],
    ['cathedral-s2', cathedral.evolutives[2].object],
    ['cathedral-s3', cathedral.evolutives[3].object],
    ['town-hall', createTownHall().object],
    ['watermill', createWatermill().evolutive.object],
    ['windmill', createWindmill().evolutive.object],
  ];
  for (const [id, object] of landmarks) {
    object.position.set(0, 0, 0); // templates are authored at the origin
    object.name = id;
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // EvolutiveObject marks materials transparent for its fade — undo for export.
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          material.transparent = false;
          material.opacity = 1;
        }
      }
    });
    templates.set(id, object);
  }

  return templates;
}

async function toGlb(object: THREE.Object3D): Promise<Blob> {
  const exporter = new GLTFExporter();
  const result = (await exporter.parseAsync(object, { binary: true })) as ArrayBuffer;
  return new Blob([result], { type: 'model/gltf-binary' });
}

function download(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
}

const templates = buildTemplates();
const list = document.getElementById('list')!;
const status = document.getElementById('status')!;

// A chain level can be empty with the current layout data (no pool built) —
// its id has no template, and a dropped .glb for it would be unused anyway.
const exportable = MODEL_MANIFEST.filter((entry) => templates.has(entry.id));
const skipped = MODEL_MANIFEST.filter((entry) => !templates.has(entry.id));
if (skipped.length > 0) {
  status.textContent = `sem template (nível vazio): ${skipped.map((e) => e.id).join(', ')}`;
}

for (const entry of exportable) {
  const row = document.createElement('div');
  row.className = 'row';
  const button = document.createElement('button');
  button.textContent = `${entry.id}.glb`;
  button.dataset.modelId = entry.id;
  button.addEventListener('click', () => {
    void toGlb(templates.get(entry.id)!).then((blob) => download(blob, `${entry.id}.glb`));
  });
  row.append(button, ` — ${entry.kind}${entry.tintable ? ' · tintable' : ''}`);
  list.append(row);
}

// Automation hook (scripts/export-models.mjs): browsers throttle >10 automatic
// downloads, so the script pulls the bytes directly instead of clicking.
declare global {
  interface Window {
    exportableIds: string[];
    exportTemplate(id: string): Promise<string>;
  }
}
window.exportableIds = exportable.map((entry) => entry.id);
window.exportTemplate = async (id: string): Promise<string> => {
  const object = templates.get(id as ModelId);
  if (!object) throw new Error(`no template for ${id}`);
  const bytes = new Uint8Array(await (await toGlb(object)).arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

document.getElementById('download-all')!.addEventListener('click', () => {
  void (async () => {
    let done = 0;
    for (const entry of exportable) {
      download(await toGlb(templates.get(entry.id)!), `${entry.id}.glb`);
      status.textContent = `exported ${++done}/${exportable.length}`;
      await new Promise((resolve) => setTimeout(resolve, 150)); // let downloads settle
    }
    status.textContent = `done — ${done} templates`;
  })();
});
