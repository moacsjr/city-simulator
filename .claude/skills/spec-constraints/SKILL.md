---
name: spec-constraints
description: Detailed rendering, animation, and audio mandates from spec/city-simulator.md. Use when implementing or reviewing any scene, object-evolution, NPC, or audio feature so the implementation follows the spec's math and performance rules.
---

# City Simulator Spec Constraints

The authoritative spec is `spec/city-simulator.md` (Portuguese). When a detail below is insufficient, read the relevant spec section rather than inventing behavior.

## Progress model

- One global `progress` in [0, 100] drives everything. Audio and interpolation code normalize to [0, 1].
- One persistent scene. Objects appear, grow, and transform as continuous functions of progress — never swap scenes or restart animations at stage boundaries.
- Objects follow the `EvolutiveObject` model: `{appearAt, growStart, growEnd, maxScale, colorTransitions}`.
- Scale animation uses smoothstep: `t = clamp((p - growStart) / (growEnd - growStart), 0, 1); s = t*t*(3 - 2*t) * maxScale`.
- Opacity and color transitions use plain lerp.

## Rendering rules

- `THREE.InstancedMesh` with `DynamicDrawUsage` for every repeated asset: trees, common houses, walls, animals, NPCs.
- Individual meshes only for singular landmarks: Cathedral, Castle, Town Hall.
- No runtime material or shader swaps (WebGL shader recompiles cause frame stalls). Encode material variation in shared textures and interpolate via a uniform tied to progress.
- Renderer is Three.js `WebGPURenderer` with its built-in WebGL fallback.
- 60 FPS target on desktop and mobile with up to 300 NPCs — use spatial partitioning and frustum culling for NPC updates.

## Audio rules

- Web Audio API with per-track GainNodes under a master gain fixed at 0.8 (clipping protection).
- Crossfades between ambience tracks are equal-power: `gainA = cos(t * π/2)`, `gainB = sin(t * π/2)` — never linear ramps.
- `AudioContext` may only be created/resumed after a user `pointerdown` (browser autoplay policy).
- Ambience tracks live at `/assets/audio/*.mp3` (e.g. `wilderness.mp3`, `hamlet.mp3`, `urban_market.mp3`, `medieval_festival.mp3`).

## When reviewing code

Flag as spec violations: linear audio fades, per-object timers or tweens not derived from progress, material swaps keyed on progress thresholds, repeated assets as individual meshes, audio started without a user gesture.
