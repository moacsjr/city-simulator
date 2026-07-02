import * as THREE from 'three';

/** Mesh part helper for landmark builders (individual meshes are allowed here). */
export function part(geometry: THREE.BufferGeometry, hex: number, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: hex, roughness: 0.9 }),
  );
  mesh.position.set(x, y, z);
  return mesh;
}

export const STONE = 0x9d968a;
export const DARK_STONE = 0x7b756b;
export const WOOD = 0x8a6a42;
export const DARK_WOOD = 0x5c4226;
export const ROOF_RED = 0x8a4a32;
export const ROOF_SLATE = 0x5a6470;
