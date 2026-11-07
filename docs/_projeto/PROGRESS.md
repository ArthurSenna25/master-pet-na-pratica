# PROGRESS — Master Pet na Prática (≤ 40 linhas; o Claude lê só isto ao retomar)

**Nível:** N2 enxuto (sobe para N3 se: área de aluno, pagamento ou mais de um usuário com permissões)
**Fase atual:** F3-motion CP1 + correções pré-CP2 concluídos · **Atualizado:** 2026-11-07 · **Ordem:** F1 → F2 → F3-motion (CP2 pendente) → F4-banco → F5-painel → F6 (QA/legais/deploy)

## Feito
- F1: scaffold Next 16.4.5, tokens Paleta B, next/font, 7 webp (528 KB), headers, DESIGN/PLANO.
- F2: LP estática em Server Components (`app/_components/`, 1 arquivo por seção). CSS do handoff intacto em `app/landing/` (+ `static-overrides.css`).
- F2b: /politica-de-privacidade e /termos-de-uso (rascunho, noindex, sem JS). Versão única em `app/_lib/legal-version.ts` (`LEGAL_TEXT_VERSION`), a F4 grava o mesmo valor em `consent_events.texto_versao`.
- F3 CP1 (gsap 3.15.1 + @gsap/react 2.1.2; SplitText/ScrollTrigger do pacote grátis): `LandingFx` (único client de cenas, `return null`) em `app/_components/`; cenas em `app/_fx/`
  (`util` onceIn · `hero` 1/1b/2 · `chrome` header/progresso/magnético/sticky · `secoes` reveal/6/7/8/8b). `matchMedia`: tudo sob `no-preference`; hover/cursor sob `(hover:hover) and (pointer:fine)`.
  Reveal só esconde `.mp-reveal` abaixo da dobra, após hidratar (sem JS e reduced-motion: tudo visível). Header: `.is-solid`/`.is-top` por JS. StickyCta: IO + `inert`. FaqItem: client, botão `aria-expanded`, accordion CSS 0fr (8c).
  `<noscript><style>` em layout.tsx abre as respostas do FAQ sem JS. Barra de progresso (`.lp-progress`) no SiteHeader.
- Verificação CP1 (`node qa/fx-check.mjs`, servidor em :3100): chromium+webkit 390x844 e 1440x800, chromium 1366x657, com/sem reducedMotion: sem overflow, sem pin-spacer, reduced sem oculto,
  FAQ Enter/Espaço/Tab, sticky aparece/some (+inert), header, progresso, 0 erros de console, resize 1440→390 sem órfãos. Build/lint/tsc ok · googleapis 0 · public 528 KB.
- Vitals mobile (`qa/vitals.mjs`, Pixel 7, CPU 4x): após as correções LCP 0,64–1,6 s (ruído de máquina), **CLS 0** em 390 e 1440 (`qa/cls-src.mjs` lista as fontes de shift).
- Correção CLS (commit pré-CP2): causa = SplitText no h1 (confirmado: CLS 0 sem ele). Três efeitos: (1) `.lp-h1{justify-self:stretch}` (o grid `justify-items:start` encolhia o h1 ao split); (2) `reduceWhiteSpace:false` no SplitText (senão o nbsp de "Banho & Tosa" virava espaço e quebrava a linha: o 390 passa a ter 6 linhas, antes 5 — quebra agora correta); (3) margens negativas de `.ln__i-mask` colapsavam (soma errada +.06em/junta): `margin:0 0 -.2em` + first/last-child.
- Sticky CTA agora também em reduced-motion (fora do `matchMedia`, CSS sem transição). `fx-check` cobre sticky nos dois modos: TUDO OK.

## static-overrides.css (restante)
- scroll-padding/`[id]` margin; `#problema` margem negativa · `.lp-cover` !important (next/image fill) · véu do hero em @keyframes (MANTIDO em CSS por decisão) ·
  header sólido por padrão + `.is-top` (degradê) · `.ln__i-mask` (respiro da máscara do SplitText) · `.lp-panes{gap:20px}` [F4] · links do consentimento · `.lp-row`/`#lp-previa`.
- Removidas (F3): estilos de `<details>` do FAQ e scroll-timeline do header.

## Pendente (CP2, próxima sessão, após reset da janela)
- h) Cenas 3/3m (Problema, teleprompter, pin só ≥900x720), 4/4m (Como funciona, 6 nós, contador), 5 (Camila em ação: pin+snap). i) CamilaEmAcao client (tema, abas, setas, pin dourado).
  Atenção: criar na ordem da página; `ScrollTrigger.sort()`/refreshPriority por causa dos pin-spacers; pins só em `(min-width:900px) and (min-height:720px)`; cenas 9 (form) é F4.
- Não feito no CP1: cena 9 (formulário, F4), tilt do protótipo (fora do pedido).

## Desvios do protótipo (registrados)
- Ainda omitidos: pin das 3 fotos de "Camila em ação" (ficha mostra só o tema 01) até o CP2.
- FAQ: chips `provisório` em "Quantos encontros?" e "Quanto custa?". Formulário: sem barra de passos; botão de envio `disabled` + chip "prévia visual" (F4).
- Hook Impeccable acusa `gradient-text` em `.lp-gold` (landing-v6.css:20): protótipo aprovado, mantido.

## Pendências / bloqueios
- Legais [PENDENTE]: controladora (razão social/CNPJ/endereço) · ME/EPP · operadores · transferência internacional (art. 33) · retenção · e-mail do titular · encarregado · TERMOS: responsável, titular da marca/imagens, limitação de responsabilidade, foro, contato.
- Jurídico F4: consentimento caixa única × duas · cookie de sessão do painel na política · verbos "coletamos" · IP HMAC × puro. Revisão antes de qualquer lead real.
- Camila: preço · formato e nº de encontros · FAQ real · vetor do wordmark · regiões · pré-requisito da Mentoria online · texto real de "Camila em ação".
- Técnico: `npm audit` (triar na F6) · hero-bg ~2400 px se ficar mole em 1920 · matriz completa de QA só na F6.

## Backlog: (vazio)
## Consumo — F1 ≈ US$ 6–7. F2: ~63% da janela. F3 CP1: janela do Pro não medida (sem acesso a /usage); início e fim: informar pelo usuário. CP2 iniciado com janela em 76%
