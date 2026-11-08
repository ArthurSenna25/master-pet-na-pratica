# PROGRESS — Master Pet na Prática (≤ 40 linhas; o Claude lê só isto ao retomar)

**Nível:** N2 enxuto (sobe para N3 se: área de aluno, pagamento ou mais de um usuário com permissões)
**Fase atual:** F4 em andamento (commits 1-3 de 5) · F3-motion concluída · **Ordem:** F1 → F2 → F3-motion ✔ → F4-banco → F5-painel → F6 (QA/legais/deploy)

## Feito
- F1: scaffold Next 16.4.5, tokens Paleta B, next/font, 7 webp (528 KB), headers, DESIGN/PLANO.
- F2: LP estática em Server Components (`app/_components/`, 1 arquivo por seção). CSS do handoff intacto em `app/landing/` (+ `static-overrides.css`). F2b: páginas legais em rascunho (noindex); versão única `app/_lib/legal-version.ts`.
- F3 (gsap 3.15.1 + @gsap/react): `LandingFx` (client, `return null`) cria as cenas de `app/_fx/` na ordem da página, um único `ScrollTrigger.sort()`, `refresh()` no load/`fonts.ready`, cleanup `mm.revert()`. Pin só em `(min-width:900px) and (min-height:720px)` (#problema, #como, #acao); mobile/altura baixa = 3m/4m sem pin. Estado inicial só por `gsap.set` pós-hidratação (sem JS e reduced-motion = tudo visível).
- CamilaEmAcao é client (abas, setas ←→, tema do pin por CustomEvent `acao:tema`; pin dourado decorativo via container-type:size). CLS 0 em 390 e 1440 (h1 SplitText corrigido; `qa/cls-src.mjs`).
- Verificação F3 (`node qa/fx-check.mjs`, `next start -p 3100`): chromium+webkit, 390x844/1440x800/1366x657, com/sem reduced-motion: TUDO OK · googleapis 0 · LCP mobile 0,7–2,2 s · CLS 0.

- F4 c1: drizzle-orm, @neondatabase/serverless, drizzle-kit. Schema `app/_lib/db/schema.ts` (lead, consent_events c/ `tipo`, rate_limit, audit_log sem FK/sem PII, Better Auth conferido c/ CLI). `getDb()` preguiçoso. Migrações 0000/0001. **Migração aplicada só no branch teste do Neon (sa-east-1, expira 2026-12-07). Banco de produção: sem migração.**
- F4 c2: better-auth + zod. `auth.ts` (signup desligado, cookie httpOnly path=/admin, login 5/min), `session.ts` (`requireSession()` em toda página/action admin), `/admin/login` (sem JS ok), `/admin`, `scripts/create-admin.mjs`. Verificado em produção: /admin sem sessão→307 · sign-up 400, 0 usuários · login 200 · 6º login→429. Testes de auth devem enviar `Origin` = BETTER_AUTH_URL (localhost:3000).
- F4 c3: `lead-action.ts` (`enviarLead`: honeypot `site` → Zod `lead-schema.ts` → IP→HMAC `seguranca.ts` → limite `rate-limit.ts` 5/10 min, limpeza 24 h → `db.batch` lead+consent_events+rate_limit) · `CONSENT_TEXT` em legal-version.ts (hash SHA-256) · `anonimizar.ts` (`anonimizarLead`: chamar só após `requireSession()`; grava audit_log) · `lead-options.ts` provisório. Campos = names do LeadForm. `npm test` (Vitest 5; @types/node→^24): 19 verdes, 6 contra o branch teste (prefixo `zz-teste-`, limpeza em afterEach, banco sem sobras). POST inválido não consome o limite. `admin_events` NÃO feito (não coube): início da F5.
- F4 IP em texto puro (decisão a validar, não alterado): Better Auth grava IP em `rate_limit_auth.key` ("<IP>|/sign-in/email") e em `session.ip_address`. Fora do HMAC; entra no DECISOES-LGPD.md.
- F4 pendências: admin existe só no branch teste (criar no banco de produção com script) · audit_log sem prazo de retenção e cascade = pendências jurídicas · Vercel Function Region (padrão iad1, suposição; conferir) · BETTER_AUTH_URL de produção · Neon: grátis, AWS sa-east-1, Postgres 18.

## static-overrides.css (restante)
- scroll-padding/`[id]` · `#problema` margem negativa · `.lp-cover` !important (next/image fill) · véu do hero em @keyframes (CSS por decisão) · header sólido + `.is-top` · `.ln__i-mask` · `.lp-panes{gap:20px}` [F4] · links do consentimento · `.lp-row`/`#lp-previa`.
- F3: `.lp-prob__stage.is-pin` compactado (1º sinal ia sob o header em 1440x800) · pin dourado (container + transform) · sticky sem transição em reduced-motion. Removidas: estilos do `<details>` do FAQ e scroll-timeline do header.

## Desvios do protótipo (registrados)
- FAQ: chips `provisório` em "Quantos encontros?" e "Quanto custa?". Formulário: sem barra de passos; envio `disabled` + chip "prévia visual" (F4). Cena 9 (formulário) é F4.
- Fora do pedido: tilt do protótipo. Hook Impeccable acusa `gradient-text` em `.lp-gold` (landing-v6.css:20): protótipo aprovado, mantido.
- Camila em ação: texto da ficha é exemplo (`[exemplo — substituir…]`), igual nos 3 temas.

## Pendências / bloqueios
- Legais [PENDENTE]: controladora (razão social/CNPJ/endereço) · ME/EPP · operadores · transferência internacional (art. 33) · retenção · e-mail do titular · encarregado · TERMOS: responsável, titular da marca/imagens, responsabilidade, foro, contato. Revisão jurídica antes de qualquer lead real (consentimento caixa única × duas, cookie do painel, IP HMAC × puro).
- Camila: preço · formato e nº de encontros · FAQ real · vetor do wordmark · regiões · pré-requisito da Mentoria online · texto real de "Camila em ação".
- Técnico: `npm audit` (F6) · hero-bg ~2400 px se ficar mole em 1920 · matriz completa de QA só na F6.
- F5 (Should, abaixo de lista/status/excluir-anonimizar, acima de WhatsApp): "Auditoria exportável" no painel, para a Camila obter os registros sem depender de dev. Conteúdo: audit_log + consent_events (sem ip_hmac e user_agent por padrão) + admin_events. Export em CSV com proteção contra fórmula; o próprio export grava audit_log (ação export_auditoria, sem dado pessoal). Só admin logado, requireSession() em toda action. Disponibilizar o DECISOES-LGPD.md para download na mesma tela.
- Logs de infraestrutura (Vercel, Neon) não entram no painel: registrar no DECISOES-LGPD.md onde ficam e que a retenção é do provedor.
- admin_events (login, logout, export_auditoria): só ação e data UTC, sem IP. NÃO coube no commit 3: criar a tabela e gravar login/logout no início da F5.
- Pendência jurídica: prazo de retenção de audit_log e admin_events.

## Backlog: (vazio)
## Consumo — F1 ≈ US$ 6–7. F2: ~63% da janela (inclui Claude Design e prompts do dia). F3 CP1: não medido. CP2 commit 1 (CLS + sticky): 76% → 82%, semana 9%. CP2 commits 2+3 (pins e Camila em ação): sessão US$ 1,55 (estimativa de API, não é cobrança); fim em 19% da janela, semana 11%. F4: planejamento 24% → 30%. Commits 1+2 (schema, migração, auth, login, script do admin): 30% → 35% (≈ 5 pontos). Commit 3 (action, consentimento, rate limit, anonimizar_lead, Vitest): início em 35%, fim não medido pelo agente (anotar).
