# Movimento — Landing Master Pet (Direção 1) · nível 2, sem WebGL

**Estado final: `landing/landing-v6.html` · `landing-v6.js` · `landing-v6.css`** (v3 + refinos 3, 4A, 4B, 5 e 6). As seções "Refino 3/4A/4B" abaixo são histórico; onde conflitam, vale o "Estado final (v6)" no fim do arquivo. Tokens base em `tokens/motion.css`.

## Stack
- **GSAP 3.12.5 + ScrollTrigger** (CDN jsDelivr). Next.js: `npm i gsap`, `gsap.registerPlugin(ScrollTrigger)`, usar `useGSAP`/`gsap.context()` e `ctx.revert()` no unmount.
- Responsivo: `gsap.matchMedia()`. Desktop pin: `(min-width:900px) and (min-height:720px)`. Cursor/hover só com `(hover:hover) and (pointer:fine)`.
- **Só `transform`, `opacity` e `clip-path`** animam (exceção: `stroke-dashoffset` do SVG da cena 4 e do check da cena 9).
- **`prefers-reduced-motion: reduce`**: nenhuma cena é criada; página estática e legível (linha SVG completa, frases alinhadas, pin e fichas visíveis, barra de progresso oculta).
- **Sem JS / sem GSAP**: nenhum conteúdo nem CTA começa escondido por CSS; estados iniciais só são aplicados via `gsap.set/from` depois do carregamento.
- Loops (máx. 1 por seção): hero = brilho do CTA (`.mp-btn--glow`, opacity, 3,2 s); Camila em ação = pulso do pin. O "brilho varrendo Camila" roda uma vez.

## Cenas
| # | Cena | trigger | start → end | scrub | ease | duração | valores |
|---|------|---------|-------------|-------|------|---------|---------|
| 1 | Hero · entrada | timeline ao carregar | — | não | foto `power3.out`; texto `expo.out` | foto 1,4 s; linhas 0,9 s; stagger 0,12 s | `.lp-hero__bg` scale 1,15→1 (t=0); eyebrow opacity 0→1, y 24→0 (t=.15); linhas do H1 em máscara (`overflow:hidden`) yPercent 100→0 (t=.3); sub (t=.95) e CTA (t=1,04) opacity+y 24→0; brilho: `.lp-shine` (cópia clara de "Camila") clip-path `inset(0 100% 0 -30%)`→`inset(0 -30% 0 100%)`, 1,1 s `power2.inOut` (t=1,3). Máscara liberada (`overflow:visible`) ao fim. |
| 2 | Hero · saída | `.lp-hero` | `top top` → `bottom top` | `true` | `none` (foto) / `power1.in` (texto) | proporcional ao scroll | `.lp-cover` yPercent 0→12 e scale 1→1,08; `.lp-hero__copy` y 0→−90 e opacity 1→0 |
| 3 | Problema | `.lp-chaos` | `top 100%` → `bottom 80%` (≈ 85–95vh; com +=120vh as frases só alinhavam fora da tela) | `0,6` | `power2.out` | 1 por frase, offset 0,28 | cada frase i: rotation (final±5°) → final (−2,2 / 1,6 / −1,1 / 2), y −64·i → 0 (sobrepostas → alinhadas), x ±70 → 0, opacity 0→1 |
| 4 | Como funciona | `.lp-flow` | `top 72%` → `bottom 42%` | `0,5` | `none` / `power2.out` | linha 1 (timeline); passos 0,18 | `path` stroke-dashoffset 1→0 (`pathLength=1`); mobile: `.lp-vline` scaleY 0→1; cada `.lp-step2` opacity .35→1, y 24→0 em t = 0,01 / 0,41 / 0,81 (mobile e desktop) |
| 5 | Camila em ação | `#acao` (**pin**, só desktop) | `top top` → `+=210vh` | pin + `onUpdate` (progress÷3 = tema) | pin `power3.out`; ficha `none` | pin 0,6 s; ficha crossfade 0,3 s (0,15 + 0,15) | tema muda a cada 1/3 do progress; pin dourado `x,y` (px = % × caixa da foto); título da ficha troca com opacity 1→0→1. Clique nos botões chama `pinST.scroll()` para o ponto do tema. Mobile / altura < 720: sem pin; só botões (pin move com a mesma tween). |
| 6 | A diferença | parágrafo + `#diferenca` | parágrafo `top 82%` → `bottom 48%`; foto `top 85%` → `top 20%` | `true` | `none` | stagger 0,12 · 0,3 | palavras opacity .2→1; `.lp-band__photo` clip-path `inset(12%)`→`inset(0%)` |
| 7 | O que destrava | `.lp-bento` | `top 82%` (once) | não | `power3.out` | 0,7 s; stagger 0,07 | cards opacity 0→1, y 28→0. Hover (desktop): card y 0→−4 (0,3 s `power2.out`); `.lp-glow` (círculo 260 px, gradiente dourado) segue o mouse via `quickTo` x/y 0,35 s, opacity 0→1 |
| 8 | Quem é | `.lp-arch` | `top 80%` (once) | não | `power3.inOut` / `power3.out` | 1,2 s | clip-path `inset(34% 22% 0 22% round 999px 999px 0 0)`→`inset(0 round 999px 999px 20px 20px)` (limpo ao fim para liberar a sombra); retrato y 40→0 |
| 9 | Formulário | `#lp-form` | `top 80%` (once) | não | `power3.out` | 0,6 s; stagger 0,06 | título, lead, campos, grupos, consent e botão: opacity 0→1, y 24→0. Foco: anel dourado (`::after`, só opacity 0→1, 200 ms). Sucesso: círculo scale .6→1 (`back.out(1.8)`, 0,5 s), check stroke-dashoffset 1→0 (0,7 s, delay 0,2), texto stagger 0,1 |
| 10 | Global | `document` | `0` → `max` | `true` | `none` | — | barra dourada 2 px `scaleX` 0→1 (origin left, `z-index` 80). CTA magnético (desktop): botões grandes e CTA do header, `quickTo` x/y 0,4 s `power3.out`, deslocamento = 0,2 × distância ao centro, **≤ 8 px**, raio de ativação 56 px. Fundos: gradiente de 20vh entre seções (`.lp-fade--n/l/b`), estático |

## Reveal genérico (fora das cenas)
`.mp-reveal`: opacity 0→1 + translateY 24→0, 700 ms, `cubic-bezier(.22,1,.36,1)`, stagger 90 ms (`--i`), via IntersectionObserver (`once`). Na migração para Next.js pode virar `ScrollTrigger.batch`.

## Notas de implementação
- Quebra do H1 em linhas feita por JS (medição de `offsetTop`); refazer em `resize` se o layout mudar de breakpoint.
- `ScrollTrigger.refresh()` após `load` (imagens) e em `invalidateOnRefresh` nas cenas 3 e 5.
- Seção pinada recebe `.is-pin` (altura 100svh; foto com altura `100svh − 372px`, mín. 340 px) para caber inteira na tela.

## Ajustes do refino 3/3 (motion)
- Cena 3: end trocado para `bottom 80%` (ver tabela); rotações finais ±1,4° (CSS e JS iguais), sem sobreposição no estado final.
- Cenas 7, 8 e 9: tween criado `paused` com `fromTo` e disparado por `ScrollTrigger.create({onEnter, onRefresh})` (helper `onceIn`). Motivo: `G.from()` + `once:true` deixava cards invisíveis ao pular a página. No Next.js, mantenha esse padrão.
- Cena 5: painel 4:3 (`object-position center 38%`); largura pinada = `min(100%, max(520px, (100svh − 340px) × 1.3333))`. 3:2 cortava os olhos ou o aparelho; 4:3 mostra rostos e mãos. Pins (desktop % do painel): atendimento 78/87 (aparelho), precificação 76/33 (colar), padrão da equipe 31/50 (broche do uniforme). Mobile (4:5): 78/68, 76/35, 31/45; ficha fora da foto.
- Cena 8: o retrato do arco é centrado com `left:0;right:0;margin:auto` (nunca `translateX`, que o GSAP sobrescreve).
- QA: `_qa.html` força o movimento mesmo com reduced-motion do sistema (`window.__QA_MOTION`); `_qa-nopin.html` desliga o pin.

## Refino 4A (landing-v4.html · landing-v4.css · landing-v4.js) — substitui as cenas 3, 4 e 6
Ordem de criação no JS segue a ordem da página (problema → diferença → como → ação), exigência do ScrollTrigger com pins em sequência. Pin: `(min-width:900px) and (min-height:720px)`; abaixo disso, sem pin.

| # | Cena | trigger | start → end | scrub | valores |
|---|------|---------|-------------|-------|---------|
| 3 | Problema · teleprompter | `.lp-prob__stage` (**pin** desktop) | `top top` → `+=220vh` | `.5` | timeline de 10 u. Sinal 01 nasce a 100%; sinais 02–04 a .12. A cada passo (t=1, 3, 5) o novo sobe a 1 e o anterior cai a .28 com y −8. Linha dourada `scaleY` 0→marca de cada sinal (valores por função, `invalidateOnRefresh`) →1; 4 marcas opacity .3→1 / scale .6→1. Frase de fechamento opacity 0→1, y 16→0 em t=7,2 (depois, o pin solta). Foto: scale 1→1,08 e véu dessaturado opacity 0→.375 (ver nota); gradiente de topo opacity 1→0 em t≤1,2. |
| 3m | Problema · mobile / altura < 720 | cada `.lp-sign` | `top 85%` → `bottom 15%` | `.4` | sem pin. Cada linha: opacity .12→1 (0–.3), cai a .28 e y −8 (.5–.8). Linha `scaleY` no `.lp-signs-wrap`; fechamento com toggle (play/reverse); foto scale + véu no stage inteiro. |
| 4 | Como funciona · 6 passos | `#como` (**pin** desktop) | `top top` → `+=280vh` | `.5` | timeline de 8 u., nó i alcançado em R=[.5,1.7,2.9,4.1,5.3,6.5]. Traço (`stroke-dashoffset`, `pathLength=1`, gradiente SVG `--mp-blue-200`→`--mp-gold-400`) chega a cada nó pela fração real do caminho (`getPointAtLength`). Cada nó: camada dourada opacity 0→1 (cold→gold), scale 1→1,12 (volta a 1 no próximo), anel scale 1→1,9 / opacity .85→0 uma vez. Texto opacity .35→1, y 24→0. Brilho `.lp-flow__glow` opacity .10→.45. Nó 06: camada de preenchimento ouro, numeral navy. Contador 01/06 atualizado no `onUpdate` da timeline (não do ScrollTrigger, por causa do scrub suave). |
| 4m | Como funciona · mobile | cada `.lp-step2` | `top 78%` → `bottom 52%` | `.4` | sem pin, linha vertical em segmentos (`.lp-seg i` scaleY 0→1, gradiente `color-mix` blue→gold por segmento), mesmo acender do nó e anel; brilho acompanha o bloco; **contador oculto no mobile**. |
| 6 | A diferença | cada parágrafo | `top 82%` → `bottom 48%` | `true` | palavras opacity .2→1 nos 2 parágrafos; foto clip-path inalterada. Fechamento e marcadores usam o reveal genérico. |

Notas
- **Saturação sem animar `filter`:** a foto do problema tem `saturate(.8)` estático; uma cópia em `grayscale(1)` sobreposta anima só `opacity` 0→.375 (≈ saturate .5). Cumpre a regra transform/opacity/clip-path.
- Cor dos nós: duas camadas (azul frio e ouro) com crossfade de opacity — `border-color`/`color` não são animados.
- Estático (reduced-motion / sem JS): nenhum estado é escondido por CSS; problema com todas as linhas a 100% e linha completa; como funciona com traço completo, 6 nós em ouro, nó 06 preenchido, sem contador.
- QA: `_qa-v4.html` (força movimento; pin liberado a partir de 500 px de altura) e `_qa-mobile-v4.html` (simula 390 px: CSS/JS com media queries invertidas e vw→3,9 px; **não** é viewport real).

## Refino 4B (landing-v4b.html · landing-v4b.css · landing-v4b.js) — substitui a cena 5 e redefine 8 + seções 'Para quem é' e FAQ
| # | Cena | trigger | start → end | scrub | valores |
|---|------|---------|-------------|-------|---------|
| 5 | Camila em ação · 3 cenas | `#acao` (**pin** desktop) | `top top` → `+=270vh` | pin + `snap` `[0,⅓,⅔,1]` (directional, 0,2–0,55 s, `power2.inOut`) | tema = `round(progress×3)`. Cada tema é uma cena (`.lp-scene`: foto + tinta radial + luz da seção `.lp-acao__lights i`). Troca por tween de tempo (não scrub): cena nova opacity 0→1 + clip-path `inset(0 100% 0 0)`→`inset(0)` (esq→dir) + img scale 1,06→1, 0,6 s `power2.inOut`; cena antiga opacity →0 em .3–.6 s; luz da seção crossfade 0,6 s; brilho do botão ativo (`.lp-tab::after`, opacity, 600 ms, cor `--c` do tema). Pin dourado move (x,y) 0,6 s para o elemento real da foto. Depois de ⅔ (último tema) o snap vai a 1 e o pin solta. Clique em botão/pin/bolinha chama `pinST.scroll()` para o ponto do tema; setas ← → quando a seção ocupa o centro da tela. Mobile / altura < 720: sem pin, mesmas trocas. |
| 8 | Quem é | `#quem` / `.lp-sig` (once) | `top 70%` / `top 88%` | não | retrato opacity 0→1, y 40→0 (1,2 s `power3.out`); assinatura: 2 paths `stroke-dashoffset` 1→0 (1,8 s `power2.inOut`, stagger .9). |
| 8b | Para quem é | cada `.lp-yes li` / `.lp-no li` | check: `top 80%`→`top 52%`; risco: `top 88%` (once) | check `true` | check dourado `stroke-dashoffset` 1→0 pelo scroll; risco `.lp-strike` scaleX 0→1 (0,7 s, stagger .18). |
| 8c | FAQ | clique | — | — | `grid-template-rows` 0fr→1fr, 350 ms (exceção pedida à regra de propriedades; só CSS); "+" rotate 45°. Sem JS de animação — funciona também em reduced-motion (transição some). |

Pins (desktop 4:3 / mobile 4:5, em % do painel): Fluxo → aparelho de cartão 78,2/87,3 · 78,2/67,6; Precificação (autoridade-02) → tesoura direita 80,2/45,3 · 80,2/38,2; Padrão da equipe (autoridade-01) → logo Master Pet do colete 52,8/74,8 · 52,8/54,9. Fotos: object-position visita-01 `center 38%`, autoridade-02 `50% 27,5%`, autoridade-01 `50% 25%` (a conta do pin em desktop assume a foto 4:5 escalada pela largura).
Estático: cena 1 visível, demais com opacity 0; tudo legível; assinatura completa; checks e riscos completos.
QA: `_qa-v4b.html` (pin ≥ 500 px), `_qa-v4b-nopin.html` (sem pin), `_qa-mobile-v4b.html` (390 simulado).

## Estado final (v6) — vale sobre as seções anteriores

### Problema · camada sticky única (refino 5)
- Estrutura: `#problema` > `.lp-prob__bg` (`position:absolute`, altura da seção) > `.lp-prob__sticky` (`position:sticky; top:0; height:100svh`) com **uma só** foto (`camila-autoridade-01`) + cópia P&B + gradiente + vinheta. A foto fica na tela enquanto intro e sinais rolam; nada de fotos por sinal.
- Desktop (`(min-width:900px) and (min-height:720px)`): `.lp-prob__stage` pinado, `top top` → `+=220vh`, scrub .5, timeline de 10 u. (teleprompter: sinal ativo a 1, anterior a .28 e y −8 em t=1/3/5; linha dourada scaleY; marcas opacity+scale; fechamento em t=7,2). Foto scale 1→1,08 e cópia P&B opacity 0→.375 (única "saturação" animada, via opacity).
- Mobile / altura < 720: sem pin; cada sinal com scrub próprio (`top 85%` → `bottom 15%`), linha no wrap, fechamento com toggle. A foto sticky continua (CSS puro).
- Estático: todos os sinais a 100%, linha completa, fechamento visível.

### Camila em ação · 2 colunas (refino 6) — substitui a cena 5 de 4B
- **Desktop** (`(min-width:900px) and (min-height:720px)`): `#acao.is-pin` 100svh, padding `76px 0 64px`. Grade centralizada, `max-width:1120px`, sem padding lateral: **esquerda** = eyebrow, H2 `clamp(30px,3.2vw,46px)`, lista de 3 temas (índice dourado 01/02/03, trilho de 1 px + indicador dourado de 3 px que acompanha o tema ativo via `translateY(calc(var(--k) * 100%))`, 500 ms) e a **ficha como texto** (título do tema, exemplo, "[exemplo — substituir…]"; crossfade de opacity 0,3 s). **Direita** = foto 4/5 original, `border-radius:24px`, altura `--ph = min(calc(100svh − 76px − 64px), 900px)`, largura `--ph × .8`. Sem bolinhas de paginação.
- **Pin/avanço:** `ST.create({trigger:'#acao', start:'top top', end:'+=270vh', pin:true, snap:[0,⅓,⅔,1]})`; tema = `round(progress×3)`. Clique na lista, no pin e setas ← → (quando a seção ocupa o centro da tela) chamam `pinST.scroll()`.
- **Cenas por tema:** visita-01 + luz azul-bebê · autoridade-02 + luz ouro · autoridade-01 + luz navy/aço. Troca: opacity 0→1 + clip-path `inset(0 100% 0 0)`→`inset(0)` + img scale 1,06→1 (0,6 s `power2.inOut`); cena antiga some em .3–.6 s; luz da seção crossfade 0,6 s. Só opacity, transform, clip-path.
- **Pins:** filhos de `.lp-panel__photo`, posição por transform (px = % × caixa); como as 3 fotos são 4:5 e a caixa também, % da caixa = % da imagem: aparelho turquesa 77,3 / 68,5 · tesoura direita 79,6 / 37,3 · botão do colete abaixo da logo 40,4 / 61,8. Nenhum cobre rosto, texto ou logo. Pin só existe no desktop (`display:none` no resto).
- **Mobile (<900) ou altura <720:** sem pin; coluna única de no máx. 560 px, ordem: cabeçalho → lista → foto 4/5 → ficha (via `display:contents` + `order`). Estático/reduced-motion: tema 1 visível, layout idêntico, sem pin/snap.

### Formulário · 3 passos (refino 5)
- Um `<form>` com 3 `.lp-fs` (`hidden` nos passos inativos): 1 Contato (nome, WhatsApp) · 2 Seu negócio (cidade/UF, nome do negócio, tempo, equipe) · 3 Seu momento (desafio, mentoria/curso, mensagem opcional, consentimento LGPD).
- Barra de progresso: 3 círculos + linha (`scaleX` n/2) + legenda "Passo n de 3 · nome" (`aria-live`). "Continuar" valida só o passo atual (erros inline, foco no 1º inválido); "Voltar" sem validar; envio só no passo 3 (valida os 3, volta ao passo com erro).
- Transição de passo: saída 140 ms + entrada 350 ms (opacity + translateX ±, direção por `--dir`); reduced-motion = troca instantânea. Sucesso: `.is-done`, círculo scale .6→1, check stroke-dashoffset, texto stagger; foco vai ao bloco de sucesso (`role="status"`).
- Dados provisórios marcados com "opções provisórias"; sem envio real (só UI).

QA v6: `_qa-v6.html` (força movimento) dentro de `_qa-frame6.html` (iframe redimensionável; **o screenshot não captura o conteúdo do iframe** — medidas feitas por DOM).
