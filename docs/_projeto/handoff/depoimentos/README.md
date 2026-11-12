# Handoff — seção "Depoimentos"

Entra entre "Camila em ação" e "Quem é". Não altera a landing-v6.

## Arquivos
- `depoimentos.html` — protótipo da seção + vizinhas mínimas (marcadas `<!-- VIZINHA: não portar -->`). Referencia `../styles.css`, `../landing/landing-v6.css`.
- `depoimentos.css` — só CSS novo; bloco OVERRIDES no topo.
- `depoimentos.js` — `initDepoimentos(sec, gsap, ScrollTrigger)` → função de limpeza.
- `MOTION.md`, `CONTEUDO.md`, `ACESSIBILIDADE.md`.
- `tokens/NENHUM-TOKEN-NOVO.txt`.
- `assets/README.md` — sem imagens nesta versão.
- `preview/` — screenshots.

## Novo x reaproveitado
Novo: classes `lp-dep, lp-dep__h2, lp-dep__cta, lp-fe*, lp-tc*, lp-tcs*, lp-av, lp-who, lp-q-glyph, lp-vid*, lp-tr`; `initDepoimentos`.
Reaproveitado da v6: tokens de cor/raio/sombra/movimento/atmosfera, `lp-sec`, `lp-sec--light`, `lp-wrap`, `lp-stack`, `lp-h2`, `lp-prov` (selo), `mp-eyebrow`, `mp-reveal` (+ IntersectionObserver global), `mp-btn mp-btn--primary`, `mp-fx--grain`, classe `mp-js` no <html>.

## Dependências
Só GSAP 3.12 e ScrollTrigger (já na landing). Sem CDN neste JS.

## Decisões em aberto
- Pin: descartado (não agrega); reavaliar só se o destaque virar vídeo.
- 7+ cartões: faixa também no desktop?
- Tab stop da lista no desktop (hoje sempre focável).
- Home/End na faixa.
- O reveal do cabeçalho depende do observer global da landing (o protótipo traz um shim marcado como vizinha).
- Atributos `data-screen-label` das seções seguintes na v6 estão com numeração antiga.
- Gramática dos textos-modelo ("em a rotina") é só de exemplo.
- Screenshots: ver nota em preview/ (tamanho de captura limitado).
