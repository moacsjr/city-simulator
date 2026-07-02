import { Soundtrack } from './audio/soundtrack';
import { ProgressStore } from './core/progressStore';
import { Registry } from './evolutive/registry';
import { createAgriculture } from './instanced/agriculture';
import { createAnimals } from './instanced/animals';
import { createForest } from './instanced/forest';
import { createHouses } from './instanced/houses';
import { createMarketStalls, createWell } from './instanced/props';
import { createRoads } from './instanced/roads';
import { createWalls } from './instanced/walls';
import { NpcSystem } from './npc/npcSystem';
import { createCamp } from './landmarks/camp';
import { createCastle } from './landmarks/castle';
import { createCathedral } from './landmarks/cathedral';
import { createTownHall } from './landmarks/townHall';
import { LightingDirector } from './scene/lightingDirector';
import { createSceneRoot } from './scene/sceneRoot';
import { createTerrain } from './scene/terrain';
import { createControls } from './ui/controls';

const store = new ProgressStore();
const root = createSceneRoot();
const registry = new Registry();

registry.add(new LightingDirector(root.scene));

const terrain = createTerrain();
root.scene.add(terrain.group);
registry.add(terrain.driver);

const instancedSystems = [
  createForest(),
  createRoads(),
  createWell(),
  createMarketStalls(),
  ...createHouses(),
  ...createAgriculture(),
  ...createWalls(),
  ...createAnimals(),
];
for (const system of instancedSystems) {
  root.scene.add(system.mesh);
  registry.add(system);
}

const landmarks = [...createCamp(), ...createCastle(), ...createCathedral(), createTownHall()];
for (const evolutive of landmarks) {
  root.scene.add(evolutive.object);
  registry.add(evolutive);
}

const npcs = new NpcSystem();
root.scene.add(npcs.mesh);
registry.add(npcs);

const soundtrack = new Soundtrack();
registry.add(soundtrack);
// Autoplay policy: the AudioContext may only start after a user gesture.
document.addEventListener('pointerdown', () => void soundtrack.initialize(), { once: true });

createControls(store, { audio: soundtrack });
store.subscribe((p) => registry.update(p));

await root.start((dt) => {
  store.tick(dt);
  npcs.tick(dt);
});
