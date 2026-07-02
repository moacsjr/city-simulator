import * as THREE from 'three';
import { lightingAt } from '../core/stageData';
import type { Rgb } from '../lib/color';

const SUN_DISTANCE = 140;
const SUN_AZIMUTH = THREE.MathUtils.degToRad(35);

function apply(color: THREE.Color, rgb: Rgb): void {
  color.setRGB(rgb.r, rgb.g, rgb.b);
}

/** Drives sky, sun, ambient and fog from the lighting keyframes. */
export class LightingDirector {
  private readonly sun = new THREE.DirectionalLight(0xffffff, 2);
  private readonly ambient = new THREE.AmbientLight(0xffffff, 0.4);
  private readonly fog = new THREE.Fog(0xffffff, 60, 260);
  private readonly sky = new THREE.Color(0x87ceeb);

  constructor(scene: THREE.Scene) {
    scene.add(this.sun, this.ambient);
    scene.fog = this.fog;
    scene.background = this.sky;
  }

  update(progress: number): void {
    const light = lightingAt(progress);
    apply(this.sky, light.sky);
    apply(this.sun.color, light.sun);
    this.sun.intensity = light.sunIntensity;
    apply(this.ambient.color, light.ambient);
    this.ambient.intensity = light.ambientIntensity;
    apply(this.fog.color, light.fog);
    this.fog.near = light.fogNear;
    this.fog.far = light.fogFar;

    const elevation = THREE.MathUtils.degToRad(light.sunElevation);
    this.sun.position.set(
      Math.cos(elevation) * Math.cos(SUN_AZIMUTH) * SUN_DISTANCE,
      Math.sin(elevation) * SUN_DISTANCE,
      Math.cos(elevation) * Math.sin(SUN_AZIMUTH) * SUN_DISTANCE,
    );
  }
}
