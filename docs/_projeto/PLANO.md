# PLANO — Master Pet na Prática (N2 enxuto · ≈ 8 janelas de 5 h)
Válvula global: nunca cortar formulário → lead → lista → status, nem os Musts de LGPD e segurança.
Cortar primeiro: CSV (RF-11), resumo no topo (RF-09), botão de WhatsApp (RF-10).

## Fases
**F1 · Scaffold + tokens** (0,5 j) — Next 16, TS strict, Tailwind sem preflight, tokens, next/font, imagens, headers, DESIGN/PLANO.
Pronto: build, lint e tsc verdes; 0 refs a googleapis; Playfair no h1 e Source Sans 3 no corpo; `public/` < 1 MB.
Válvula: nada a cortar. Deps: as do scaffold.

**F2 · LP estática** (2,5 j) — 11 seções, uma por vez, estado estático (= reduced-motion); formulário só marcação.
Pronto: screenshot lado a lado com o protótipo (chromium, 390 e 1440) aprovado por seção; sem overflow em 375; um h1.
Válvula: máx. 2 rodadas de ajuste fino por seção. Deps: `@playwright/test` (dev).
**Bloqueio:** falta `handoff/components/components.css` (mp-btn, mp-wordmark, mp-fx, mp-reveal, mp-field…).

**F3 · Banco + formulário + consentimento + login + rascunho legal** (1,5–2 j)
Escopo: `lead` e `consent_events` (só INSERT; hash do texto; ip_hmac); tabela de limite de envio (Neon, por ip_hmac, 10 min, 5 envios);
form em 3 passos com server action + Zod + honeypot; Better Auth sem cadastro público, admin por script;
/politica-de-privacidade e /termos-de-uso como RASCUNHO, sem revisão jurídica, noindex (RF-13); logs sem dado pessoal (RNF-07).
Pronto: E2E grava lead + evento; POST inválido → 400; honeypot descartado; 6º envio em 10 min bloqueado; /admin sem sessão → login; Vitest verde.
Válvula: máscara de telefone e animação de troca de passo. Deps: zod, drizzle-orm, @neondatabase/serverless, drizzle-kit (dev), better-auth, vitest (dev).

**F4 · Painel** (1,5 j) — lista com busca e filtro por status, status + observação, resumo (RF-09), WhatsApp (RF-10),
excluir/anonimizar (RF-14), CSV (RF-11, Should).
Pronto: E2E do admin; toda action sem cookie → 401 (RNF-04); formulário → lead no painel em ≤ 2 min.
Válvula: CSV, depois RF-09, depois RF-10. Deps: nenhuma nova.

**F5 · Motion + QA completa + legais finais + deploy** (2 j) — cenas do MOTION.md; matriz completa; RNF-08 (registro de operações,
template de incidentes, retenção) em `docs/_projeto/lgpd/`; deploy .vercel.app; avaliar CSP se o PRODUCT exigir.
Pronto: DoD N2 do doc 09; LCP ≤ 2,5 s e CLS ≤ 0,1 no mobile; checklist N2 do doc 08; revisão jurídica antes de qualquer lead real.
Válvula: CTA magnético, glow do bento, luz do cursor; depois assinatura e 8b; por último os 3 pins viram reveal simples.
Deps: gsap, @gsap/react (ou `gsap.context`).

## Ajustes decididos (valem para as fases seguintes)
1. `styles.css` existe, mas importa `components/components.css`, que não está no handoff → pedir o export; bloqueia a F2.
2. CSV (RF-11): Should, primeiro a cortar. RF-14 atendido por e-mail + export manual via script.
3. Sem CSP (exige nonce e perde página estática). Só 4 headers básicos; CSP = avaliar na F5.
4. Limite de envio em tabela no Neon (ip_hmac, 10 min, 5 envios). Sem Upstash.
5. Tailwind sem preflight (theme + utilities); é para o admin. A LP usa o CSS do protótipo.
6. Véu do hero em @keyframes CSS; sem script inline, sem gsap.fromTo; remover `.mp-js` no porte.
7. QA da F2: só chromium em 390 e 1440. Matriz completa (chromium + webkit × 390, 1366×657, 1440×800, 1920×1080, com/sem reducedMotion) só na F5.
8. Ouro: preenchimento do botão primário; texto sobre navy ou foto com scrim navy (gold-400); grafismo não textual e redundante. Nunca texto ouro sobre claro.
9. `consent_events` é a fonte única de consentimento; o lead não guarda consentimento_em/versao; mantém atualizado_em e anonimizado_em.
10. Anonimizar: zera nome, WhatsApp, negócio, mensagem e observação; mantém respostas fechadas, cidade/UF, status e datas;
    zera ip_hmac e user_agent dos eventos (mantém versão, hash e data). Excluir: apaga lead e eventos em cascata. Confirmar com advogado.
11. Páginas legais: rascunho na F3, "RASCUNHO, sem revisão jurídica", noindex; revisão antes de qualquer lead real.
12. Retenção: proposta de 12 meses após o último contato, depois anonimizar; a confirmar com a Camila e o advogado. Sem cron; só botão manual.
13. PRODUCT.md: /termos-de-uso no sitemap; "aviso por e-mail" = Won't; RF-14 sem botão de CSV; consentimento só em consent_events.
14. Fases: F2 LP estática · F3 banco+form+consentimento+login+rascunho legal · F4 painel · F5 motion+QA+legais+deploy.
