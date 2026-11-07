# PROGRESS — Master Pet na Prática (≤ 40 linhas; o Claude lê só isto ao retomar)

**Nível:** N2 enxuto (aprovado 2026-11-05; sobe para N3 se: área de aluno, pagamento ou mais de um usuário com permissões)
**Fase atual:** F1 concluída · **Atualizado:** 2026-11-07

## Feito
- F1: Next 16.4.5 + TS strict + ESLint; Tailwind sem preflight; `app/tokens.css` (Paleta B); next/font (Playfair 600, Source Sans 3 400/600);
  7 webp em `public/images/` (528 KB), originais em `design-src/originals/` (gitignored); 4 headers básicos; DESIGN.md e PLANO.md.

## Próximo (1 fase)
- F2: LP estática, seção por seção (chromium 390 e 1440). **Bloqueada** até chegar `handoff/components/components.css`.

## Decisões e premissas (detalhe em PLANO.md)
- 2026-11-07 CSV = RF-11 Should (1º a cortar); RF-14 por e-mail + script manual · sem CSP (só 4 headers; avaliar na F5) · limite de envio
  em tabela Neon (ip_hmac, 10 min, 5 envios), sem Upstash · Tailwind só no admin · véu do hero em @keyframes · ouro: botão, texto sobre
  navy, grafismo redundante · consent_events = fonte única · anonimizar/excluir como no PLANO (confirmar com advogado) · páginas legais:
  rascunho na F3, noindex · retenção 12 meses após último contato, só botão manual · QA da F2 só chromium; matriz completa na F5.
- Scaffold: removi `cacheComponents` e `partialPrefetching` que o create-next-app habilitou (não pedidos; exigiriam Suspense).
- ESLint ignora `docs/**` e `design-src/**` (o protótipo gerava 7 warnings).
- PRODUCT.md §12: tirei "Upstash" da lista de contas (única edição além do ajuste 13).

## Pendências / bloqueios
- Camila: preço · formato e nº de encontros · FAQ real · vetor do wordmark · regiões atendidas · pré-requisito da Mentoria online.
- Jurídico: ME/EPP (controladora) · retenção · IP como HMAC × puro · revisão dos textos legais antes de qualquer lead real.
- Técnico: `components/components.css` ausente do handoff (bloqueia F2) · `npm audit` com avisos no scaffold (triar na F5) ·
  hero-bg tem 1672 px (reexportar ~2400 px se ficar mole em 1920).

## Mudanças de escopo aprovadas
- 2026-11-07 CSV de painel rebaixado a Should (RF-11); RF-14 sem botão de CSV → aprovado pelo dono do projeto na sessão da F1.

## Backlog (ideias fora do escopo)
- (vazio)

## Consumo (para calibrar prazos)
- F1 — ≈ US$ 6–7 no alerta de custo da sessão (plano + execução); sem % de janela disponível.
