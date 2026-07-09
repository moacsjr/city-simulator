import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { poolMaterial } from '../instanced/geometryKit';
import type { ModelEntry } from './manifest';

/**
 * Pure adaptation of a loaded glTF scene into the shapes the scene systems
 * consume. All conversion happens once at load — never at runtime — so the
 * spec's "no material/shader swaps" rule holds.
 */

export interface PoolGeometry {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

function collectMeshes(root: THREE.Object3D): THREE.Mesh[] {
  root.updateWorldMatrix(true, true);
  const meshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) meshes.push(child);
  });
  return meshes;
}

function baseColorOf(material: THREE.Material): THREE.Color {
  return 'color' in material && material.color instanceof THREE.Color
    ? material.color
    : new THREE.Color(0xffffff);
}

/**
 * Bakes a solid color into a `color` attribute, multiplying any existing
 * vertex colors (extends geometryKit's paint() to loaded geometry).
 */
export function bakeColorsToVertices(
  geometry: THREE.BufferGeometry,
  color: THREE.Color,
): THREE.BufferGeometry {
  const count = geometry.getAttribute('position').count;
  const existing = geometry.getAttribute('color');
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = color.r * (existing ? existing.getX(i) : 1);
    colors[i * 3 + 1] = color.g * (existing ? existing.getY(i) : 1);
    colors[i * 3 + 2] = color.b * (existing ? existing.getZ(i) : 1);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/** Bakes the manifest's scale/rotationY/yOffset correction into the geometry. */
function applyEntryTransform(geometry: THREE.BufferGeometry, entry: ModelEntry): void {
  const s = entry.scale ?? 1;
  if (s !== 1) geometry.scale(s, s, s);
  if (entry.rotationY) geometry.rotateY(entry.rotationY);
  if (entry.yOffset) geometry.translate(0, entry.yOffset, 0);
}

/**
 * Converts a glTF scene into the (one geometry, one material) pair an
 * InstancedEvolutive pool requires:
 * - Exactly one mesh with one material → passthrough (textures preserved).
 * - Otherwise → all meshes merged into one geometry with material colors
 *   baked as vertex colors on a shared white poolMaterial (textures dropped).
 * - `tintable` entries force white so the pool's instanceColor lerp stays
 *   visually authoritative (GPU color = material × vertexColor × instanceColor).
 */
export function adaptInstanced(root: THREE.Object3D, entry: ModelEntry): PoolGeometry | null {
  const meshes = collectMeshes(root);
  if (meshes.length === 0) return null;

  const soleMaterial = meshes.length === 1 ? meshes[0].material : null;
  if (soleMaterial && !Array.isArray(soleMaterial)) {
    const mesh = meshes[0];
    const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    applyEntryTransform(geometry, entry);
    const material = soleMaterial.clone();
    if (entry.tintable) baseColorOf(material).set(0xffffff);
    return { geometry, material };
  }

  const parts: THREE.BufferGeometry[] = [];
  for (const mesh of meshes) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (let group = 0; group < materials.length; group++) {
      const part = extractGroup(mesh.geometry, materials.length > 1 ? group : undefined)
        .toNonIndexed()
        .applyMatrix4(mesh.matrixWorld);
      bakeColorsToVertices(part, entry.tintable ? WHITE : baseColorOf(materials[group]));
      stripToPoolAttributes(part);
      parts.push(part);
    }
  }
  const geometry = mergeGeometries(parts, false);
  for (const part of parts) part.dispose();
  if (!geometry) return null;
  applyEntryTransform(geometry, entry);
  return { geometry, material: poolMaterial() };
}

const WHITE = new THREE.Color(0xffffff);

/** Slices out the vertex range of one material group (multi-material meshes). */
function extractGroup(geometry: THREE.BufferGeometry, group?: number): THREE.BufferGeometry {
  if (group === undefined || geometry.groups.length === 0) return geometry.clone();
  const g = geometry.groups[group];
  if (!g) return geometry.clone();
  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const sliced = new THREE.BufferGeometry();
  for (const [name, attr] of Object.entries(nonIndexed.attributes)) {
    const itemSize = attr.itemSize;
    const array = (attr.array as Float32Array).slice(
      g.start * itemSize,
      (g.start + g.count) * itemSize,
    );
    sliced.setAttribute(name, new THREE.BufferAttribute(array, itemSize, attr.normalized));
  }
  return sliced;
}

/** mergeGeometries needs identical attribute sets — keep position/normal/color only. */
function stripToPoolAttributes(geometry: THREE.BufferGeometry): void {
  for (const name of Object.keys(geometry.attributes)) {
    if (name !== 'position' && name !== 'normal' && name !== 'color') {
      geometry.deleteAttribute(name);
    }
  }
  geometry.morphAttributes = {};
  if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
}

/**
 * Wraps a glTF scene for use as an EvolutiveObject target. The outer group is
 * what evolution scales/positions; the manifest correction lives on the child
 * so the two never fight.
 */
export function adaptLandmark(gltfScene: THREE.Object3D, entry: ModelEntry): THREE.Group {
  const outer = new THREE.Group();
  outer.name = `model-${entry.id}`;
  gltfScene.scale.setScalar(entry.scale ?? 1);
  gltfScene.rotation.y = entry.rotationY ?? 0;
  gltfScene.position.y = entry.yOffset ?? 0;
  outer.add(gltfScene);
  return outer;
}

/** Depth-first search for an exactly-named node (animation pivot convention). */
export function findPivot(root: THREE.Object3D, name: string): THREE.Object3D | null {
  if (root.name === name) return root;
  for (const child of root.children) {
    const found = findPivot(child, name);
    if (found) return found;
  }
  return null;
}

/**
 * Deep-clones a landmark template, cloning every material — GLTFLoader shares
 * material instances across nodes and EvolutiveObject mutates transparent/
 * opacity, so shared materials would leak fades across stages.
 */
export function cloneWithMaterials(template: THREE.Object3D): THREE.Object3D {
  const clone = template.clone(true);
  clone.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = Array.isArray(child.material)
        ? child.material.map((m: THREE.Material) => m.clone())
        : child.material.clone();
    }
  });
  return clone;
}
