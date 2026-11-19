# AUDITORIA v4 — sem alterar mentoria.html/css/js

## 0. Correção do relato anterior
O resumo anterior estava errado em vários pontos:
- **Não existem** `README.md`, `COPY.md`, `MOTION.md` nem `preview/LEIA-ME.md`. Existem: `CONTEUDO.md` (**ainda é da v2**, desatualizado), `DADOS.md`, `ACESSIBILIDADE.md`, `tokens/NENHUM-TOKEN-NOVO.txt`.
- Os assets citados (`camila-atendimento`, `salao-fundo`, `pegadas.svg`, `nm-icons.svg`…) **não existem**. Os reais: `hero-camila`, `camila-retrato`, `camila-bancada`, `camila-logo`, `camila-112`, `camila-como`, `camila-bonus`, `camila-faq`, `amb-form`, `amb-trilha`, `pelagem` (.webp) e `_src/f103|f112|f119.jpg`. O "743 KB" não foi medido.
- Os PNGs de preview existem (96), mas com outro nome: `NN-LxA-zZZZ.png` (ex.: `03-1366x768-z110.png`), não `1366-768-100-03-trilha.png`.
- "Fita dourada, fundo de salão desfocado, ouro com reflexo": o fundo é `amb-trilha.webp`; reflexo/sombras não foram checados nesta auditoria.
- "Duas execuções mobile expiraram e foram refeitas" e "verificadas visualmente" para 390×844@125% e 1366×768@125%: **não há como comprovar**; não declaro como verificado.

## 1. Cenas em mentoria.html (ordem real)
| # | Seção | Existe | Observação |
|---|---|---|---|
| 01 | Abertura (`#abertura`) | sim | foto real, H1, CTA magnético, poeira canvas |
| 02 | Um dia na bancada 8h–18h (`#dia`) | sim | relógio + 4 momentos, pin |
| 03 | "Onde o seu dia trava?" (`#diag`, dentro de `#dia`) | sim | 5 opções, acende estação, pré-seleciona o formulário |
| 04 | Trilha (`#trilha`) | sim | 6 estações, fita SVG, pin, snap, nav 1–6 |
| 05 | Do improviso ao processo (`#processo`) | sim | 5 pares antes/depois |
| 06 | Camila (`#camila`) | sim | 3 fotos; frase com selo "provisório" |
| 07 | Para quem é (`#para-quem`) | sim | cartão único sim/não (selo provisório) |
| 08 | Como funciona a pré-inscrição (`#como`) | sim | 3 passos + "preciso pagar?" |
| 09 | Bônus (`#bonus`) | sim | cartão com selo "exemplo" |
| 10 | Depoimentos (`#depoimentos`) | sim | recolhido, 2 cartões "exemplo" |
| 11 | FAQ (`#faq`) | sim | `<details>` |
| 12 | Formulário 2 passos + confirmação (`#lista`) | sim | passo 1/2, erros, enviando, confirmação |

Faltando: **nenhuma cena**. A ordem é diferente da sua lista (Camila vem antes de "para quem" e "como funciona").
"Funciona" = **o HTML/JS existe e foi lido**; interação real **não** testada (ver §3). Os botões de estado da demo (`data-nm-demo`) foram acionados no harness para gerar os PNGs 13–14.

## 2. PNGs
Já existiam (96): 8 cenas × {1366×768, 1440×900, 1920×1080, 390×844} × {100, 110, 125%}.
Cenas **sem PNG** (geradas agora, 390×844 e 1440×900 a 100%, em `preview/`):
09 para-quem · 10 bonus · 11 depoimentos · 12 faq · 13 form-passo2 · 14 form-confirmacao (sufixo `-390x844-z100.png` / `-1440x900-z100.png`).
Observação: o PNG "08 form" antigo cobre só o passo 1.

## 3. Como foi verificado (franqueza)
- **Nenhum navegador real em larguras reais.** Todos os PNGs vêm de `preview/_vp.html`: um iframe com (L/zoom)×(A/zoom) px CSS reduzido por `transform: scale` (~0,63 a 0,64 no 1440, ~0,37 no 1920). Media queries, `vw`/`svh` e JS veem a largura simulada, mas **não há renderização nativa em 1920 ou 1366**, nem zoom do navegador real (110/125% = divisão da largura, não zoom de verdade; tipografia/subpixel/`devicePixelRatio` diferem).
- A imagem **não é um screenshot do iframe**: o harness clona o DOM copiando estilos computados, **sem pseudo-elementos** (`::before/::after`: fio da trilha, linhas do relógio, brilho do convite, máscaras). Também remove classes, o canvas da poeira sai em branco e `position: fixed` é convertido. Portanto os PNGs são **aproximações**; artefatos prováveis do método, a confirmar em navegador real:
  - FAQ: marcadores ▾/▸ e "+" soltos na linha de baixo (o CSS usa `list-style:none` e grid).
  - Formulário/390: "WhatsApp" sobreposto ao item seguinte na lista de benefícios (pode ser artefato ou bug real).
- Resolução baixa (~900×540 por quadro).
- O harness só enxerga as 8 cenas antigas; as 6 novas foram capturadas chamando `go()`/`snapshot()` direto.
- **NÃO verificado em navegador real:** trilha com rolagem real (pin, snap, fita), botão magnético, tilt do convite, `prefers-reduced-motion`, LCP, CLS, Lighthouse, zoom 110%/125% nativo, 1366 e 1920 nativos, Safari/Firefox, toque em celular real, leitor de tela, GSAP via CDN offline (3 scripts em jsdelivr: dependência externa).

## 4. Conformidade (por leitura de código)
- **Alturas fixas em px nas seções principais:** nenhuma em `height` de seção. Seções usam `100svh`/`min-height: 100svh` (hero; `.is-pinned` de dia e trilha) ou conteúdo. Exceções em px (componentes, não seções): header `var(--nm-hdr)`; barra de progresso 3px; botões `min-height` 44/52/60px; `nm-pick` clamp; `nm-seal` 24px; `nm-faq summary` min-height 72px; bolinhas/ícones (14–60px); `.nm-cam__big { min-height: 26rem }`; barra do formulário 4px; `.nm-tl__line top:58px`. `.nm-hero__photo img { height:108% }` e `nm-dia__face` (`height:36%` no mobile) são relativas, não px. Não li o CSS inteiro linha a linha (a busca truncou em ~L290); o trecho final (rodapé/demo) não foi inspecionado.
- **Pin só em (min-width:900px) e (min-height:720px):** `PINQ` em `mentoria.js` é exatamente essa; `LITEQ` é o complemento. Não conferi cada `mm.add` linha a linha; comportamento real não testado.
- **Um único efeito principal por cena:** só pelo código/comentários, **não** confirmado visualmente. Candidatos a violar: *Trilha* (fita + cartões em profundidade + deslocamento do ambiente + snap), *Abertura* (3 camadas de paralaxe + máscara de linhas + poeira), *Dia* (relógio + 4 momentos + troca para o diagnóstico).
- **Nenhum objeto/animal desenhado por código:** animais — nenhum. Porém a **fita dourada da trilha é gerada por código** (SVG via `createElementNS`), além da poeira em canvas e das faíscas de confirmação. Se "objeto" inclui a fita, está em desacordo; decisão sua (foi o movimento aprovado na v2).
- **Fatos novos sobre a Camila:** o HTML afirma só: sócia do Center Vet, especialista em banho e tosa, referência em atendimento veterinário em Lins/SP (consta em CONTEUDO.md, "FATO") e "Camila Becari · Lins/SP" no rodapé. A frase "Ao seu lado, no ritmo do seu negócio" está marcada "frase provisória". Os `alt` das fotos descrevem aparência (terno branco, camiseta bordada), sem fatos biográficos. Pendência: **CONTEUDO.md está desatualizado** (H1 diferente, placeholders "foto a receber", sem as cenas novas): atualizar antes de usar como fonte de verdade.

## 5. Pronto / falta / não verificado
- **Pronto:** 12 seções no HTML; 96 PNGs antigos + 12 novos; pin condicionado; selos de provisório/exemplo no lugar.
- **Falta:** CONTEUDO.md atualizado; README/COPY/MOTION (citados e inexistentes); decisão sobre a fita; confirmação da Camila (frase, credenciais, fotos).
- **Não verificado:** tudo da lista do §3.
