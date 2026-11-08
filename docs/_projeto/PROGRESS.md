# PROGRESS — Master Pet na Prática (≤ 40 linhas; o Claude lê só isto ao retomar)
**Nível:** N2 enxuto (sobe para N3 se: área de aluno, pagamento ou mais de um usuário com permissões) · **Fase atual:** F4, commits 1–4b feitos; falta o 5 (DECISOES-LGPD.md completo) · F1 ✔ F2 ✔ F3 ✔ → F4 → F5-painel → F6 (QA/legais/deploy)

## Feito
- F1–F3: Next 16.4.5 + Paleta B; LP estática em Server Components (CSS do handoff intacto em `app/landing/`); gsap: `LandingFx` cria as cenas de `app/_fx/` na ordem da página, pin só em ≥900x720 (#problema, #como, #acao), estado inicial por `gsap.set` pós-hidratação. CLS 0, `node qa/fx-check.mjs <url>` TUDO OK.
- F4 c1–c2: Neon + Drizzle (`app/_lib/db/schema.ts`, `getDb()`); Better Auth (signup off, cookie httpOnly path=/admin, `requireSession()` em toda página/action admin, `scripts/create-admin.mjs`). **Migrações 0000–0003 aplicadas SÓ no branch teste do Neon (sa-east-1, expira 2026-12-07). Banco de produção: sem migração; admin existe só no teste.**
- F4 c3: `enviarLead` (honeypot → Zod → IP→HMAC → limite 5/10 min, limpeza 24 h → `db.batch` lead+consent_events), `CONSENT_TEXT` + hash SHA-256, `anonimizarLead` (+audit_log). `admin_events` NÃO feito: início da F5.
- F4 c4: `LeadForm` client (3 passos só pós-hidratação; sem JS = 3 passos juntos), cena 9 `_fx/form.ts`, textos legais 0.2 (histórico em `legal-version.ts`), Playwright na porta 3000 com o branch teste.
- F4 c4b: regras únicas `lead-rules.ts` (navegador + Zod). Cidade×IBGE só no servidor (`municipios.ts` + `data/municipios.json`; 0 byte no bundle). Banco: 8 CHECKs em `lead` + triggers (`atualizado_em`; `consent_events` imutável, só zera ip_hmac/user_agent). Tempo real: inválido na hora, incompleto no blur + debounce 300 ms, máscara do telefone; erro de blur é ignorado ao pressionar botão (senão o erro empurrava o botão e o clique se perdia).
- Aba dos termos: botão "Fechar e voltar ao formulário" (`window.close()`; senão mostra o aviso). Playwright: fechou em chromium e webkit; Safari/iOS real NÃO testado.
- Hash+pins (causa medida): o salto nativo vem antes dos pin-spacers e o Chromium faz scroll suave pós-load com destino defasado; chromium parava em scrollY 0, webkit dentro de #acao. Correção `_fx/hash.ts`: scroll-behavior:auto + reaplica `scrollIntoView` após cenas, load e fonts.ready (+120/450/1000 ms) até haver interação. 3 viewports × 2 navegadores × #conversar/#acao: alvo a 76 px (abaixo do header); estado das cenas = rolagem natural; F5 e reduced-motion ok.
- Verificação 4b: Vitest 126 ok (regras, IBGE, CHECKs/triggers no banco) · Playwright 30 ok, 4 pulados (`npm run e2e`) · CLS 0 · LCP ≤ 1,5 s · googleapis 0 · banco teste sem sobras (o lead "First Teste" é seu teste manual).

## Pesquisa de validação (4b, 2026-11-08: web, não Context7)
- Nome: Unicode `\p{L}\p{M}` + espaço ' - . (NFC), ≥2 letras, sem dígitos/símbolos; não restringir a ASCII (José, Conceição, D'Ávila, 李雷).
- Telefone BR: celular = DDD + 9 + 8 dígitos (11); fixo = DDD + [2-5] + 7 (10). Nono dígito obrigatório (Anatel 2012–2016; Tecnoblog).
- DDD: 67 em uso (Anatel); lista conferida em listtas.com (67/67) → `DDDS`. Sem libphonenumber (~100 kB para uma regra de poucas linhas).
- Unificação de áreas locais (Res. 768/2024, até jun/2026, fonte SipPulse) muda só a classificação da chamada, não o número.
- Rejeita parte local com todos os dígitos iguais (99999-9999) e `+55` só quando sobra número (55 também é DDD do RS).
- UF: 27 siglas. Cidade: letras/espaço/apóstrofo/hífen; existe na UF? só no servidor, sem acento nem caixa.
- IBGE: API de localidades `servicodados.ibge.gov.br/api/v1/localidades/municipios`, baixada em 2026-11-08: 5 571 municípios, 27 UFs, 84 kB.
- Mensagem ≤ 1000 sem caracteres de controle (permite `\n`). Negócio 2–80, ≥1 letra, dígitos e pontuação comum.
- Postgres: `[[:alpha:]]` só cobre acentos com locale UTF-8 (teste: C.UTF-8 ok). CONFERIR o locale do banco de produção antes de migrar.
- UX: erro "inválido" na hora; "incompleto" só após o 1º blur, depois com debounce; sem biblioteca.

## static-overrides.css, desvios do protótipo
- scroll-padding/`[id]` · `#problema` margem negativa · `.lp-cover` !important · véu do hero em @keyframes · header `.is-top` · `.ln__i-mask` · `.lp-panes{gap}` · `.lp-demo/.lp-hp/.lp-gmsg` · F3: `.lp-prob__stage.is-pin` compactado, pin dourado, sticky sem transição em reduced-motion.
- FAQ: chips `provisório`. Formulário: só a legenda "Passo N de 3". Tilt fora do pedido. Hook Impeccable acusa `gradient-text` em `.lp-gold`: mantido. Camila em ação: texto da ficha é exemplo.

## Pendências / bloqueios
- Legais [PENDENTE]: controladora (razão social/CNPJ/endereço) · ME/EPP · hospedagem e região da função (Vercel, padrão iad1: conferir em Settings > Functions) · transferência internacional (art. 33) · retenção (incl. audit_log) · e-mail do titular · encarregado · TERMOS: responsável, marca/imagens, foro, contato. Revisão jurídica antes de qualquer lead real (caixa única × duas, cascade, IP HMAC × puro). Camila: preço · encontros · FAQ real · wordmark · regiões · texto de "Camila em ação".
- IP do login em texto puro no Better Auth (`session.ip_address`, `rate_limit_auth.key`; política 0.2 já diz a verdade): (a) sessão: POSSÍVEL (`databaseHooks.session.create.before`); (b) chave: POSSÍVEL só com `rateLimit.customStorage` + HMAC; recomendação: ambos. Detalhes em `lgpd/DECISOES-LGPD.md`. Também: `BETTER_AUTH_URL` de produção · `npm audit` (F6).
- F5 (Should, abaixo de lista/status/excluir-anonimizar, acima de WhatsApp): "Auditoria exportável" no painel, para a Camila obter os registros sem depender de dev. Conteúdo: audit_log + consent_events (sem ip_hmac e user_agent por padrão) + admin_events. Export em CSV com proteção contra fórmula; o próprio export grava audit_log (ação export_auditoria, sem dado pessoal). Só admin logado, requireSession() em toda action. Disponibilizar o DECISOES-LGPD.md para download na mesma tela.
- Logs de infraestrutura (Vercel, Neon) não entram no painel: registrar no DECISOES-LGPD.md onde ficam e que a retenção é do provedor.
- admin_events (login, logout, export_auditoria): só ação e data UTC, sem IP. NÃO coube no commit 3: criar a tabela e gravar login/logout no início da F5.
- Pendência jurídica: prazo de retenção de audit_log e admin_events.

## Backlog: (vazio)
## Consumo — F1 ≈ US$ 6–7. F2: ~63% da janela. F3 CP1: não medido. CP2 commit 1: 76% → 82%, semana 9%. CP2 commits 2+3: US$ 1,55 (estimativa de API); fim em 19%, semana 11%. F4: planejamento 24% → 30%. Commits 1+2: 30% → 35%. Commit 3: 35% → 38%. Commit 4: 38% → 45%. Commit 4b (validação, UX, aba, hash+pins): início em 45%, fim não medido pelo agente (anotar). Commit 5 (DECISOES-LGPD.md): a fazer.
