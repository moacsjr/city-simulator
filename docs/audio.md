# Áudio — trilhas ambiente

## Arquivos esperados

Coloque 4 loops em `public/assets/audio/` (servidos em `/assets/audio/`):

| Arquivo                 | Conteúdo (spec)                               | Zona (progresso normalizado) |
| ----------------------- | --------------------------------------------- | ---------------------------- |
| `wilderness.mp3`        | vento, aves, rio, machado                     | 0.0 – 0.3                    |
| `hamlet.mp3`            | martelos, galinhas, conversas próximas        | 0.2 – 0.6                    |
| `urban_market.mp3`      | mercado, cavalos, ferreiro, igreja            | 0.5 – 0.8                    |
| `medieval_festival.mp3` | música festiva, multidão densa, sinos grandes | 0.7 – 1.0                    |

Requisitos: loop sem emenda audível (crossfade interno no arquivo ajuda),
mono ou estéreo, ~30 s+, volume normalizado entre as faixas (o motor não
compensa loudness). Fontes CC0 sugeridas: freesound.org, pixabay.com/sound-effects.

## Arquivos atuais (CC0, baixados via Openverse/Freesound em 2026-07-02)

| Arquivo                 | Fonte (freesound.org)                                         |
| ----------------------- | ------------------------------------------------------------- |
| `wilderness.mp3`        | #460178 — forest ambience, steady breeze, Sweden (loop)       |
| `hamlet.mp3`            | #607920 — Morning Village Ambience, Dog Barking               |
| `urban_market.mp3`      | #159614 — Venditori Campo de' Fiori (feira, vendedores)       |
| `medieval_festival.mp3` | #703643 — Sound environment of a festival of medieval culture |

Licença CC0 — sem atribuição obrigatória. Substitua à vontade por faixas melhores.

**Sem os arquivos o motor funciona igual**: `proceduralAmbience.ts` sintetiza
loops substitutos via `OfflineAudioContext` (ruído filtrado, batidas, sinos).
Trocar por mp3 reais não exige mudança de código.

## Desvio documentado em relação ao código da spec

O `updateVolume` literal da spec tem duas descontinuidades: ganho cai de 1→0
ao cruzar `max`, e em `min` o lead-in (cos→1) colide com a rampa interna
(sin(0)=0). Isso produziria estalidos e violaria o invariante declarado pela
própria spec ("potência equivalente, sem estalido").

Implementação adotada (`trackGains.ts`): as zonas de fade são exatamente as
sobreposições entre ranges vizinhos ([0.2,0.3], [0.5,0.6], [0.7,0.8]); a faixa
que sai segue `cos(u·π/2)`, a que entra `sin(u·π/2)` — as mesmas curvas
trigonométricas da spec — garantindo `Σ ganho² = 1` em todo o intervalo.
Também usamos `setTargetAtTime` (30 ms) no lugar de `setValueAtTime` para
eliminar zipper noise em scrubs rápidos do slider.

Master gain fixo em **0.8** e inicialização somente após `pointerdown`
(política de autoplay), conforme a spec.
