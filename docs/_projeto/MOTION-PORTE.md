# MOTION-PORTE — cenas do `mentoria.js` (v4) na ordem do DOM de `/mentoria`

Fonte de verdade: `docs/_projeto/handoff/mentoria-natal-v4/mentoria.js` (`initMotion`). O `MOTION.md` da v4 vale só para depoimentos, FAQ e CTA.
Regras gerais do protótipo: só `transform`/`opacity`/`clip-path` (+ `stroke-dashoffset`); estado oculto só para o que está **abaixo da dobra** (`below()` = top > 92% da janela; única exceção: linhas do H1, com failsafe de 3 s); sem JS tudo legível; reduced-motion = nenhuma cena (interações continuam). Pin só em `(min-width:900px) and (min-height:720px)` (PIN) — abaixo disso, versão lite (NOPIN).
Implementação no Next: `app/(mentoria)/_fx/MentoriaFx.tsx` cria as cenas **nesta ordem**, com **um** `ScrollTrigger.sort()` e `refresh()` no `load` e em `document.fonts.ready`. Cada cena = 1 módulo em `_fx/`, 1 commit, aprovação antes da próxima.

| # DOM | Seção (`_secoes/`) | Cena (rótulo do JS) | Gatilho | Pin? | Estado sem JS / reduced-motion | Status |
|---|---|---|---|---|---|---|
| 0 | global | Barra de progresso dourada (`initProgress`), CTA magnético (`[data-nm-magnet]`, só ponteiro fino, ≤12% do raio), CTA flutuante (`initFab`) | scroll do documento / `pointermove` / IO hero+form | não | barra e magnet inexistentes; FAB já existe no CSS | pendente |
| 1 | Abertura | **Cena 1 · Abertura**: paralaxe 3 camadas (fundo, retrato, poeira canvas) + H1 por máscara de linha (SplitText) | `.nm-hero` `top top`→`bottom top`, scrub `true`; poeira: `onToggle` | não | H1 e retrato visíveis; canvas vazio. **H1 oculto no load** (única exceção) com failsafe 3 s | pendente |
| 2 | Dia | **Cena 2 · Um dia na bancada**: relógio 08→18 h, uma dor por hora, depois o diagnóstico | `.nm-dia` `top top`→`+=90%`, scrub .6 | **PIN** (lite: `rise('.nm-beat')`) | todas as dores e o diagnóstico visíveis em sequência; relógio "08" | pendente |
| 3 | Trilha | **Cena 3 · Trilha**: fita SVG em perspectiva + cartões em profundidade + ambiente; nav 1–6 | `.nm-trilha` `top top`→`+=100%`, scrub .7, snap 1/5 | **PIN** (lite: cartões sobem + fio `scaleY`) | grade de 6 cartões, sem fita nem nav | **feita (c6, aguarda aprovação)** |
| 4 | Processo | **Cena 4 · Do improviso ao processo**: 6 cartões soltos/inclinados se alinham na grade | `.nm-pcs` `top 92%`→`top 38%`, scrub .8 | não | grade alinhada e visível (offsets só aplicados se abaixo da dobra) | pendente |
| 5 | Camila | **Cena 5 · A Camila**: clip-path nas fotos (`[data-nm-ph]`) + zoom 1,05→1 ancorado no rosto; `rise('.nm-fichas li')` | foto `top 88%` (once); zoom `top bottom`→`bottom top` scrub | não | fotos e fichas visíveis | pendente |
| 6 | ParaQuem | `rise('.nm-who__c')` | grupo `top 85%` (once) | não | visível | pendente |
| 7 | Como | **Cena 7 · Como funciona**: linha dourada liga os passos (`.nm-tl__line` `scaleY`) + `rise('.nm-tl__s')`, `rise('.nm-answer')` | `.nm-tl` `top 75%`→`bottom 60%`, scrub .6 | não | linhas completas, passos visíveis | pendente |
| 8 | Bonus | **Cena 8 · Convite do bônus**: entrada 3D (`rotationX` 14→0) + tilt/brilho que segue o cursor (só ponteiro fino) | `top 85%` (once); `pointermove` | não | convite visível, sem tilt | pendente |
| 9 | Depoimentos | faixa navegável (setas, arrastar, ←/→, scroll-snap; **MOTION.md v4**) | interação | não | faixa rolável (já funciona sem JS) | pendente (interação, não GSAP) |
| 10 | Faq | pergunta ativa acompanha a rolagem (≥900 px, rAF passivo, sem pin) / acordeão (**MOTION.md v4**) | scroll + clique | não | lista aberta | pendente (interação, não GSAP) |
| 11 | Lista | `rise('.nm-end__copy li')`; linhas do `#h-lista`; formulário (já React) | `top 85%` / `88%` (once) | não | visível | pendente |

Transversais ainda fora das cenas: SplitText das linhas de `#h-trilha` e `#h-lista` (`lines()`), adiado por decisão ("SplitText do título fica para depois").
