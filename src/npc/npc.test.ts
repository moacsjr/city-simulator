import { describe, expect, it } from 'vitest';
import { classCountsAt, classMixAt, pickNext } from './behaviors';
import { activeNodes, buildWaypointGraph, neighborsAt } from './waypointGraph';

describe('classMixAt', () => {
  it('sums to 1 at every progress', () => {
    for (let p = 0; p <= 100; p += 5) {
      const mix = classMixAt(p);
      const total = Object.values(mix).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1);
    }
  });

  it('society matures: only peasants early, all classes at the zenith', () => {
    const early = classMixAt(10);
    expect(early.peasant).toBe(1);
    const late = classMixAt(100);
    for (const share of Object.values(late)) expect(share).toBeGreaterThan(0);
  });
});

describe('classCountsAt', () => {
  it('counts sum exactly to the population', () => {
    for (const [p, pop] of [
      [20, 15],
      [60, 96],
      [100, 300],
    ]) {
      const counts = classCountsAt(p, pop);
      expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(pop);
    }
  });
});

describe('buildWaypointGraph', () => {
  const graph = buildWaypointGraph();

  it('has a symmetric adjacency', () => {
    for (let i = 0; i < graph.nodes.length; i++) {
      for (const j of graph.adjacency[i]) {
        expect(graph.adjacency[j]).toContain(i);
      }
    }
  });

  it('every node has at least one neighbor', () => {
    for (let i = 0; i < graph.nodes.length; i++) {
      expect(graph.adjacency[i].length).toBeGreaterThan(0);
    }
  });

  it('unlock filtering grows the network with progress', () => {
    expect(activeNodes(graph, 0).length).toBeLessThan(activeNodes(graph, 60).length);
    const wallNodes = graph.nodes.filter((n) => n.tag === 'wall');
    expect(wallNodes.length).toBeGreaterThan(0);
    expect(activeNodes(graph, 50).every((i) => graph.nodes[i].tag !== 'wall')).toBe(true);
  });

  it('neighborsAt hides locked nodes', () => {
    const dockIndex = graph.nodes.findIndex((n) => n.tag === 'dock');
    for (const i of graph.adjacency[dockIndex]) {
      const visibleEarly = neighborsAt(graph, i, 10);
      expect(visibleEarly).not.toContain(dockIndex);
    }
  });
});

describe('pickNext', () => {
  const neighbors = [
    { index: 1, tag: 'road' as const },
    { index: 2, tag: 'wall' as const },
    { index: 3, tag: 'road' as const },
  ];

  it('guards prefer wall nodes after the wall closes', () => {
    expect(pickNext(neighbors, 0, 'guard', 60, 0.3)).toBe(2);
  });

  it('guards ignore walls before they exist', () => {
    expect(pickNext(neighbors, 1, 'guard', 40, 0.3)).not.toBe(1); // avoids backtrack
  });

  it('avoids immediate backtracking when alternatives exist', () => {
    for (const r of [0, 0.3, 0.7, 0.99]) {
      expect(pickNext(neighbors, 1, 'peasant', 50, r)).not.toBe(1);
    }
  });

  it('is deterministic for the same rng value', () => {
    expect(pickNext(neighbors, 0, 'trader', 70, 0.42)).toBe(
      pickNext(neighbors, 0, 'trader', 70, 0.42),
    );
  });
});
