# ACESSIBILIDADE — Mentoria Natal (v2)

## Estrutura e roles
- Landmarks: `header`, `main#conteudo`, `footer`; `nav[aria-label=Legal]`. Link "Ir para o formulário" é o 1º foco.
- Uma `h1` (hero); cada seção é `<section aria-labelledby>` com `h2`; itens `h3`. Listas são `ul/ol`.
- Decorativos fora da árvore: guirlandas, canvas, ilustração do presente, arco do hero, números `01…`, setas (`aria-hidden`). Wordmark: `role="img" aria-label="Master Pet"`.
- Selos (`provisório`, `exemplo`, `foto a receber`) são texto real, lidos pelo leitor de tela.
- Antes×depois: cada célula tem prefixo `sr-only` "Antes:"/"Depois:".
- FAQ e depoimentos: `details/summary` nativos (teclado e leitor de tela de graça).
- Formulário: `form[aria-labelledby]`, `fieldset` + `legend` por passo e por grupo de rádio; `label for`; erro em `<p id aria-live=polite>` ligado por `aria-describedby`; `aria-invalid` por campo; progresso em texto (`aria-live=polite`) + barra decorativa; `required` nativo. "Enviando…": botão `disabled` + `aria-busy`. Confirmação: `role=status` e foco no título (`tabindex=-1`). Honeypot: `aria-hidden`, `tabindex=-1`, fora da tela.

## Ordem de Tab
Skip link → CTA do header → CTA do hero → (conteúdo sem foco) → CTA do bônus → depoimentos (summary) → 6 summaries do FAQ → Nome → WhatsApp → Continuar → (passo 2) Cidade → Negócio → rádios (1 parada por grupo, setas trocam) → consentimento → links de privacidade/termos → Voltar → Enviar → barra de estados (demo) → rodapé. Ao ir para o passo 2 o foco vai ao 1º campo; ao voltar, ao 1º campo do passo 1; em erro, ao 1º campo inválido.

## Teclado
Enter/Espaço abre `summary`; Enter envia/avança; Espaço marca checkbox; setas nos rádios. Nenhum atalho, nenhum foco preso, nenhum modal. O tilt é só ponteiro; presente repete em `focus` do CTA.

## Movimento
`prefers-reduced-motion: reduce` → nenhuma cena roda; tudo aparece no estado final. Sem JS: idem. Sem piscar (>3 Hz): nenhum; brilho do canvas é lento (<1 Hz).

## Contraste calculado (WCAG)
Texto (≥4,5:1):
- bege-50 sobre navy-900 **16,4** · bege-200 sobre navy-900 **13,0** / navy-950 **13,9**
- ouro-400 sobre navy-900 **8,1** / navy-950 **8,6** / navy-800 **6,9** / navy-700 **5,3** (ouro só como texto SOBRE navy)
- navy-900 sobre ouro de ação **7,4** (hover **9,4**, pressed **5,9**) — ouro só como preenchimento do botão
- navy-900 sobre bege-100 **15,3** · sobre azul-100 **14,1**
- ink-muted sobre bege-50 **7,1** / bege-100 **6,6** / bege-200 **5,6** / azul-100 **6,1**
- azul-600 (eyebrow, links) sobre bege-100 **6,7** / bege-50 **7,2** / azul-100 **6,2**
- selo navy-900 sobre bege-200 **13,0** · bege-50 sobre navy-800 **14,2**
- erro (danger) sobre bege-50 **6,3**, sobre branco **6,9** · sucesso sobre branco **6,4**
- placeholder (ink-muted, 80%) sobre branco ≈ **7,7**
UI (≥3:1): borda de input sobre branco **4,3** / bege-50 **4,0** · navy-800 (barra, rádio marcado) **14,2** · anel de foco navy-700 no claro / ouro-400 no navy (**8,1**) · ícone ouro-700 sobre bege-50 **4,6** · borda ouro 40–65% sobre navy é decorativa (informação não depende dela).
Regra de marca respeitada: nenhum texto ouro sobre fundo claro (o cartão do formulário, que é claro dentro de seção navy, neutraliza os acentos "sobre navy": links e selos).

## Alvos (≥44 px)
Botões ≥52 (header ≥44) · inputs 52 · rádios/chips 48 · checkbox 24 com `label` de ≥44 de altura clicável · `summary` ≥60 · links do rodapé 44 · botões da barra demo 44.

## Foco
`:focus-visible` com `outline 3px` (navy-700 / ouro-400 sobre navy), `outline-offset 3px`; inputs ganham halo azul-bebê.

## Desempenho e layout
Sem overflow horizontal em 390 (`overflow-x: clip` no `.nm`; garlanda `slice`); sem layout shift (nada muda de caixa; revelações usam transform/opacity; fontes `display=swap`); LCP = H1 (texto, sem imagem acima da dobra); GSAP+ScrollTrigger carregados no fim do body (no Next: `next/script strategy="lazyOnload"`); sem imagens no protótipo (placeholders). Fotos futuras: webp, `width/height`, abaixo da dobra com `loading=lazy`.

## Acréscimos da v2
**Roles/aria.** Interação 4: âncoras `role="button"` + `aria-pressed`, resultado em `aria-live="polite"`; sem JS são links para `#lista`. Divisor 5: `role="slider"` (`tabindex=0`, `aria-valuemin/max/now`, `aria-valuetext="Improviso X%, processo Y%"`, `aria-label`). Trilha 3: `ol` de 6 estações sempre no DOM (todas legíveis por leitor de tela, mesmo as recuadas); fita SVG, canvas, bokeh, numerais gigantes e cursor são `aria-hidden`; navegação "Ir para uma estação" com botões 1…6, anterior e próxima (`aria-label`, `aria-current`). Capítulos: `ol` + "Capítulo N de 4" em texto. SplitText marca `aria-label` no elemento e `aria-hidden` nas linhas.
**Teclado.** Tab: skip → header → CTA do hero → botões 1…6 da trilha → respostas A–E → divisor (←/→ ±5, PageUp/Down ±20, Home/End) → CTA do bônus → depoimentos → 6 FAQs → formulário. Rolar com setas/Espaço percorre o pin; o snap leva à estação mais próxima. Nada captura o foco.
**Sem cor como único sinal.** Resposta escolhida: "Selecionado" + `aria-pressed`; estação-alvo no trilho: anel/escala + texto em negrito; erro: etiqueta com ícone e texto; opção inválida: borda tracejada + mensagem; slider: rótulos "Improviso"/"Processo" e valor textual.
**Contraste (WCAG), v2.** Sobre o vidro (pior caso: navy-800 atrás + camada escura 55% + brilho bege 12% ⇒ #28334e): bege-50 **11,5** · bege-200 **9,1** · ouro-400 **5,7** (links, "Voltar", aviso de pré-seleção; ouro só SOBRE navy) · ouro-300 **7,4** · borda dos chips/inputs (bege 60% sobre o vidro) **5,2** (UI ≥3). Etiqueta de erro: danger sobre bege-50 **6,3**. Texto dos inputs navy-900 sobre bege-50 **16,4**. Cartões da trilha: bege-50 sobre navy-700 **10,9**, ouro-400 **5,3**, bege-200 **8,6**. Resposta marcada: bege-50 sobre navy-800 **14,2**. Trilho: bege-200 sobre navy-800 **11,2**. Hero/capítulos: bege-50 sobre navy-900 **16,4**; ouro-400 sobre navy-950 **8,6**. O numeral gigante dos capítulos (traço ouro a 42%) tem ~2,4:1: é **decorativo e aria-hidden** (a informação está em "Capítulo N de 4"). Demais pares da v1 continuam válidos.
**Alvos ≥44 px.** Botões 52–60 · botões 1…6 e setas da trilha 44 · respostas A–E ≥64 · alça do divisor 56×(altura total) com bolinha 52 · chips 48 · summary FAQ ≥88 · barra "Estados" 44.
**Movimento.** reduced-motion: sem pin, sem parallax, sem 3D, sem cursor, sem faíscas; tudo legível. Sem JS: nada oculto por CSS. Sem autoplay de som/vídeo; sem rotação automática (o objeto só inclina com o cursor). Nenhum piscar >3 Hz (brilhos <1 Hz).
**Estado oculto.** Só abaixo da dobra e aplicado por JS; exceção documentada: linhas do H1 (máscara de 1,15 s, failsafe em 3 s).
**Desempenho/CLS.** Ver MOTION.md (orçamento). Pin-spacers criados abaixo da dobra; hero com altura fixa.


## v4 · Etapa B
- **Depoimentos:** região "carrossel" com slides rotulados ("n de 6"); faixa com tabindex=0 e setas ←/→; botões anterior/próximo (48 px, desabilitados nas pontas); sem rotação automática; vídeo sem autoplay/som, botão com rótulo claro e aviso em role=status. Selo "exemplo" em texto em cada cartão.
- **FAQ:** cada pergunta é um <button> dentro de <h3>, com aria-expanded e aria-controls; resposta em role=region ligada à pergunta; ↑/↓/Home/End movem o foco entre perguntas; foco visível (anel 3 px). Sem marcadores nativos. Sem JS ou em reduced-motion: todas as respostas visíveis. No modo painel, respostas inativas ficam com visibility:hidden (fora da árvore de acessibilidade).
- A rolagem nunca é capturada: o destaque acompanha a rolagem, e clicar/tocar fixa a pergunta até o leitor rolar ~160 px.

- CTA flutuante: link comum, `visibility:hidden` quando fora de cena (não recebe foco). Alvo ≥56 px. Rodapé ganha respiro para não ficar coberto.
- Fechamento: foto com alt descritivo; título sobre degradê escuro (texto claro sobre ≥.9 de navy).
