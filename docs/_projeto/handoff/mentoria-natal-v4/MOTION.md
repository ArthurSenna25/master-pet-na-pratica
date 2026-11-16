# MOTION (somente o que mudou na v4)

## Depoimentos — efeito principal: faixa navegável
scroll-snap horizontal, setas, arrastar (mouse) e ←/→. Sem rotação automática. Profundidade: duas camadas atrás do destaque e elevação dos cartões no hover (transform/sombra). Reduced-motion: sem hover/escala; a faixa continua rolável.

## FAQ — efeito principal: pergunta ativa acompanha a rolagem
≥900 px e sem reduced-motion: painel de resposta fixo (sticky) à direita; a pergunta ativa vem da posição da lista na janela (rAF, listener passivo, sem pin e sem alterar a rolagem). Linha dourada à esquerda (scaleY) mostra o progresso; resposta abre com máscara (clip-path inset, 0,7 s). Clique/toque fixa a pergunta. <900 px: acordeão (grid 0fr→1fr + clip-path). Reduced-motion / sem JS: lista aberta, sem transições.

## FAQ v3
Painel navy com a altura da lista; a resposta abre alinhada à linha da pergunta ativa (margin-top medida por JS) e um losango dourado na borda do painel aponta a pergunta (transform). Numeral fantasma e contador "0n / 06" acompanham. Fundo: luz dourada + textura de pelagem a 7%. Mesmos modos: painel ≥900 px, acordeão, lista aberta (reduced-motion/sem JS).

## CTA
Botão: padrão, hover (sobe 2 px, brilho que cruza, seta avança), foco (anel 3 px), pressionado, carregando (aria-busy + pontos). CTA flutuante só em <900 px: entra depois da abertura, sai quando o formulário aparece (IntersectionObserver). Reduced-motion: sem brilho/deslocamento.
