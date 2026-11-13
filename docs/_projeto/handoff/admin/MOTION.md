# MOTION — Painel

Princípio: sutil e funcional. Só transform e opacity. Nada em loop. Sem 3D, parallax ou pin. Sem GSAP: tudo é CSS (a única lib de movimento do projeto fica na landing). Gráficos são HTML/CSS/SVG renderizados no servidor; sem JS para desenhá-los.

| Elemento | Quando | Duração / easing | Propriedades |
|---|---|---|---|
| Cartões e blocos (`.ad-in`) | ao carregar a tela, 1x, cascata de 60 ms (`--i`) | 360 ms (`--dur-3`), `--ease` | opacity 0→1, translateY 12→0 |
| Colunas do gráfico semanal | ao carregar, 1x, atraso 300 ms | 600 ms, `--motion-reveal-ease` | transform scaleY 0→1 (origem embaixo) |
| Barras de funil e de perfil | ao carregar, 1x, atraso 250 ms | 700 ms, `--motion-reveal-ease` | transform scaleX 0→var(--p) (origem à esquerda) |
| Modal do lead | ao abrir | fundo 200 ms fade; caixa 360 ms (opacity + translateY 12→0) | opacity, transform |
| Cartão "Aguardando contato" | hover | 200 ms | transform translateY(-2px) |
| Botões | hover/ativo | 200 ms (cor), 120 ms (press translateY 1px) | background/border (cor), transform |
| Menus (Exportar, Menu) | abrem sem animação | — | — |

## Reduced-motion
`@media (prefers-reduced-motion: reduce)` zera animation e transition em todo o painel: tudo aparece já no estado final (colunas e barras com tamanho final).

## Sem JS
CSS puro: animações rodam normalmente; nada fica escondido esperando script. Menus são `<details>`.

## Notas de implementação
- `animation-fill-mode: backwards`: o estado inicial só vale durante o atraso; se a animação não rodar, o conteúdo já está visível.
- Larguras/alturas das barras são dados (`--p`, `--h`) calculados no servidor.
- Tela de carregamento usa blocos estáticos (sem shimmer em loop).
