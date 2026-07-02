import { describe, expect, it } from 'vitest';
import { SpatialGrid } from './spatialGrid';

describe('SpatialGrid', () => {
  it('finds items within the query circle cells', () => {
    const grid = new SpatialGrid<string>(10);
    grid.insert(5, 5, 'a');
    grid.insert(50, 50, 'b');
    const near = grid.queryCircle(0, 0, 8);
    expect(near).toContain('a');
    expect(near).not.toContain('b');
  });

  it('returns items from all overlapped cells', () => {
    const grid = new SpatialGrid<number>(10);
    grid.insert(-5, -5, 1);
    grid.insert(5, 5, 2);
    grid.insert(15, 15, 3);
    const hits = grid.queryCircle(0, 0, 20);
    expect(hits.sort()).toEqual([1, 2, 3]);
  });

  it('clear empties the grid', () => {
    const grid = new SpatialGrid<number>(10);
    grid.insert(0, 0, 1);
    grid.clear();
    expect(grid.queryCircle(0, 0, 5)).toEqual([]);
  });

  it('handles negative coordinates correctly', () => {
    const grid = new SpatialGrid<string>(4);
    grid.insert(-1, -1, 'neg');
    expect(grid.queryCircle(-2, -2, 3)).toContain('neg');
    expect(grid.queryCircle(6, 6, 2)).not.toContain('neg');
  });
});
