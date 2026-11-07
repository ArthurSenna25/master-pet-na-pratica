# PROGRESS — Master Pet na Prática (≤ 40 linhas; o Claude lê só isto ao retomar)

**Nível:** N2 enxuto (sobe para N3 se: área de aluno, pagamento ou mais de um usuário com permissões)
**Fase atual:** F2 e F2b concluídas · **Atualizado:** 2026-11-07 · **Ordem:** F1 → F2 → F3-motion → F4-banco → F5-painel → F6 (QA/legais/deploy)

## Feito
- F1: scaffold Next 16.4.5, tokens Paleta B, next/font, 7 webp (528 KB), headers, DESIGN/PLANO.
- F2: LP estática em Server Components (`app/_components/`, 1 arquivo por seção; page.tsx só compõe). CSS do handoff copiado sem alterar
  valores em `app/landing/` (+ `static-overrides.css`). Pares protótipo × porte (chromium, reducedMotion, 390 e 1440) conferidos.
  Build/lint/tsc ok · scrollWidth = clientWidth em 390 e 1440 · 1 h1 · Playfair 600 e Source Sans 3 400/600 carregadas · 0 googleapis ·
  public 528 KB · handoff sem diff · 0 `use client` · `#conversar` fica sob o header (76 px).

## static-overrides.css (cada regra; remover/restringir na F3-motion = [F3], F4 = [F4])
- scroll-padding-top no html; `[id]{scroll-margin-top:0}`; `#problema` com margem negativa (o protótipo usa scroll-margin 0 ali).
- `.lp-hero .lp-cover` !important: next/image `fill` injeta inset:0/100% inline; o protótipo usa -4%/108%.
- Véu do hero em @keyframes (.92→0, 1,8 s); no reduced-motion o landing-v6.css já o oculta. [F3]
- FAQ em `<details>`: `.lp-a` sem 0fr, visibility visível, `summary` estilizado, `+`→× em [open]. [F3: FaqItem aria-expanded p/ animar 8c]
- Header sólido por padrão (+ scroll-timeline em chromium volta ao degradê no topo); sem isso o logo cai sobre o conteúdo. [F3]
- `.lp-panes{gap:20px}`: os 3 passos aparecem juntos e colavam. [F4]
- Links do consentimento em ouro (o navy padrão some no vidro); `.lp-row>.mp-field{min-width:0}` (campos estouravam o cartão); `#lp-previa`.
- Sem regra: `mp-reveal`/`mp-js` só agem com a classe `.mp-js`, ausente (tudo visível). Estados ocultos que o JS usa e ficam como no
  protótipo: StickyCta (oculto + `inert`), `.lp-count`, cenas 2-3 de "Camila em ação", `.lp-n__r`, `.lp-shine`.

- F2b: /politica-de-privacidade e /termos-de-uso (rascunho, noindex, sem JS). Versão única em `app/_lib/legal-version.ts` (`LEGAL_TEXT_VERSION` = "0.1 de 2026-11-07"):
  a faixa da página é montada dela e a F4 grava o mesmo valor em `consent_events.texto_versao`. Links legais no rodapé e no consentimento (nova aba).

## Desvios do protótipo (registrados)
- Omitidos (JS/motion): barra de progresso, pin das 3 fotos de "Camila em ação" (ficha mostra só o tema 01), scripts GSAP/CDN.
- FAQ: `<details>` sem h3; "Quantos encontros?" e "Quanto custa?" ganharam chip `provisório` (dependem da Camila).
- Formulário: sem barra de passos nem botões Continuar/Voltar (ocultos sem JS); botão de envio `disabled` + chip "prévia visual";
  links /politica-de-privacidade e /termos-de-uso no consentimento (rotas na F4; hoje 404). Sem divs de erro vazias.
- `'use client'` NÃO aplicado em CamilaEmAcao/FaqItem/LeadForm: sem estado, seria JS à toa. Entra na F3-motion/F4.
- Quebra de linha do h1 em 390 difere do protótipo (o JS dele divide em linhas); hero-bg 1672 px: sem aviso de mole em 1440.
- Hook Impeccable acusou `gradient-text` em `.lp-gold` (landing-v6.css:20): é o protótipo aprovado, mantido.

## Pendências / bloqueios
- Legais [PENDENTE] nas páginas: controladora (razão social/CNPJ/endereço) · ME/EPP · operadores (nome e país; Vercel/Neon só na F4, com localização conferida) ·
  transferência internacional (art. 33) · retenção · e-mail do titular (2x) · encarregado/dispensa · TERMOS: responsável (CNPJ), titular da marca e das imagens,
  revisão da limitação de responsabilidade, foro, e-mail de contato.
- Jurídico F4: consentimento em caixa única (dados + Termos) × duas caixas · citar o cookie de sessão do painel (Better Auth) na política, se a revisão entender
  necessário (hoje o texto diz só "a página pública não usa cookies não essenciais") · reler os verbos "coletamos" quando o formulário ficar ativo · IP HMAC × puro.
- Camila: preço · formato e nº de encontros · FAQ real · vetor do wordmark · regiões · pré-requisito da Mentoria online · texto real de "Camila em ação".
- Jurídico: ME/EPP · retenção · IP como HMAC × puro · revisão dos textos legais antes de qualquer lead real.
- Técnico: `npm audit` (triar na F6) · hero-bg ~2400 px se ficar mole em 1920 · rodar `qa/compare.mjs` precisa de rede (CDN do protótipo).

## Backlog: (vazio)
## Consumo — F1 ≈ US$ 6–7 (alerta de custo). F2: janela do Pro (/usage) — início e fim: “F2 + sessões anteriores do dia: ~63% da janela, 7% da semana (início não medido)”.
