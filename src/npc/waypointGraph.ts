/**
 * Pure waypoint graph over the road network + points of interest.
 * Nodes carry `unlockAt` so the walkable network grows with the city.
 */
import { generateRoadSegments, PLAZA_RADIUS, RIVER, SITES } from '../layout/cityLayout';

export type WaypointTag = 'road' | 'market' | 'forest' | 'wall' | 'castle' | 'dock';

export interface Waypoint {
  x: number;
  z: number;
  unlockAt: number;
  tag: WaypointTag;
}

export interface WaypointGraph {
  nodes: Waypoint[];
  adjacency: number[][];
}

const LINK_DISTANCE = 5.5;
const WALL_RADIUS = 46;

export function buildWaypointGraph(): WaypointGraph {
  const nodes: Waypoint[] = [];

  for (const seg of generateRoadSegments()) {
    nodes.push({ x: seg.x, z: seg.z, unlockAt: seg.unlockAt, tag: 'road' });
  }

  // market ring around the plaza
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    nodes.push({
      x: Math.cos(a) * (PLAZA_RADIUS - 2),
      z: Math.sin(a) * (PLAZA_RADIUS - 2),
      unlockAt: 0,
      tag: 'market',
    });
  }

  // forest working edge (woodcutters) — near the early clearing boundary
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const x = Math.cos(a) * 14;
    const z = Math.sin(a) * 14;
    if (Math.abs(z - RIVER.z) < RIVER.width) continue;
    nodes.push({ x, z, unlockAt: 5, tag: 'forest' });
  }

  // wall patrol ring (guards, after the wall closes)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const z = Math.sin(a) * (WALL_RADIUS - 2);
    if (Math.abs(z - RIVER.z) < RIVER.width + 2) continue;
    nodes.push({ x: Math.cos(a) * (WALL_RADIUS - 2), z, unlockAt: 56, tag: 'wall' });
  }

  nodes.push({ x: SITES.castle.x, z: SITES.castle.z + 6, unlockAt: 62, tag: 'castle' });
  nodes.push({ x: 4, z: RIVER.z + RIVER.width / 2 + 1.5, unlockAt: 40, tag: 'dock' });

  // adjacency: link nodes within LINK_DISTANCE; wall ring links to itself even if sparse
  const adjacency: number[][] = nodes.map(() => []);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z);
      const bothWall = nodes[i].tag === 'wall' && nodes[j].tag === 'wall';
      if (d <= LINK_DISTANCE || (bothWall && d <= 26)) {
        adjacency[i].push(j);
        adjacency[j].push(i);
      }
    }
  }
  // POIs (market/forest/wall/castle/dock) also link to their nearest road node
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].tag === 'road' || adjacency[i].some((j) => nodes[j].tag === 'road')) continue;
    let best = -1;
    let bestD = Infinity;
    for (let j = 0; j < nodes.length; j++) {
      if (nodes[j].tag !== 'road') continue;
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    if (best >= 0) {
      adjacency[i].push(best);
      adjacency[best].push(i);
    }
  }
  return { nodes, adjacency };
}

/** Neighbor indices of node i that are unlocked at progress p. */
export function neighborsAt(graph: WaypointGraph, i: number, progress: number): number[] {
  return graph.adjacency[i].filter((j) => graph.nodes[j].unlockAt <= progress);
}

/** Indices of all unlocked nodes at progress p. */
export function activeNodes(graph: WaypointGraph, progress: number): number[] {
  const active: number[] = [];
  for (let i = 0; i < graph.nodes.length; i++) {
    if (graph.nodes[i].unlockAt <= progress) active.push(i);
  }
  return active;
}
