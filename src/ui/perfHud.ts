import type { WebGPURenderer } from 'three/webgpu';

/** Dev FPS/draw-call readout. Enabled with ?hud in the URL. */
export class PerfHud {
  private readonly element: HTMLDivElement;
  private fps = 60;

  constructor(host: HTMLElement = document.body) {
    this.element = document.createElement('div');
    this.element.style.cssText =
      'position:fixed;top:10px;left:10px;padding:6px 10px;border-radius:8px;' +
      'background:rgba(20,24,28,.72);color:#9fe08a;font:12px monospace;z-index:10;';
    host.appendChild(this.element);
  }

  static enabled(): boolean {
    return new URLSearchParams(window.location.search).has('hud');
  }

  tick(dt: number, renderer: WebGPURenderer): void {
    if (dt > 0) this.fps += (1 / dt - this.fps) * 0.05; // EMA
    const info = renderer.info;
    this.element.textContent = `${this.fps.toFixed(0)} fps · ${info.render.drawCalls ?? 0} draws · ${info.render.triangles ?? 0} tris`;
  }
}
