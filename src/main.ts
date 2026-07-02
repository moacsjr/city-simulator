import { Soundtrack } from './audio/soundtrack';
import { ProgressStore } from './core/progressStore';
import { Registry } from './evolutive/registry';
import { createAgriculture } from './instanced/agriculture';
import { createAnimals } from './instanced/animals';
import {
  createBanners,
  createBridges,
  createFestivalProps,
  createScaffolds,
} from './instanced/festival';
import { createForest } from './instanced/forest';
import { createHouses } from './instanced/houses';
import {
  createDock,
  createMarketStalls,
  createStable,
  createTavern,
  createWell,
} from './instanced/props';
import { createRoads } from './instanced/roads';
import { createWalls } from './instanced/walls';
import { NpcSystem } from './npc/npcSystem';
import { createCamp } from './landmarks/camp';
import { createWatermill, createWindmill } from './landmarks/mills';
import { AmbientAnimator } from './scene/ambientAnimator';
import { createCastle } from './landmarks/castle';
import { createCathedral } from './landmarks/cathedral';
import { createTownHall } from './landmarks/townHall';
import { CameraDirector } from './scene/cameraDirector';
import { LightingDirector } from './scene/lightingDirector';
import { createSceneRoot } from './scene/sceneRoot';
import { createTerrain } from './scene/terrain';
import { detectQuality } from './perf/updateScheduler';
import { createControls } from './ui/controls';
import { PerfHud } from './ui/perfHud';

const quality = detectQuality();
const store = new ProgressStore();
const root = await createSceneRoot(quality.pixelRatioCap);
const registry = new Registry();

registry.add(new LightingDirector(root.scene));

const terrain = createTerrain();
root.scene.add(terrain.group);
registry.add(terrain.driver);

const banners = createBanners();
const instancedSystems = [
  createForest(1, quality.treeCount),
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
  banners,
  createScaffolds(),
];
for (const system of instancedSystems) {
  root.scene.add(system.mesh);
  registry.add(system);
}

const watermill = createWatermill();
const windmill = createWindmill();
const landmarks = [
  ...createCamp(),
  ...createCastle(),
  ...createCathedral(),
  createTownHall(),
  watermill.evolutive,
  windmill.evolutive,
];
for (const evolutive of landmarks) {
  root.scene.add(evolutive.object);
  registry.add(evolutive);
}

const ambient = new AmbientAnimator();
ambient.addSway(banners);
ambient.addSpinner(watermill.spinner, windmill.spinner);
root.scene.add(ambient.smoke.mesh);

const npcs = new NpcSystem(quality.decisionBudget);
root.scene.add(npcs.mesh);
registry.add(npcs);

const cameraDirector = new CameraDirector(root.camera);
registry.add(cameraDirector);

const soundtrack = new Soundtrack();
registry.add(soundtrack);
// Autoplay policy: the AudioContext may only start after a user gesture.
document.addEventListener('pointerdown', () => void soundtrack.initialize(), { once: true });

createControls(store, { audio: soundtrack });
store.subscribe((p) => registry.update(p));

const hud = PerfHud.enabled() ? new PerfHud() : null;

await root.start((dt) => {
  store.tick(dt);
  npcs.tick(dt);
  cameraDirector.tick(dt);
  ambient.tick(dt, store.value);
  hud?.tick(dt, root.renderer);
});
