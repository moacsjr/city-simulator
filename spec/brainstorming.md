A ideia é muito boa porque permite contar uma história visual contínua. Em vez de apenas "aparecerem" novos objetos, a cidade deve dar a sensação de estar viva, como se décadas ou séculos estivessem passando conforme o usuário move a barra.

## Conceito

**Nome provisório:** Medieval City Evolution

Uma timeline interativa onde o usuário controla o desenvolvimento de uma cidade medieval utilizando um slider de 0% a 100%.

Cada posição da barra representa um estágio de evolução.

```
0% ------------------------------------------------------ 100%

Fundação     Vila      Aldeia      Cidade      Metrópole Medieval
```

A animação pode ocorrer tanto quando o usuário arrasta a barra quanto automaticamente.

---

# Estrutura da evolução

## 0–10% — Território Selvagem

Quase não existe cidade.

Elementos:

* floresta
* rio
* algumas pedras
* animais
* fumaça de uma fogueira
* 2 ou 3 pessoas
* uma cabana de madeira

Animações:

* árvores balançando
* fumaça
* pássaros
* água corrente

Sensação:

> Existe apenas um pequeno acampamento.

---

## 10–20% — Fundação

Começa a surgir uma pequena vila.

Novidades:

* 4–8 casas
* poço
* pequenas plantações
* cerca de madeira
* crianças correndo
* galinhas
* cachorro

Animações:

* moradores caminhando
* lenhador cortando árvores
* carroça passando

---

## 20–30% — Vila Crescente

A economia começa.

Novos elementos:

* moinho
* ferreiro
* estábulo
* pequena praça
* ponte de madeira

Mais habitantes.

---

## 30–40% — Aldeia Organizada

Começam construções maiores.

Aparecem:

* igreja pequena
* mercado
* taverna
* estrada principal
* jardins

Animações:

* pessoas negociando
* fumaça saindo das chaminés
* cavalos andando

---

## 40–50% — Centro Comercial

Agora existe riqueza.

Construções:

* mercado grande
* oficinas
* armazéns
* cais (caso tenha rio)

Mais NPCs.

---

## 50–60% — Cidade Murada

Grande salto visual.

Aparece:

* muralha
* torres
* portão principal
* guardas
* arqueiros

Mudança marcante:

A câmera pode fazer um pequeno zoom.

---

## 60–70% — Expansão

Agora tudo cresce.

Mais:

* bairros
* fazendas externas
* vinhedos
* moinho maior
* ponte de pedra

O número de habitantes dobra.

---

## 70–80% — Prosperidade

Arquitetura melhora.

Casas:

* madeira → pedra

Ruas:

* terra → pedra

Novidades:

* catedral
* prefeitura
* biblioteca
* universidade

---

## 80–90% — Capital Medieval

A cidade parece enorme.

Aparecem:

* castelo
* muralhas maiores
* várias torres
* quartel
* praça central

Muito movimento.

---

## 90–100% — Auge

Tudo está completo.

Elementos finais:

* bandeiras
* fontes
* jardins
* barcos
* mercados lotados
* dezenas de habitantes
* cavaleiros
* nobres

Efeitos:

* fumaça
* sinos
* folhas
* pássaros
* bandeiras tremulando
* iluminação mais bonita

---

# O que pode mudar continuamente

Em vez de trocar uma cena por outra, quase tudo pode evoluir gradualmente.

## Casas

```
Cabana

↓

Casa de madeira

↓

Casa maior

↓

Casa de pedra

↓

Sobrado medieval
```

---

## Estradas

```
Trilha

↓

Terra batida

↓

Cascalho

↓

Pedra
```

---

## Agricultura

```
Nada

↓

Horta

↓

Campo

↓

Grande fazenda

↓

Diversas plantações
```

---

## Castelo

```
Nada

↓

Torre

↓

Fortaleza pequena

↓

Castelo

↓

Castelo completo
```

---

## Igreja

```
Capela

↓

Igreja

↓

Catedral
```

---

# Elementos vivos

A quantidade aumenta conforme a barra.

### Pessoas

0%

3 habitantes

↓

25%

20 habitantes

↓

50%

60 habitantes

↓

75%

150 habitantes

↓

100%

300 habitantes

---

### Animais

* galinhas
* cavalos
* vacas
* cachorros
* ovelhas
* patos

---

### Vida urbana

* vendedores
* músicos
* crianças
* padres
* soldados
* nobres
* ferreiros
* carroças

---

# Eventos automáticos

A cada faixa de progresso algo especial acontece.

15%

🌲 Árvores sendo derrubadas.

30%

🏠 Nova casa sendo construída.

45%

🔨 Construção da igreja.

55%

🧱 Construção da muralha.

70%

🏰 Construção do castelo.

85%

⛪ Catedral finalizada.

100%

🎉 Festival medieval.

---

# Evolução da iluminação

Também pode acompanhar a prosperidade.

No início:

* muitas sombras
* aspecto frio
* poucas cores

No final:

* iluminação quente
* mais contraste
* bandeiras coloridas
* jardins
* flores

---

# Sons

O áudio muda junto.

0%

vento

passarinhos

rio

machado

---

30%

martelos

galinhas

pessoas

---

60%

mercado

cavalos

ferreiro

igreja

---

100%

música medieval

multidão

sinos

mercado cheio

---

# Ideia técnica para a animação

Em vez de criar 100 cenas diferentes, modele cada elemento como um objeto com um intervalo de ativação e evolução baseado no progresso (`progress` de 0 a 100):

```text
progress = 0 → 100

Cada objeto possui:

appearAt
growStart
growEnd
maxScale
animation
```

Exemplo:

```text
Casa 12

appearAt = 24

growStart = 24

growEnd = 31

opacity

0 → 1

scale

0 → 1

roofColor

madeira → telha
```

Assim, a barra controla um único valor global (`progress`), e cada objeto calcula seu estado a partir dele, permitindo uma transição contínua sem "saltos". Esse modelo é escalável e facilita adicionar centenas de construções, habitantes e animações independentes.

## Ideia extra: evolução orgânica

Para tornar a experiência ainda mais impressionante, a cidade pode seguir um padrão de crescimento realista. Ela nasce ao redor de um recurso natural (rio ou estrada), depois expande para uma praça central, em seguida surgem bairros especializados (mercado, área residencial, distrito religioso, militar e agrícola), e por fim é envolvida por muralhas, continuando a crescer para fora delas. Esse padrão faz com que cada avanço da barra conte uma história lógica de urbanização medieval, dando ao usuário a sensação de assistir ao desenvolvimento de séculos de história em poucos segundos.

