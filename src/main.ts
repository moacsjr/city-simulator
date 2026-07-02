import { ProgressStore } from './core/progressStore';
import { Registry } from './evolutive/registry';
import { createForest } from './instanced/forest';
import { createCamp } from './landmarks/camp';
import { LightingDirector } from './scene/lightingDirector';
import { createSceneRoot } from './scene/sceneRoot';
import { createTerrain } from './scene/terrain';
import { createControls } from './ui/controls';

const store = new ProgressStore();
const root = createSceneRoot();
const registry = new Registry();

const lighting = new LightingDirector(root.scene);
registry.add(lighting);

root.scene.add(createTerrain());

const forest = createForest();
root.scene.add(forest.mesh);
registry.add(forest);

for (const evolutive of createCamp()) {
  root.scene.add(evolutive.object);
  registry.add(evolutive);
}

createControls(store);
store.subscribe((p) => registry.update(p));

await root.start((dt) => store.tick(dt));
