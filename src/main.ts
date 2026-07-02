import { ProgressStore } from './core/progressStore';
import { Registry } from './evolutive/registry';
import { createAgriculture } from './instanced/agriculture';
import { createForest } from './instanced/forest';
import { createHouses } from './instanced/houses';
import { createMarketStalls, createWell } from './instanced/props';
import { createRoads } from './instanced/roads';
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

createControls(store);
store.subscribe((p) => registry.update(p));

await root.start((dt) => store.tick(dt));
