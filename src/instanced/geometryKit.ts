import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Paints a solid vertex color on a geometry so multiple colored parts can be
 * merged into ONE geometry → one InstancedMesh per pool (spec: instanced
 * rendering, minimal draw calls). Use with a white vertexColors material.
 */
export function paint(geometry: THREE.BufferGeometry, hex: number): THREE.BufferGeometry {
  const color = new THREE.Color(hex);
  const count = geometry.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function translated(
  geometry: THREE.BufferGeometry,
  x: number,
  y: number,
  z: number,
): THREE.BufferGeometry {
  return geometry.translate(x, y, z);
}

export function mergeParts(...parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false);
  for (const part of parts) part.dispose();
  return merged;
}

/** Shared white standard material with vertex colors, for merged pools. */
export function poolMaterial(roughness = 0.95): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness });
}

/** Box painted with a solid color, base sitting at y=0. */
export function coloredBox(
  w: number,
  h: number,
  d: number,
  hex: number,
  y = h / 2,
): THREE.BufferGeometry {
  return translated(paint(new THREE.BoxGeometry(w, h, d), hex), 0, y, 0);
}

/** Cone (roof/spire) painted with a solid color, base at y=baseY. */
export function coloredCone(
  radius: number,
  height: number,
  segments: number,
  hex: number,
  baseY: number,
  quarterTurn = false,
): THREE.BufferGeometry {
  const cone = paint(new THREE.ConeGeometry(radius, height, segments), hex);
  if (quarterTurn) cone.rotateY(Math.PI / 4);
  return translated(cone, 0, baseY + height / 2, 0);
}
