/**
 * Manifest of swappable GLTF assets. Dropping `public/assets/models/<id>.glb`
 * replaces that object's procedural geometry on next reload; deleting the file
 * reverts to procedural. The URL is derived from the id — swapping a model
 * never requires editing this file.
 */

export type InstancedModelId =
  | 'tree'
  | 'house-l0'
  | 'house-l1'
  | 'house-l2'
  | 'house-l3'
  | 'house-l4'
  | 'field-l0'
  | 'field-l1'
  | 'field-l2'
  | 'field-l3'
  | 'field-l4'
  | 'road'
  | 'wall'
  | 'wall-tower'
  | 'chicken'
  | 'livestock'
  | 'well'
  | 'tavern'
  | 'stable'
  | 'dock'
  | 'market-stall'
  | 'banner'
  | 'fountain'
  | 'boat'
  | 'bridge-wood'
  | 'bridge-stone'
  | 'scaffold';

export type LandmarkModelId =
  | 'camp-hut'
  | 'campfire'
  | 'castle-s0'
  | 'castle-s1'
  | 'castle-s2'
  | 'castle-s3'
  | 'cathedral-s0'
  | 'cathedral-s1'
  | 'cathedral-s2'
  | 'cathedral-s3'
  | 'town-hall'
  | 'watermill'
  | 'windmill';

export type ModelId = InstancedModelId | LandmarkModelId;

export interface ModelEntry {
  id: ModelId;
  kind: 'instanced' | 'landmark';
  /** Uniform scale correction baked into the asset at load (default 1). */
  scale?: number;
  /** Vertical correction baked at load; authoring convention is origin-at-ground (default 0). */
  yOffset?: number;
  /** Yaw correction baked at load; authoring convention is +Z forward (default 0). */
  rotationY?: number;
  /** Pool color is driven by an instanceColor lerp: baked colors are forced white. */
  tintable?: boolean;
}

const instanced = (id: InstancedModelId, extra?: Partial<ModelEntry>): ModelEntry => ({
  id,
  kind: 'instanced',
  ...extra,
});
const landmark = (id: LandmarkModelId): ModelEntry => ({ id, kind: 'landmark' });

export const MODEL_MANIFEST: readonly ModelEntry[] = [
  instanced('tree', { tintable: true }),
  instanced('house-l0'),
  instanced('house-l1'),
  instanced('house-l2'),
  instanced('house-l3'),
  instanced('house-l4'),
  // Fields and roads: the per-instance color lerp IS the surface color
  // (crop state, dirt→stone paving) — model colors are forced white.
  instanced('field-l0', { tintable: true }),
  instanced('field-l1', { tintable: true }),
  instanced('field-l2', { tintable: true }),
  instanced('field-l3', { tintable: true }),
  instanced('field-l4', { tintable: true }),
  instanced('road', { tintable: true }),
  instanced('wall'),
  instanced('wall-tower'),
  instanced('chicken'),
  instanced('livestock'),
  instanced('well'),
  instanced('tavern'),
  instanced('stable'),
  instanced('dock'),
  instanced('market-stall'),
  instanced('banner'),
  instanced('fountain'),
  instanced('boat'),
  instanced('bridge-wood'),
  instanced('bridge-stone'),
  instanced('scaffold'),
  landmark('camp-hut'),
  landmark('campfire'),
  landmark('castle-s0'),
  landmark('castle-s1'),
  landmark('castle-s2'),
  landmark('castle-s3'),
  landmark('cathedral-s0'),
  landmark('cathedral-s1'),
  landmark('cathedral-s2'),
  landmark('cathedral-s3'),
  landmark('town-hall'),
  landmark('watermill'),
  landmark('windmill'),
];

/** Convention over configuration: file name == asset id. */
export function modelUrl(id: ModelId): string {
  return `assets/models/${id}.glb`;
}
