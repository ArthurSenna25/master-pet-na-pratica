# MOTION — Depoimentos (nível 2)

Biblioteca: GSAP + ScrollTrigger (já na landing). Só transform, opacity e clip-path. Estado inicial oculto é aplicado por JS (fromTo), nunca por CSS. A seção fica abaixo da dobra (nunca visível no carregamento). Loops: 0 (limite: 1). **Pin: nenhum** — a seção é de leitura; pin só caberia em (min-width:900px) e (min-height:720px) e não agrega.

## Cenas
| Cena | Gatilho | Duração / easing | Propriedades | Desktop ≥900 | Mobile <900 | Reduced-motion | Sem JS |
|---|---|---|---|---|---|---|---|
| Cabeçalho (eyebrow + H2) | reveal global da landing (.mp-reveal → .is-in, IntersectionObserver) | igual às outras seções | opacity, transform | sim | sim | estático | visível |
| A1 Destaque em cascata | start "top 78%" da figura, 1x | .8s, power3.out, stagger .1 | opacity, y 28→0 | sim | sim | estático | visível |
| A2 Foto abre | scrub, start "top 85%", end "top 35%" | linear | clip-path inset(14%)→inset(0) | sim | sim | estático | visível |
| A3 Parallax foto + monograma | scrub, "top bottom" → "bottom top" | linear | yPercent ±5 (foto), y ±30 (monograma) | sim | sim | estático | visível |
| B1 Cartões em cascata | start "top 85%" da grade, 1x | .7s, power3.out, stagger .09; clearProps ao fim | opacity, y 36→0 | sim (grade 3×2) | — | estático | visível |
| B2 Faixa entra | start "top 90%", 1x | .7s, power3.out | opacity, y 24→0 | — | sim | estático | visível |
| C Inclinação 3D | pointermove, só (hover:hover) e (pointer:fine) | quickTo .45s, power3.out | rotationX/Y ±6° cartões, ±2,5° destaque (transform) | sim, só com mouse | desligada | desligada; hover só troca borda/sombra | sem inclinação |

## Faixa de cartões (sem GSAP)
Rolagem nativa com scroll-snap; setas 48 px (scrollBy; sem suavização em reduced-motion); teclado ←/→ com foco na faixa; arrastar com mouse. Nunca rotação automática. Sem JS: a faixa rola por toque/arrasto nativo e as setas ficam ocultas (classe mp-js).

## Ordem de criação na página
1. Cenas da landing existentes na ordem do documento (hero, Problema, Como funciona, Camila em ação).
2. **initDepoimentos()** (esta seção).
3. Cenas de "Quem é", Preço/FAQ, formulário.
Motivo: ScrollTrigger calcula posições na ordem de criação; esta seção está sem pin, então não desloca as seguintes, mas criar na ordem do documento evita refresh fora de ordem. Se alguma cena pinada vier depois (ex. "Quem é"), usar pinSpacing normal e chamar ScrollTrigger.refresh() após o load (já feito pelos hooks da landing). Em Next.js: chamar em useEffect (client component) e retornar a função de limpeza (ctx.revert).
