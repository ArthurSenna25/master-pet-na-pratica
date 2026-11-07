# DESIGN — Master Pet na Prática (Direção 1 · Paleta B)
Fonte da verdade: `docs/_projeto/handoff/` (landing-v6, tokens/, MOTION.md). Valores exatos em `app/tokens.css`.

## Conceito
Casa de marca, não curso: navy profundo + bege quente, ouro antigo como ação. Fotografia real da Camila como
protagonista; atmosfera (luz radial, grão 4,5%, vinheta), nunca fundo chapado.
Signature: "Camila" em ouro no H1, com brilho que varre uma vez.

## Paleta B
| Papel | Token | Hex |
|---|---|---|
| Tinta / texto principal | navy-900 | #0a1633 |
| Superfície de marca | navy-800 | #10224f |
| Fundo profundo | navy-950 | #060f26 |
| Página | beige-100 | #f4ede0 |
| Superfície elevada / texto sobre navy | beige-50 | #f9f5ec |
| Texto 2 sobre navy | beige-200 | #e6dbc6 |
| Apoio (seções azuis) | blue-100 / blue-200 | #d6e7f6 / #c6ddf2 |
| Link sobre claro | blue-600 | #27557f |
| Texto secundário | ink-muted | #46536f |
| Ação: preenchimento do botão | gold-action | #c9a24a (hover #d9b96a · ativo #b58e36 · texto navy-900) |
| Ouro como texto (só sobre navy) | gold-400 | #cdaa55 |
| Estados | danger / success | #a3322f / #1f6b4a |
Escala completa (navy 600–950, gold 300–700, beige 50–400, blue 50–600) em tokens.css. Paleta A removida.

## Regras de cor
- Ouro só em: (1) preenchimento do botão primário; (2) texto sobre navy ou foto com scrim navy (gold-400);
  (3) grafismo não textual e redundante (linhas, nós, checks, barra de progresso). Nunca texto ouro sobre claro.
- Texto principal navy-900, nunca preto; neutros azulados, nunca cinza puro.
- ink-faint #7a869f só em desabilitado/decorativo. Contraste ≥ 4,5:1 texto, ≥ 3:1 UI (borda de input #6a7a9b).
- Foco: anel navy-700 sobre claro, gold-400 sobre navy, halo azul-bebê rgba(175,207,234,.6).

## Tipografia (next/font · 2 famílias · 3 pesos)
Playfair Display 600 (títulos) · Source Sans 3 400/600 (corpo). Variáveis `--font-display` / `--font-body`.
Escala px: 72 · 56 · 44 · 34 · 26 · 20 | corpo 20 / 17 / 14 | eyebrow 13, caixa alta, +0,16em.
Linha: display 1,04 · títulos 1,15 · corpo 1,6. Tracking display −0,01em. `text-wrap`: balance (títulos), pretty (texto).

## Espaço · raio · sombra
Grade 8 pt (+4): 4 8 16 24 32 40 48 64 96 128. Container 1200 px. Alvo de toque ≥ 44 px.
Raio: 4 · 8 · 12 · 20 · arco 200/200/20/20 · pílula 999. Sombras sempre tingidas de navy: xs · sm · md · lg · inset · inset-press.

## Movimento (o MOTION.md manda; aqui só o resumo)
- GSAP + ScrollTrigger só na LP; admin sem animação. Sem WebGL, vídeo ou lib extra.
- Anima só transform, opacity, clip-path (exceções: stroke-dashoffset em SVG; FAQ via grid-template-rows em CSS).
- UI: cubic-bezier(.2,.7,.2,1), 120/200/360 ms. Reveal: 700 ms cubic-bezier(.22,1,.36,1), y 24, stagger 90 ms.
- Pin só em `(min-width:900px) and (min-height:720px)`. Hover/cursor só em `(hover:hover) and (pointer:fine)`.
- Máx. 1 loop por seção. Véu do hero: @keyframes em CSS.
- `prefers-reduced-motion`: nenhuma cena; página estática e legível. Sem JS: nada escondido por CSS.

## Evitar
Paleta A · ouro como texto sobre claro · preto/cinza puro · fundo chapado · animar filter/cor ·
conteúdo ou CTA escondido sem JS · redesenhar o protótipo no código · fontes ou scripts externos em runtime.
