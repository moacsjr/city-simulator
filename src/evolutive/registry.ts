/** Fan-out hub: everything progress-driven registers here; update(p) is deduped. */
export interface ProgressDriven {
  update(progress: number): void;
}

export class Registry implements ProgressDriven {
  private readonly systems: ProgressDriven[] = [];
  private lastProgress = Number.NaN;

  add(...systems: ProgressDriven[]): void {
    this.systems.push(...systems);
  }

  update(progress: number): void {
    if (progress === this.lastProgress) return;
    this.lastProgress = progress;
    for (const system of this.systems) system.update(progress);
  }
}
