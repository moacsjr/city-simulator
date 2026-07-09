# Modelos GLTF trocáveis

Todo objeto da cena pode ser substituído por um modelo `.glb`: basta colocar o
arquivo em `public/assets/models/<id>.glb` e recarregar a página. Apagar o
arquivo volta ao visual procedural original. Nenhuma edição de código é
necessária — o nome do arquivo **é** o id do asset.

## Workflow de troca

1. (Opcional) Gere os templates iniciais: com `npm run dev` rodando, abra
   `http://localhost:5173/export-models.html` e baixe o `.glb` do objeto
   desejado (ou rode `npm run export:models` para baixar todos em
   `public/assets/model-templates/`). Cada template já tem o footprint, as
   cores e os pivôs corretos.
2. Edite/substitua o modelo no Blender (ou outra DCC) e exporte como **glTF
   Binary (.glb)**, com `+Y up` (padrão do exportador).
3. Copie para `public/assets/models/<id>.glb` e recarregue.

Um arquivo ausente ou inválido é ignorado silenciosamente (fallback
procedural) — a cena nunca quebra por causa de um modelo.

## Convenções de autoria

- **Unidades:** 1 unidade ≈ 1 metro.
- **Origem:** centro da base do modelo — o ponto mais baixo em `y = 0`. Os
  objetos "crescem do chão" (escala a partir de zero), então uma origem no
  centro faria o modelo afundar.
- **Orientação:** frente (porta/fachada) voltada para **+Z**.
- Ajustes finos sem re-exportar: os campos `scale`, `yOffset` e `rotationY`
  em `src/models/manifest.ts` são aplicados uma única vez no load.

### Ids e dimensões de referência

Instanciados (`kind: 'instanced'` — viram 1 `InstancedMesh` por pool):

| Id                                                            | Objeto                                 | Footprint aprox. (l×a×p)       |
| ------------------------------------------------------------- | -------------------------------------- | ------------------------------ |
| `tree`                                                        | pinheiro (~1200 instâncias!)           | 0.8 × 2.5 × 0.8                |
| `house-l0`…`house-l4`                                         | cabana → casa de vila                  | 2.2×1.6 → 2.6×3.0×2.3          |
| `field-l0`…`field-l4`                                         | hortas → vinhedos (laje no chão)       | 2.5 → 9.0 de lado              |
| `road`                                                        | segmento de estrada (laje)             | 3 × 0.06 × 2.1                 |
| `wall` / `wall-tower`                                         | muralha / torre                        | 4.4×3.2×1.2 / 2.2×6.6×2.2      |
| `chicken` / `livestock`                                       | galinha / gado                         | ~0.3 / ~0.9                    |
| `well`, `tavern`, `stable`, `dock`, `market-stall`            | props da vila                          | 1–4.5 de lado                  |
| `banner`                                                      | mastro com bandeira (balança ao vento) | 0.9 × 3.6                      |
| `fountain`, `boat`, `bridge-wood`, `bridge-stone`, `scaffold` | props/festival                         | 2–3 de lado; pontes ~11 de vão |

Landmarks (`kind: 'landmark'` — meshes individuais, aparecem com fade):

| Id                            | Objeto                          | Altura aprox. |
| ----------------------------- | ------------------------------- | ------------- |
| `camp-hut`, `campfire`        | acampamento pioneiro            | 2.5 / 0.9     |
| `castle-s0`…`castle-s3`       | atalaia → complexo senhorial    | 6 → 12        |
| `cathedral-s0`…`cathedral-s3` | capela → catedral gótica        | 3.8 → 12      |
| `town-hall`                   | prefeitura com torre do relógio | 6.9           |
| `watermill` / `windmill`      | moinhos (têm pivô animado)      | 3.4 / 5.9     |

## Regras de materiais (instanciados)

Cada pool instanciado precisa de **1 geometria + 1 material** (1 draw call):

- **1 mesh com 1 material** no .glb → usado como está; **texturas funcionam**.
- **Vários meshes/materiais** → tudo é fundido em uma geometria só e as cores
  dos materiais viram vertex colors; **texturas são descartadas**. Quer
  textura? Exporte um único mesh com um único material (atlas).
- Pools **tintable** (`tree`, `field-*`, `road`): a cor final vem do lerp de
  cor por instância (outono, estado da lavoura, terra→pedra) — as cores do
  modelo são forçadas para branco. Modele a forma; a cor é do simulador.
- Nos demais pools com cor por instância (`banner`), a cor multiplica o
  modelo — áreas claras/brancas mostram a cor da bandeira.

Landmarks não têm essas restrições: o grupo do .glb é usado direto (materiais
clonados por estágio; opacidade/escala são dirigidas pelo progresso).

## Pivôs animados (landmarks)

Nomeie o nó exatamente assim no Blender para a animação funcionar:

| Modelo                          | Nó        | Animação                        |
| ------------------------------- | --------- | ------------------------------- |
| `watermill.glb`, `windmill.glb` | `spinner` | rotação contínua em Z           |
| `cathedral-s3.glb`              | `bell`    | balanço do sino a partir de 84% |

Sem o nó, o modelo aparece normalmente — apenas não anima (não é erro).
Os templates exportados já trazem os pivôs nomeados.

## Orçamento de performance

Alvo do spec: 60 FPS em desktop **e mobile**.

- Assets instanciados: ≤ ~1.000 triângulos (`tree` especialmente — são ~1200
  instâncias em 1 draw call).
- Landmarks: ≤ ~10.000 triângulos.
- Texturas: ≤ 1024×1024.
- Sem DRACO/KTX2 por ora — use `.glb` simples.

## Observações

- Os modelos são buscados uma única vez, antes do primeiro frame — sem
  hitching em runtime e sem troca de shader (regra do spec).
- Em `vite preview`/produção, um modelo ausente gera um 404 real no console
  do navegador (inofensivo). No dev server isso não acontece.
