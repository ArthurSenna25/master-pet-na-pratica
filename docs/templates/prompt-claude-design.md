# Prompts para o Claude Design (`claude.ai/design`)

Regras: crie o **design system antes**; peça **3 direções**; refine **uma mudança por mensagem**, em até 3 rodadas; use **copy real** (nunca lorem ipsum). Um prompt bom tem 4 elementos: **Objetivo, Layout, Conteúdo, Público**. O uso conta no seu limite de plano (as fontes divergem se há cota própria; confira em Settings → Usage). Ferramenta em evolução: veja `support.claude.com`.

## A · Design system (1× por projeto)
Anexe: logo (SVG/PNG), 1–3 prints de referência, fontes, paleta se existir.
```
Crie o design system do projeto [NOME]. Marca: [3 adjetivos]. Sentimento: [descrever].
Cores: [base #…, texto #…, destaque #…, apoio #…] — se não houver, proponha 2 paletas
com contraste AA e justifique. Tipografia: [display] + [corpo]. Anti-referências: [...].
Entregue: tokens (cor, tipografia, espaçamento 8pt, raio, sombra), botões, cards,
inputs com estados, e 1 elemento-assinatura ligado a [metáfora do negócio].
```

## B · Primeiras 3 direções
```
OBJETIVO: Landing page de [NEGÓCIO] para [PÚBLICO]. Ação principal: [CTA único].
LAYOUT: desktop 1440 e mobile 390. Seções na ordem: hero (promessa + prova + CTA),
problema, solução, como funciona (3 passos), prova social, oferta/contato, FAQ
(5 perguntas), CTA final, rodapé com link para política de privacidade.
CONTEÚDO: use este copy real (não invente): [colar textos]. Imagens: [placeholders
com proporção ou fotos anexadas].
PÚBLICO: [persona: quem é, o que busca, objeção principal].
SISTEMA: use os tokens do design system; não crie cores novas.
RESTRIÇÕES: contraste AA; alvos de toque ≥ 44 px; 1 CTA primário por tela;
hierarquia clara; evite os clichês (cream+serifada+terracota; preto+neon único;
hairlines com numeração 01/02/03 genérica); nada que dependa só de hover.
Entregue 3 direções distintas e diga em 2 linhas o que muda entre elas.
```

## C · Refino (um por vez)
- `Na direção 2, aumente a hierarquia do hero: título maior, subtítulo mais curto, CTA mais evidente. Não mude o resto.`
- `Reduza o número de elementos na seção de prova social para 3 depoimentos com foto.`
- `Mostre o estado mobile do menu aberto e do formulário com erro.`

## D · Rubrica de escolha (nota 0–2 por item; escolha a maior)
Promessa clara em 5 s · CTA visível sem rolar no mobile · contraste/legibilidade · hierarquia · consistência com o sistema · copy real · identidade própria (não genérica) · viabilidade em Tailwind · custo de performance (efeitos pesados?) · aprovado pelo cliente.

## E · Handoff para o Claude Code
Exporte o pacote de handoff (ou HTML/PDF). No Claude Code:
```
Leia o handoff em [caminho]. Extraia os tokens (cores nomeadas, tipografia, espaçamento,
raio, sombra, regras de motion) para docs/_projeto/DESIGN.md (máx. 60 linhas) e liste
os componentes necessários. Não escreva código de seção ainda.
```
