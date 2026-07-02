# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Interactive 3D city evolution simulator: a single global `progress` value (0–100) drives one persistent Three.js scene from wilderness to medieval city. The formal spec is `spec/city-simulator.md` (Portuguese) — it is the source of truth for evolution stages, interpolation math, and audio design. Read it before implementing features.

## Stack decisions (not yet scaffolded)

- TypeScript + Vite. No UI framework.
- Three.js `WebGPURenderer` with automatic WebGL fallback — do not use plain `WebGLRenderer` directly.
- Tests: Vitest, logic only (interpolation math, state derivation, demographic curves). No rendering/visual tests.

## Language convention

- Code identifiers, comments, and commits: English.
- Docs and specs (`spec/`): Portuguese.

## Hard constraints from the spec

- All object state derives from the single `progress` variable — no discrete scene swaps, no per-object timers.
- Use `THREE.InstancedMesh` (with `DynamicDrawUsage`) for all repeated assets (trees, houses, walls, NPCs); individual meshes only for singular landmarks (Cathedral, Castle, Town Hall).
- Never swap materials/shaders at runtime — encode variation in shared textures/uniforms interpolated by progress.
- Audio crossfades must be equal-power (cos/sin), never linear; master gain capped at 0.8; audio init only after a user `pointerdown`.
- Performance target: 60 FPS on desktop and mobile with up to 300 NPCs.
