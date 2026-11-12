# Acessibilidade — Depoimentos

## Roles / aria
- `<section id="depoimentos" aria-labelledby="dep-h2">` com H2 único (`#dep-h2`).
- Cada depoimento é `<figure><blockquote><p>…</p></blockquote><figcaption>…</figcaption></figure>`.
- Faixa: `<div role="region" aria-roledescription="carrossel" aria-label="Mais depoimentos (exemplos)">`; lista `<ul tabindex="0" aria-label="Depoimentos em faixa rolável. Use as setas do teclado para navegar.">`; cada `<li role="group" aria-roledescription="slide" aria-label="n de 6">`. Atualizar "n de N" ao mudar o número de cartões.
- Setas: `<button type="button" aria-label="Depoimento anterior|Próximo depoimento" aria-disabled>` (aria-disabled em vez de disabled, para não perder o foco no fim da faixa).
- Avatares, monograma, aspas e placeholders de foto/vídeo: `aria-hidden="true"` (decorativos). Com foto real: `alt=""` (o nome já está na legenda).
- Placeholder de vídeo: `aria-hidden`; a legenda em texto explica que só toca com clique, sem autoplay, som desligado.
- Selo "exemplo": texto real (lido por leitores), não aria-hidden.

## Ordem de Tab
Link CTA do cabeçalho (global) → faixa de cartões (um único tab stop) → seta anterior → seta próxima (só <900 px com JS) → CTA "Quero conversar com a Camila" da seção. No desktop a faixa é uma grade estática; o tab stop da lista é inofensivo, mas pode ser removido no portar se preferir (tabindex só <900).

## Teclado e toque
- Foco na faixa + ←/→: rola um cartão (somente <900 px). Setas Home/End não implementadas (decisão em aberto).
- Setas na tela: mesmo passo. Toque: rolagem nativa com snap. Mouse: arrastar. Sem rotação automática e sem pausa necessária.
- reduced-motion: rolagem sem suavização; sem GSAP.

## Foco
Anel 3 px `var(--focus-ring)` na faixa e nas setas; botões do CTA usam o foco existente do mp-btn.

## Alvos de toque
Setas 48×48 px; CTA mp-btn (≥44 px de altura, existente); faixa inteira é alvo de arrasto. Botão play do vídeo é só placeholder (72/60 px) e não é interativo nesta versão.

## Contraste (calculado, WCAG; valores de tokens/colors.css, Paleta B)
| Par | Hex (texto / fundo) | Razão | Mínimo | Resultado |
|---|---|---|---|---|
| Citação/nome — navy-900 sobre beige-50 | #0a1633 / #f9f5ec | 14.46:1 | 4.5:1 | OK |
| Citação — navy-900 sobre beige-200 (pior fundo da gradação) | #0a1633 / #e6dbc6 | 11.91:1 | 4.5:1 | OK |
| Cidade/porte — ink-muted sobre beige-50 | #46536f / #f9f5ec | 5.46:1 | 4.5:1 | OK |
| Cidade/porte — ink-muted sobre beige-200 | #46536f / #e6dbc6 | 4.50:1 | 4.5:1 | FALHA |
| Selo "exemplo" sobre claro — blue-600 sobre beige-50 (tinta do selo ≤8%, desprezada) | #27557f / #f9f5ec | 5.59:1 | 4.5:1 | OK |
| Destaque: texto beige-50 sobre navy-800 | #f9f5ec / #10224f | 11.64:1 | 4.5:1 | OK |
| Destaque: texto secundário beige-200 sobre navy-800 | #e6dbc6 / #10224f | 9.59:1 | 4.5:1 | OK |
| Destaque: texto beige-200 sobre navy-900 (pior) | #e6dbc6 / #0a1633 | 11.91:1 | 4.5:1 | OK |
| Selo no navy — blue-200 sobre navy-800 | #c6ddf2 / #10224f | 9.44:1 | 4.5:1 | OK |
| Iniciais/monograma — gold-400 sobre navy-800 | #cdaa55 / #10224f | 6.37:1 | 4.5:1 | OK |
| Iniciais nos cartões — gold-300 sobre navy-800 | #dcc58a / #10224f | 8.02:1 | 4.5:1 | OK |
| Botão play — navy-900 sobre gold-400 | #0a1633 / #cdaa55 | 7.91:1 | 4.5:1 | OK |
| Aspas decorativas — gold-700 sobre beige-50 (decorativo, não texto) | #8a6a1e / #f9f5ec | 3.73:1 | 3:1 | OK |
| Borda das setas — navy-800 sobre beige-50 (UI) | #10224f / #f9f5ec | 11.64:1 | 3:1 | OK |
| Anel de foco — navy-700 sobre beige-50 (UI) | #1b3470 / #f9f5ec | 8.59:1 | 3:1 | OK |
| Borda do cartão — blue-300 sobre beige-50 (decorativa, informação não depende dela) | #afcfea / #f9f5ec | 1.40:1 | — | n/a |
| Borda ouro do destaque — gold-400 sobre navy-800 (UI) | #cdaa55 / #10224f | 6.37:1 | 3:1 | OK |

Observações: cartões têm fundo beige-50 a 90% sobre a atmosfera, então o fundo efetivo é ≈ beige-50. Textos secundários que ficam direto sobre a atmosfera (dica da faixa, legenda do vídeo, linha de transparência) usam text-1 (navy-900), não ink-muted, porque na parte inferior da gradação (beige-200) o ink-muted dá exatamente 4,50:1, sem folga. O texto ouro só aparece sobre navy.
