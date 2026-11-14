# SEGURANCA — Master Pet na Prática

Nível N2 enxuto (demo; `.vercel.app`). Este documento descreve o que existe, o que foi aceito e o que depende de terceiros. **Não afirma que o sistema é seguro**: reduz riscos conhecidos; não houve revisão externa. Atualizado em 2026-11-14 (F9).

## 1. Modelo de ameaça

| Ameaça | Quem | Alvo |
|---|---|---|
| Spam/robô no formulário; enchimento do banco | anônimo | `enviarLead` |
| Força bruta / enumeração no login | anônimo | `/admin/login` |
| Acesso ao painel sem sessão; CSRF nas rotas que gravam | anônimo / site de terceiro | `/admin/**`, downloads |
| Injeção (SQL, CSV, HTML) | anônimo | formulário, busca, exportações |
| Vazamento de segredo ou de dado pessoal (código, logs, bundle) | dev/terceiro | repositório, cliente |
| Clickjacking, sniffing, downgrade | rede | todas as páginas |
| Dependência vulnerável / conta de terceiro tomada | cadeia de suprimento | npm, GitHub, Vercel, Neon, e-mail |

Fora do modelo: atacante com acesso ao banco ou aos painéis da Vercel/Neon (ver §4), DDoS volumétrico, revisão jurídica (ver DECISOES-LGPD).

## 2. Controles e onde estão

| Controle | Arquivo / teste |
|---|---|
| Validação Zod no servidor + CHECKs/triggers | `app/_lib/lead-schema.ts`, `lead-rules.ts`, `db-constraints.test.ts` |
| Honeypot → Zod → limite por IP (HMAC, 5/10 min) | `app/_lib/lead-action.ts`, `rate-limit.ts` |
| Teto global 60/h no formulário | `app/_lib/seguranca.ts`, `db.test.ts` |
| Corpo de Server Action ≤ 100 kb | `next.config.ts` (`bodySizeLimit`) |
| Cadastro desligado; admin criado por script | `app/_lib/auth.ts` (`disableSignUp`), `scripts/create-admin.mjs` |
| **Rota `/api/auth` removida**; login/logout/troca só por Server Action via `auth.api` | `app/admin/actions.ts`; `e2e/f4.spec.ts` (sign-up/sign-in → 404) |
| Limite de login (5 falhas/min por HMAC do IP) e de troca de senha (5/10 min) | `app/_lib/admin/tentativas.ts`, `tentativas.test.ts` |
| Sessão checada em toda página, rota e action do admin | `app/_lib/session.ts`, `acesso-sem-sessao.test.ts` (glob) |
| Rotas GET que gravam: recusam Sec-Fetch-Site/Origin de outro site (403) | `app/_lib/admin/rota-protegida.ts`, `rotas-admin.test.ts` |
| Cookie `httpOnly`, `Lax`, path `/admin`; em produção `__Secure-` + Secure | `auth.ts`, `sessao-cookie.test.ts` |
| Consultas parametrizadas; busca com `% _ \` literais; CSV neutraliza `= + - @` | `injecao.test.ts`, `busca.ts`, `csv.ts` |
| Segredos só em `.env.local`; módulos de servidor não chegam ao cliente | `.env.example`, `client-boundary.test.ts` |
| Cabeçalhos: nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options, HSTS (sem preload), COOP, CSP Report-Only | `next.config.ts`, `e2e/seguranca-headers.spec.ts`, `seguranca-csp.spec.ts` |
| `noindex` no painel e nas páginas de login | metadados das páginas admin |
| Sem dado pessoal em logs | DECISOES-LGPD §9 |

## 3. Riscos aceitos (decisões registradas)

- **Login só por Server Action**, com limite próprio. A rota `/api/auth/[...all]` do Better Auth foi removida: não era usada pelo app e seu limite (5/min) era diferente do de `tentativas.ts`.
- **`frame-ancestors` é ignorado em CSP Report-Only** (limitação do navegador). A proteção atual contra iframe é `X-Frame-Options: DENY`.
- **CSP sem `report-uri`**: serve só para medir no console do navegador. O bloqueio (enforce) fica para depois da LP de Natal; exige `'unsafe-inline'` enquanto o Next injetar scripts/estilos inline.
- **Tempo mínimo de preenchimento descartado**: bloqueia pessoas rápidas/autopreenchimento e robôs aprendem a esperar.
- **Teto de 60/h pode barrar leads reais durante um ataque**: aceito; a mensagem orienta a tentar de novo. Reavaliar com tráfego real.
- **`server-only` ausente em `auth.ts`, `seguranca.ts` e `db/index.ts`** (importados por testes/scripts fora do Next). Compensado por `client-boundary.test.ts`: nenhum arquivo `"use client"` alcança esses módulos.
- **IP do login em texto puro** no Better Auth (`session.ip_address`, `rate_limit_auth.key`); política de privacidade diz a verdade (DECISOES-LGPD 5.17, 0.2).
- **Recuperação de senha é manual** (sem "esqueci a senha"), exige acesso ao banco.
- **`npm audit`**: 11 moderadas só em ferramentas de desenvolvimento (drizzle-kit/esbuild, typescript-eslint); correção exige major do drizzle-kit.
- Admin único, sem 2FA no app; sem revisão externa; sem WAF próprio.

## 4. O que depende de terceiros

Vercel (TLS, HSTS efetivo, região da função, logs) · Neon (criptografia em repouso, backup/PITR, branch de teste expira 2026-12-07) · GitHub (código, segredos de CI) · e-mail da conta do dono (recuperação de todas as outras) · npm (cadeia de suprimento). Falha ou invasão dessas contas contorna os controles do §2.

## 5. Checklist do dono (fora do código)

- [ ] 2FA em GitHub, Vercel, Neon e no e-mail principal.
- [ ] Proteção do branch `main` (PR obrigatório, sem force-push).
- [ ] Alerta de gasto na Vercel e no Neon.
- [ ] Avaliar **Attack Challenge Mode** da Vercel (ligar durante ataque).
- [ ] Neon: conferir retenção do backup/PITR e **testar uma restauração** (em branch novo) antes de lead real.
- [ ] Rotacionar `BETTER_AUTH_SECRET`, `IP_HMAC_SECRET` e `DATABASE_URL` se vazarem ou a cada ano (trocar `IP_HMAC_SECRET` zera os contadores de limite); **trocar a senha inicial do admin** em `/admin/senha` (a de hoje é fraca e apareceu no chat).
- [ ] `npm audit` mensal; atualizar Next/React em correções de segurança.
- [ ] Confirmar `BETTER_AUTH_URL` em **https** na Vercel (é o que liga o prefixo `__Secure-`/Secure do cookie).
- [ ] Conferir a região da função (gru1 recomendado) e que logs da Vercel/Neon não guardam dado pessoal além do previsto.
