import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  adaptInstanced,
  adaptLandmark,
  cloneWithMaterials,
  findPivot,
  type PoolGeometry,
} from './gltfAdapt';
import type { InstancedModelId, LandmarkModelId, ModelEntry, ModelId } from './manifest';
import { modelUrl } from './manifest';

export interface PoolAsset extends PoolGeometry {
  /** false = procedural fallback; callers apply legacy yOffset compensation only then. */
  fromModel: boolean;
}

export interface LandmarkAsset {
  object: THREE.Group;
  /** Named animation pivot (`spinner`, `bell`) or null when the model lacks it. */
  findPivot(name: string): THREE.Object3D | null;
}

/**
 * Preloaded swappable models. Factories stay synchronous: main.ts awaits
 * loadModelLibrary() once, then passes the library in. A missing/invalid file
 * silently falls back to the procedural builder (audio-pattern parity), so an
 * empty models folder renders the exact same scene as before.
 */
export class ModelLibrary {
  constructor(
    private readonly pools = new Map<InstancedModelId, PoolGeometry>(),
    private readonly landmarks = new Map<LandmarkModelId, THREE.Group>(),
  ) {}

  has(id: ModelId): boolean {
    return this.pools.has(id as InstancedModelId) || this.landmarks.has(id as LandmarkModelId);
  }

  /** Model geometry+material for a pool, or the procedural fallback. */
  pool(id: InstancedModelId, fallback: () => PoolGeometry): PoolAsset {
    const loaded = this.pools.get(id);
    if (loaded) return { ...loaded, fromModel: true };
    return { ...fallback(), fromModel: false };
  }

  /** Fresh clone per call (materials cloned — EvolutiveObject mutates them). */
  landmark(id: LandmarkModelId): LandmarkAsset | null {
    const template = this.landmarks.get(id);
    if (!template) return null;
    const object = cloneWithMaterials(template) as THREE.Group;
    return { object, findPivot: (name) => findPivot(object, name) };
  }
}

export const EMPTY_MODELS = new ModelLibrary();

/** 'glTF' magic — Vite's dev server answers 200 + index.html for missing files. */
const GLB_MAGIC = 0x46546c67;

async function fetchGlb(id: ModelId): Promise<ArrayBuffer | null> {
  const url = import.meta.env.BASE_URL + modelUrl(id);
  const response = await fetch(url);
  if (!response.ok) return null;
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength < 12 || new DataView(buffer).getUint32(0, true) !== GLB_MAGIC) return null;
  return buffer;
}

export async function loadModelLibrary(manifest: readonly ModelEntry[]): Promise<ModelLibrary> {
  const loader = new GLTFLoader();
  const pools = new Map<InstancedModelId, PoolGeometry>();
  const landmarks = new Map<LandmarkModelId, THREE.Group>();

  await Promise.all(
    manifest.map(async (entry) => {
      try {
        const buffer = await fetchGlb(entry.id);
        if (!buffer) return;
        const gltf = await loader.parseAsync(buffer, '');
        if (entry.kind === 'instanced') {
          const adapted = adaptInstanced(gltf.scene, entry);
          if (adapted) pools.set(entry.id as InstancedModelId, adapted);
        } else {
          landmarks.set(entry.id as LandmarkModelId, adaptLandmark(gltf.scene, entry));
        }
      } catch (error) {
        // Missing or malformed model → procedural fallback, never a console error.
        console.warn(`model ${entry.id}: using procedural fallback`, error);
      }
    }),
  );
  return new ModelLibrary(pools, landmarks);
}
