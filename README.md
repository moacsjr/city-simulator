# City Simulator

Simulador 3D interativo em que um único slider de progresso (0–100%) evolui uma cena persistente: de um território selvagem (floresta densa, rio, acampamento) até uma capital medieval (muralhas, castelo, catedral gótica, festival), em 10 estágios decadais. Tudo — construções, estradas, população (3 → 300 NPCs), iluminação e trilha sonora — deriva continuamente desse único valor, sem trocas de cena.

**Demo ao vivo:** https://moacsjr.github.io/city-simulator/

## Stack

- TypeScript + Vite (sem framework de UI)
- Three.js `WebGPURenderer` com fallback automático para WebGL2
- Web Audio API (trilha ambiente em 4 camadas)
- Vitest (testes de lógica)

## Destaques técnicos

- `InstancedMesh` para todos os assets repetidos — a floresta (~1200 árvores) renderiza em 1 draw call.
- Material TSL do chão interpolado por uniform de progresso — nenhuma troca de shader em runtime.
- Crossfade de áudio equal-power (cos/sin) entre 4 camadas ambiente CC0.
- Curva demográfica definida pelas âncoras da spec (3 → 300 NPCs).
- Grafo de waypoints para NPCs que cresce junto com a cidade.
- Eventos como janelas de ativação puras — seguro para scrub do slider em qualquer direção.

## Como executar

```sh
npm install
npm run dev        # http://localhost:5173
```

Outros comandos:

```sh
npm test               # 104 testes (Vitest)
npm run lint
npm run build
npm run preview
npm run verify:visual  # screenshots golden via Playwright (requer dev/preview rodando)
```

Dica: adicione `?hud` à URL para exibir FPS e draw calls. O som ativa após o primeiro clique (política de autoplay dos navegadores).

## Controles

- **Slider** — controla o progresso (0–100%)
- **▶** — auto-play (~25 s do início ao fim)
- **🔊** — liga/desliga o som

## Estrutura

```
src/
  core/       estado global de progresso (store)
  lib/        utilitários de interpolação e matemática
  layout/     plano da cidade (rio, estradas, lotes)
  scene/      renderer, terreno, câmera, iluminação, animação ambiente
  evolutive/  registro de objetos dirigidos por progresso
  instanced/  assets repetidos (floresta, casas, muralhas, animais...)
  landmarks/  construções singulares (castelo, catedral, prefeitura, moinhos)
  npc/        população, waypoints e comportamento
  audio/      trilha sonora e crossfades
  ui/         controles e HUD de performance
  perf/       detecção de qualidade e orçamento de atualização
```

## Documentação

- `spec/city-simulator.md` — documento de engenharia (PT), fonte da verdade para estágios, matemática de interpolação e áudio.
- `docs/audio.md` — trilhas ambiente e licenças (CC0).

## CI

GitHub Actions roda lint + testes + build, verifica screenshots golden e faz deploy no GitHub Pages a cada push em `main`.
