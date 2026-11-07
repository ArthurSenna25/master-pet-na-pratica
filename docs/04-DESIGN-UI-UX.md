# 04 · Design, UI, UX, Motion e Acessibilidade

**Quando ler:** ao definir ou construir visual, copy, componentes, animação.
Em N0: leia §1, §2, §3 e §6. Em N1+: leia tudo que se aplicar.

## 1. Processo

Briefing → direção visual (cores, fontes, sentimento, signature) → protótipo no Claude Design (3 direções) → escolha + até 3 refinamentos → aprovação → tokens em `DESIGN.md` → código. Visual se decide em protótipo, não em código: mudar no código é 10× mais caro.

## 2. UX: fundamentos que mais rendem

**10 heurísticas de Nielsen** (use como checklist de revisão): visibilidade do estado do sistema · correspondência com o mundo real · controle e liberdade · consistência e padrões · prevenção de erros · reconhecer em vez de lembrar · flexibilidade e eficiência · design estético e minimalista · ajudar a reconhecer, diagnosticar e corrigir erros · ajuda e documentação.

**Norman:** affordances e signifiers (o elemento indica o que faz), feedback imediato, mapeamento natural, restrições que evitam erro, modelo conceitual claro.
**Krug:** pessoas escaneiam, não leem; cada tela deve ser autoexplicativa; elimine meio segundo de dúvida por elemento.
**Leis úteis:** Hick (menos opções = decisão mais rápida), Fitts (alvo grande e próximo é mais fácil de acertar), Jakob (as pessoas esperam o que já conhecem de outros sites), Miller/chunking (agrupe).
**Arquitetura de informação:** rótulos na língua do cliente, navegação rasa, máximo 7±2 itens no menu principal, um objetivo por página.

### Landing page que converte (esqueleto padrão)
Hero (promessa clara + prova + **1 CTA**) → problema → solução → como funciona (3 passos) → prova social → oferta/preço (ou contato) → FAQ (objeções reais) → CTA final → rodapé (política de privacidade, contato).
Regras: 1 objetivo, 1 CTA primário repetido; CTA visível sem rolar no mobile; prova perto do CTA; copy clara antes de criativa; sem carrossel automático escondendo conteúdo; formulário com o mínimo de campos.

## 3. UI: regras concretas

- **Hierarquia** por tamanho, peso, cor e espaço (não por borda). Um foco por tela.
- **Grid/espaçamento** em múltiplos de 4/8 px; mesma escala em todo o projeto.
- **Tipografia:** máx. 2 famílias e 3 pesos; escala modular (ex.: 1.25); corpo ≥ 16 px; linha de 45–75 caracteres; altura de linha 1.4–1.6 no corpo.
- **Cor:** paleta **nomeada** (base, superfície, texto, destaque, apoio, estados). Destaque usado com parcimônia. Sempre cheque contraste.
- **Componentes:** estados completos (normal, hover, foco, ativo, desabilitado, carregando, erro, vazio).
- **Imagens:** AVIF/WebP, dimensões declaradas, `next/image`, a imagem do hero com `priority`.
- **Mobile-first;** layout intermediário real para iPad (não só "mobile ou desktop").

## 4. Acessibilidade — WCAG 2.2 nível AA como padrão

- HTML semântico (`header`, `main`, `nav`, `button` ≠ `div`), um `h1`, hierarquia de títulos sem pular.
- Contraste ≥ **4,5:1** (texto normal) e **3:1** (texto grande e componentes de UI).
- Todo controle acessível por teclado, com foco **visível**; ordem lógica.
- Alvos de toque: mínimo 24×24 px CSS (WCAG 2.2 AA); mire em 44×44 nos principais.
- `alt` significativo (decorativa = `alt=""`), `label` em todo campo, erro descrito em texto (não só cor).
- `lang="pt-BR"`; respeite `prefers-reduced-motion`; nada pisca mais de 3×/s; vídeo com legenda quando houver fala.
- Teste: navegação só com teclado, axe/Lighthouse, leitor de tela em 1 fluxo.
- Contexto Brasil: a Lei Brasileira de Inclusão (13.146/2015, art. 63) trata de acessibilidade em sites de empresas com sede ou representação no país; confirme obrigações do caso com o cliente.

## 5. Design system proporcional

| Nível | O que existe |
|---|---|
| N0 | Tokens mínimos no `@theme` do Tailwind: cores semânticas, 2 fontes, escala de espaço, raio, sombra |
| N1 | + inventário de componentes usados e variações |
| N2+ | + estados documentados, regras de uso, padrões de formulário/tabela do admin |

`DESIGN.md` curto (≤ 60 linhas): conceito, paleta nomeada com hex, tipografia, espaçamento, raio/sombra, signature, regras de motion, o que evitar. Use `templates/DESIGN.md.template`.

**Anti-"site de IA"** (segunda passada obrigatória): descarte se a primeira ideia for (a) cream + serifada + terracota, (b) preto + um neon, (c) hairlines estilo jornal com grade 01/02/03 genérica. Procure algo específico ao negócio real; especifique valores (blur, opacidade, duração, easing), nunca adjetivos.

## 6. Motion — escolha o nível com intenção

| Nível | O que é | Quando |
|---|---|---|
| **1 (padrão)** | GSAP + ScrollTrigger para reveals de seção; hover com elevação; glow sutil | Quase todo projeto (N0/N1) |
| **2 (vitrine)** | + fundo 3D (ShaderGradient), elemento-assinatura animado, camada cinematográfica (Lightswind/ReactBits/Skiper UI) | Demonstração/portfólio; peça explícita |
| **3** | Vídeo/imagem controlado por scroll | Só com decisão do `02 §Técnica` |

Regras: GSAP+ScrollTrigger nas páginas públicas; biblioteca Motion (`motion/react`) no admin; React Spring só para física de gesto; Anime.js só para micro-interação isolada — **um motor por seção**. Anime apenas `transform` e `opacity`. Duração típica 150–400 ms em UI, até 800 ms em reveals; easing consistente. ShaderGradient: `next/dynamic({ ssr:false })`, 1 por página, com moderação. Sempre `gsap.matchMedia()` para reduced-motion. Motion nunca esconde conteúdo ou CTA de quem não tem JS/hover.

## 7. Referências de design
`getdesign.md` e catálogos similares servem para entender a **estrutura** de como documentar um design system, nunca para clonar a identidade visual de uma marca real num projeto de cliente. Animmaster Lib: asset pago de uso manual, fonte de inspiração; não é padrão de projeto.

## 8. Uso do Claude Design
Ver `templates/prompt-claude-design.md`. Resumo: crie o design system primeiro; prompt com objetivo, layout, conteúdo real e público; peça 3 direções; refine em passos pequenos; faça handoff ao Claude Code.
