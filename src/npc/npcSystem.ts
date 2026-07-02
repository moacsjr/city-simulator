import * as THREE from 'three';
import { MAX_POPULATION, populationAt } from '../lib/demographics';
import { mulberry32, randRange } from '../lib/random';
import { mergeParts, paint, poolMaterial, translated } from '../instanced/geometryKit';
import type { ProgressDriven } from '../evolutive/registry';
import { classCountsAt, CLASS_COLOR, pickNext, type NpcClass } from './behaviors';
import { activeNodes, buildWaypointGraph, neighborsAt, type WaypointGraph } from './waypointGraph';

interface NpcState {
  cls: NpcClass;
  from: number;
  to: number;
  prev: number;
  t: number;
  speed: number;
  scale: number;
}

const dummy = new THREE.Object3D();
const color = new THREE.Color();

/**
 * All NPCs as ONE InstancedMesh (capsule body + head merged; class via
 * instanceColor). Count/classes derive from progress (demographic curve);
 * locomotion is clock-driven ambient animation over the waypoint graph.
 */
export class NpcSystem implements ProgressDriven {
  readonly mesh: THREE.InstancedMesh;
  private readonly graph: WaypointGraph;
  private readonly npcs: NpcState[] = [];
  private readonly rng = mulberry32(97);
  private activeCount = 0;
  private progress = 0;

  constructor() {
    this.graph = buildWaypointGraph();
    const geometry = mergeParts(
      translated(paint(new THREE.CapsuleGeometry(0.22, 0.5, 3, 8), 0xffffff), 0, 0.47, 0),
      translated(paint(new THREE.SphereGeometry(0.16, 8, 6), 0xffe0c0), 0, 0.98, 0),
    );
    this.mesh = new THREE.InstancedMesh(geometry, poolMaterial(0.8), MAX_POPULATION);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.name = 'npcs';
    for (let i = 0; i < MAX_POPULATION; i++) this.mesh.setColorAt(i, color.setHex(0xffffff));
  }

  /** Progress-driven: population size and class mix. */
  update(progress: number): void {
    this.progress = progress;
    const population = populationAt(progress);
    const counts = classCountsAt(progress, population);

    // (re)assign classes for the active range in a stable order
    const classes: NpcClass[] = [];
    for (const cls of Object.keys(counts) as NpcClass[]) {
      for (let i = 0; i < counts[cls]; i++) classes.push(cls);
    }

    const unlocked = activeNodes(this.graph, progress);
    while (this.npcs.length < population && unlocked.length > 0) {
      const start = unlocked[Math.floor(this.rng() * unlocked.length)];
      this.npcs.push({
        cls: 'peasant',
        from: start,
        to: start,
        prev: start,
        t: 1,
        speed: randRange(this.rng, 1.2, 2.4),
        scale: randRange(this.rng, 0.9, 1.1),
      });
    }
    this.activeCount = Math.min(population, this.npcs.length);
    for (let i = 0; i < this.activeCount; i++) {
      this.npcs[i].cls = classes[i] ?? 'peasant';
      this.mesh.setColorAt(i, color.setHex(CLASS_COLOR[this.npcs[i].cls]));
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  /** Clock-driven: locomotion along the unlocked waypoint graph. */
  tick(dt: number): void {
    const nodes = this.graph.nodes;
    for (let i = 0; i < this.activeCount; i++) {
      const npc = this.npcs[i];
      const from = nodes[npc.from];
      const to = nodes[npc.to];
      const distance = Math.hypot(to.x - from.x, to.z - from.z);

      if (npc.t >= 1 || distance < 1e-3) {
        const neighborIdx = neighborsAt(this.graph, npc.to, this.progress);
        if (neighborIdx.length > 0) {
          const options = neighborIdx.map((index) => ({ index, tag: nodes[index].tag }));
          const next = pickNext(options, npc.prev, npc.cls, this.progress, this.rng());
          npc.prev = npc.from;
          npc.from = npc.to;
          npc.to = next;
          npc.t = 0;
        }
      } else {
        npc.t = Math.min(1, npc.t + (npc.speed * dt) / distance);
      }

      const x = from.x + (to.x - from.x) * npc.t;
      const z = from.z + (to.z - from.z) * npc.t;
      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, Math.atan2(to.x - from.x, to.z - from.z), 0);
      dummy.scale.setScalar(npc.scale);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    // park inactive instances at zero scale
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    for (let i = this.activeCount; i < MAX_POPULATION; i++) this.mesh.setMatrixAt(i, dummy.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
