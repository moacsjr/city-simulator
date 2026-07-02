import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

export interface SceneRoot {
  renderer: WebGPURenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Initializes the renderer (async for WebGPU) and starts the loop. */
  start(onFrame: (dtSeconds: number) => void): Promise<void>;
}

export function createSceneRoot(container: HTMLElement = document.body): SceneRoot {
  // WebGPURenderer falls back to WebGL2 automatically when WebGPU is unavailable.
  const renderer = new WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(30, 25, 30);
  camera.lookAt(0, 0, 0);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  return {
    renderer,
    scene,
    camera,
    async start(onFrame) {
      await renderer.init();
      renderer.setAnimationLoop(() => {
        const dt = Math.min(clock.getDelta(), 0.1);
        onFrame(dt);
        renderer.render(scene, camera);
      });
    },
  };
}
