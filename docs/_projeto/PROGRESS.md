# PROGRESS — Master Pet na Prática (≤ 40 linhas; o Claude lê só isto ao retomar)

**Nível:** N2 enxuto (sobe para N3 se: área de aluno, pagamento ou mais de um usuário com permissões)
**Fase atual:** F3-motion (CP1 + CP2) concluída · **Atualizado:** 2026-11-07 · **Ordem:** F1 → F2 → F3-motion ✔ → F4-banco → F5-painel → F6 (QA/legais/deploy)

## Feito
- F1: scaffold Next 16.4.5, tokens Paleta B, next/font, 7 webp (528 KB), headers, DESIGN/PLANO.
- F2: LP estática em Server Components (`app/_components/`, 1 arquivo por seção). CSS do handoff intacto em `app/landing/` (+ `static-overrides.css`). F2b: páginas legais em rascunho (noindex); versão única `app/_lib/legal-version.ts`.
- F3 (gsap 3.15.1 + @gsap/react; SplitText/ScrollTrigger grátis): `LandingFx` (client, `return null`) cria as cenas de `app/_fx/` NA ORDEM DA PÁGINA (reveal · hero · progresso · problema · diferença · como · acao · destrava · quem); depois um único `ScrollTrigger.sort()`; `refresh()` no load e em `fonts.ready`; cleanup por `mm.revert()`.
  `util` (onceIn, PIN/NOPIN/pinEnd) · `hero` · `chrome` · `secoes` · `problema` (3/3m) · `como` (4/4m) · `acao` (pin+snap, troca de cena). Pin só em `(min-width:900px) and (min-height:720px)`; mobile/altura baixa = 3m/4m sem pin.
  Estado inicial só por `gsap.set` pós-hidratação (sem JS e reduced-motion = tudo visível; sticky CTA funciona nos dois). Reveal só esconde o que está abaixo da dobra.
- CamilaEmAcao é client: estado `tema`, abas (clique), setas ← → (listener no componente, cleanup no unmount; só com a seção no centro da tela), tema do pin chega por CustomEvent (`acao:tema`) na seção. Pin dourado: `<span aria-hidden>` decorativo, `container-type:size` na foto + `translate(cqw,cqh)` (coords do MOTION.md), `display:none` fora do desktop. Reduced-motion: troca instantânea.
- Correções de CLS (h1 SplitText): `.lp-h1{justify-self:stretch}`, `reduceWhiteSpace:false`, margens da `.ln__i-mask`. CLS 0 em 390 e 1440 (`qa/cls-src.mjs` lista as fontes de shift).
- Verificação (`node qa/fx-check.mjs`, servidor `next start -p 3100`): chromium+webkit 390x844 e 1440x800, chromium 1366x657, com/sem reducedMotion: TUDO OK. 1440x800 = 3 pin-spacers (#problema, #como, #acao) e cada um cabe em 100svh (1º sinal abaixo do header); 1366x657 e mobile sem pin; #problema sem oculto no 1º paint; abas por clique e seta; resize 1440→390 sem órfãos; 0 erros de console. Build/lint/tsc ok · googleapis 0 · LCP mobile 0,7–2,2 s (ruído) · CLS 0.

## static-overrides.css (restante)
- scroll-padding/`[id]` · `#problema` margem negativa · `.lp-cover` !important (next/image fill) · véu do hero em @keyframes (CSS por decisão) · header sólido + `.is-top` · `.ln__i-mask` · `.lp-panes{gap:20px}` [F4] · links do consentimento · `.lp-row`/`#lp-previa`.
- F3: `.lp-prob__stage.is-pin` compactado (1º sinal ia sob o header em 1440x800) · pin dourado (container + transform) · sticky sem transição em reduced-motion. Removidas: estilos do `<details>` do FAQ e scroll-timeline do header.

## Desvios do protótipo (registrados)
- FAQ: chips `provisório` em "Quantos encontros?" e "Quanto custa?". Formulário: sem barra de passos; envio `disabled` + chip "prévia visual" (F4). Cena 9 (formulário) é F4.
- Fora do pedido: tilt do protótipo. Hook Impeccable acusa `gradient-text` em `.lp-gold` (landing-v6.css:20): protótipo aprovado, mantido.
- Camila em ação: texto da ficha é exemplo (`[exemplo — substituir…]`), igual nos 3 temas.

## Pendências / bloqueios
- Legais [PENDENTE]: controladora (razão social/CNPJ/endereço) · ME/EPP · operadores · transferência internacional (art. 33) · retenção · e-mail do titular · encarregado · TERMOS: responsável, titular da marca/imagens, responsabilidade, foro, contato. Revisão jurídica antes de qualquer lead real (consentimento caixa única × duas, cookie do painel, IP HMAC × puro).
- Camila: preço · formato e nº de encontros · FAQ real · vetor do wordmark · regiões · pré-requisito da Mentoria online · texto real de "Camila em ação".
- Técnico: `npm audit` (F6) · hero-bg ~2400 px se ficar mole em 1920 · matriz completa de QA só na F6.

## Backlog: (vazio)
## Consumo — F1 ≈ US$ 6–7. F2: ~63% da janela. Commit 1 do CP2: 76% → 82%. Commits 2 e 3 do CP2: início 0% (após reset); valor atual informado como "X%" (não medido) → preencher.
