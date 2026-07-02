/** Pure spatial hash grid (spec: spatial partitioning for NPC-density queries). */
export class SpatialGrid<T> {
  private readonly cells = new Map<string, T[]>();

  constructor(private readonly cellSize: number) {}

  private key(x: number, z: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(z / this.cellSize)}`;
  }

  clear(): void {
    this.cells.clear();
  }

  insert(x: number, z: number, item: T): void {
    const key = this.key(x, z);
    const cell = this.cells.get(key);
    if (cell) cell.push(item);
    else this.cells.set(key, [item]);
  }

  /** All items in cells overlapping the circle (coarse — cell granularity). */
  queryCircle(x: number, z: number, radius: number): T[] {
    const result: T[] = [];
    const min = {
      cx: Math.floor((x - radius) / this.cellSize),
      cz: Math.floor((z - radius) / this.cellSize),
    };
    const max = {
      cx: Math.floor((x + radius) / this.cellSize),
      cz: Math.floor((z + radius) / this.cellSize),
    };
    for (let cx = min.cx; cx <= max.cx; cx++) {
      for (let cz = min.cz; cz <= max.cz; cz++) {
        const cell = this.cells.get(`${cx},${cz}`);
        if (cell) result.push(...cell);
      }
    }
    return result;
  }
}
