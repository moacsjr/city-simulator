import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  adaptInstanced,
  adaptLandmark,
  bakeColorsToVertices,
  cloneWithMaterials,
  findPivot,
} from './gltfAdapt';
import type { ModelEntry } from './manifest';
import { EMPTY_MODELS } from './modelLibrary';

const ENTRY: ModelEntry = { id: 'tree', kind: 'instanced' };

function boxMesh(hex: number, x = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: hex }),
  );
  mesh.position.x = x;
  return mesh;
}

describe('adaptInstanced', () => {
  it('passthrough: single mesh + single material keeps uv and clones material', () => {
    const root = new THREE.Group();
    const mesh = boxMesh(0xff0000);
    mesh.position.set(0, 2, 0);
    root.add(mesh);

    const result = adaptInstanced(root, ENTRY)!;
    expect(result.geometry.getAttribute('uv')).toBeDefined();
    expect(result.material).not.toBe(mesh.material);
    expect((result.material as THREE.MeshStandardMaterial).color.getHex()).toBe(0xff0000);
    // World matrix baked: box centered at y=2 → max y = 2.5.
    result.geometry.computeBoundingBox();
    expect(result.geometry.boundingBox!.max.y).toBeCloseTo(2.5);
  });

  it('merge: two meshes bake material colors into vertex colors on one geometry', () => {
    const root = new THREE.Group();
    root.add(boxMesh(0xff0000, -2), boxMesh(0x00ff00, 2));

    const result = adaptInstanced(root, ENTRY)!;
    const color = result.geometry.getAttribute('color');
    const position = result.geometry.getAttribute('position');
    expect(result.geometry.index).toBeNull();
    expect(color.count).toBe(position.count);
    // Only pool attributes survive (mergeGeometries needs matching sets).
    expect(Object.keys(result.geometry.attributes).sort()).toEqual(['color', 'normal', 'position']);
    // First half red, second half green (approx — colors are linear-space floats).
    expect(color.getX(0)).toBeGreaterThan(0.5);
    expect(color.getY(0)).toBeLessThan(0.5);
    const last = color.count - 1;
    expect(color.getY(last)).toBeGreaterThan(0.5);
    expect(color.getX(last)).toBeLessThan(0.5);
    expect((result.material as THREE.MeshStandardMaterial).vertexColors).toBe(true);
  });

  it('tintable: baked vertex colors are white so instanceColor lerp stays authoritative', () => {
    const root = new THREE.Group();
    root.add(boxMesh(0xff0000, -2), boxMesh(0x00ff00, 2));

    const result = adaptInstanced(root, { ...ENTRY, tintable: true })!;
    const color = result.geometry.getAttribute('color');
    for (const i of [0, Math.floor(color.count / 2), color.count - 1]) {
      expect(color.getX(i)).toBe(1);
      expect(color.getY(i)).toBe(1);
      expect(color.getZ(i)).toBe(1);
    }
  });

  it('tintable passthrough forces the material color white', () => {
    const root = new THREE.Group();
    root.add(boxMesh(0xff0000));
    const result = adaptInstanced(root, { ...ENTRY, tintable: true })!;
    expect((result.material as THREE.MeshStandardMaterial).color.getHex()).toBe(0xffffff);
  });

  it('bakes manifest scale/yOffset into positions', () => {
    const root = new THREE.Group();
    root.add(boxMesh(0xffffff));
    const result = adaptInstanced(root, { ...ENTRY, scale: 2, yOffset: 0.5 })!;
    result.geometry.computeBoundingBox();
    // Unit box → scaled to 2 (±1) then lifted 0.5 → y ∈ [-0.5, 1.5].
    expect(result.geometry.boundingBox!.max.y).toBeCloseTo(1.5);
    expect(result.geometry.boundingBox!.min.y).toBeCloseTo(-0.5);
    expect(result.geometry.boundingBox!.max.x).toBeCloseTo(1);
  });

  it('returns null for a scene without meshes', () => {
    expect(adaptInstanced(new THREE.Group(), ENTRY)).toBeNull();
  });
});

describe('bakeColorsToVertices', () => {
  it('multiplies existing vertex colors instead of replacing them', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const count = geometry.getAttribute('position').count;
    const half = new Float32Array(count * 3).fill(0.5);
    geometry.setAttribute('color', new THREE.BufferAttribute(half, 3));
    bakeColorsToVertices(geometry, new THREE.Color(1, 0, 1));
    const color = geometry.getAttribute('color');
    expect(color.getX(0)).toBeCloseTo(0.5);
    expect(color.getY(0)).toBeCloseTo(0);
    expect(color.getZ(0)).toBeCloseTo(0.5);
  });
});

describe('adaptLandmark / findPivot / cloneWithMaterials', () => {
  it('wraps the scene so manifest correction lives on the child, not the evolution target', () => {
    const scene = new THREE.Group();
    const outer = adaptLandmark(scene, {
      id: 'windmill',
      kind: 'landmark',
      scale: 2,
      yOffset: 1,
      rotationY: Math.PI,
    });
    expect(outer.children[0]).toBe(scene);
    expect(outer.scale.x).toBe(1);
    expect(scene.scale.x).toBe(2);
    expect(scene.position.y).toBe(1);
    expect(scene.rotation.y).toBeCloseTo(Math.PI);
  });

  it('findPivot locates a nested named node and returns null when absent', () => {
    const root = new THREE.Group();
    const middle = new THREE.Group();
    const spinner = new THREE.Group();
    spinner.name = 'spinner';
    middle.add(spinner);
    root.add(middle);
    expect(findPivot(root, 'spinner')).toBe(spinner);
    expect(findPivot(root, 'bell')).toBeNull();
  });

  it('cloneWithMaterials clones every material (EvolutiveObject mutates opacity)', () => {
    const root = new THREE.Group();
    const shared = new THREE.MeshStandardMaterial();
    root.add(new THREE.Mesh(new THREE.BoxGeometry(), shared));
    root.add(new THREE.Mesh(new THREE.BoxGeometry(), shared));
    const clone = cloneWithMaterials(root);
    const materials: THREE.Material[] = [];
    clone.traverse((c) => {
      if (c instanceof THREE.Mesh) materials.push(c.material as THREE.Material);
    });
    expect(materials).toHaveLength(2);
    expect(materials[0]).not.toBe(shared);
    expect(materials[1]).not.toBe(shared);
    expect(materials[0]).not.toBe(materials[1]);
  });
});

describe('EMPTY_MODELS', () => {
  it('pool() returns the fallback with fromModel=false', () => {
    const fallbackGeometry = new THREE.BoxGeometry();
    const fallbackMaterial = new THREE.MeshStandardMaterial();
    const asset = EMPTY_MODELS.pool('tree', () => ({
      geometry: fallbackGeometry,
      material: fallbackMaterial,
    }));
    expect(asset.fromModel).toBe(false);
    expect(asset.geometry).toBe(fallbackGeometry);
    expect(asset.material).toBe(fallbackMaterial);
  });

  it('landmark() returns null (caller uses procedural builder)', () => {
    expect(EMPTY_MODELS.landmark('windmill')).toBeNull();
    expect(EMPTY_MODELS.has('windmill')).toBe(false);
  });
});
