import { describe, expect, it } from 'vitest';
import { MODEL_MANIFEST, modelUrl } from './manifest';

describe('model manifest', () => {
  it('has unique ids', () => {
    const ids = MODEL_MANIFEST.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('derives the URL from the id (drop-in swap needs no manifest edit)', () => {
    expect(modelUrl('tree')).toBe('assets/models/tree.glb');
    expect(modelUrl('castle-s2')).toBe('assets/models/castle-s2.glb');
  });

  it('marks the tree pool tintable (instanceColor autumn lerp must win)', () => {
    const tree = MODEL_MANIFEST.find((e) => e.id === 'tree');
    expect(tree?.tintable).toBe(true);
    expect(tree?.kind).toBe('instanced');
  });

  it('covers every house/field chain level and all landmark stages', () => {
    const ids = new Set(MODEL_MANIFEST.map((e) => e.id));
    for (let level = 0; level < 5; level++) {
      expect(ids.has(`house-l${level}` as never)).toBe(true);
      expect(ids.has(`field-l${level}` as never)).toBe(true);
    }
    for (let stage = 0; stage < 4; stage++) {
      expect(ids.has(`castle-s${stage}` as never)).toBe(true);
      expect(ids.has(`cathedral-s${stage}` as never)).toBe(true);
    }
  });
});
