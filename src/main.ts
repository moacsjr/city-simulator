import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

// WebGPURenderer falls back to WebGL2 automatically when WebGPU is unavailable.
const renderer = new WebGPURenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(30, 25, 30);
camera.lookAt(0, 0, 0);

const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(50, 80, 30);
scene.add(sun, new THREE.AmbientLight(0xffffff, 0.4));

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x4a7c3a }),
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

await renderer.init();
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
