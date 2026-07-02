import * as THREE from 'three';
import { ProgressStore } from './core/progressStore';
import { LightingDirector } from './scene/lightingDirector';
import { createSceneRoot } from './scene/sceneRoot';
import { createControls } from './ui/controls';

const store = new ProgressStore();
const root = createSceneRoot();
const lighting = new LightingDirector(root.scene);

// Placeholder terrain until the ground blend material lands (M3).
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x4a7c3a }),
);
ground.rotation.x = -Math.PI / 2;
root.scene.add(ground);

createControls(store);
store.subscribe((p) => lighting.update(p));

await root.start((dt) => store.tick(dt));
