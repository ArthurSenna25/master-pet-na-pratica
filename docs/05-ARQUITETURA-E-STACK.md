# 05 · Arquitetura e Stack

**Quando ler:** ao escolher ou mudar stack, estrutura de pastas ou tomar decisão técnica.
Em N0/N1 basta §1 e §3 (linhas N0/N1).

## 1. Princípios

- **Arquitetura = decisões caras de reverter.** Invista pensamento nelas (banco, auth, hospedagem, billing, fronteiras de módulo); o resto se muda barato.
- **Atributos de qualidade guiam a arquitetura** (ISO/IEC 25010): adequação funcional, desempenho, compatibilidade, usabilidade, confiabilidade, segurança, manutenibilidade, portabilidade. Escolha os 2–3 que importam neste projeto e declare-os.
- **Simplicidade primeiro (KISS/YAGNI).** Monólito modular antes de microsserviços. Padrão de projeto só se resolver problema concreto.
- **Evolutiva** (Ford/Parsons/Kua): comece simples, proteja com testes e fitness checks, evolua quando a dor aparecer.
- **Separação por responsabilidade** (Martin, Fowler): domínio/regra de negócio não depende de framework/UI; dependências apontam para dentro.
- **DDD** (Evans) só em N3/N4: linguagem ubíqua, contextos delimitados, agregados; em N0–N2 é exagero.
- **Documente o necessário:** C4 (Brown) — diagramas de contexto e containers apenas em N2+; ADR para decisões irreversíveis.

## 2. Estrutura de pastas

- **N0/N1 (plana):** `app/`, `components/`, `lib/` (utilitários), `public/`. Sem `actions/`/`db`.
- **N2+ (camadas):** `app/` (rota/UI) → `actions/` (caso de uso, valida com Zod, checa permissão) → `lib/db` (dados). Server Components por padrão; `"use client"` só com interatividade real. Regra de negócio em funções puras testáveis.

## 3. Stack padrão por nível (verifique versões atuais no setup)

| Camada | N0 | N1 | N2 | N3/N4 |
|---|---|---|---|---|
| Framework | Next.js (App Router) SSG, TypeScript strict | idem | idem | idem |
| Estilo/UI | Tailwind v4 + shadcn/ui só do usado | idem | idem | idem + doc de componentes |
| Conteúdo | arquivos/props | MDX ou headless CMS se o cliente edita | CMS ou painel próprio | idem |
| Dados | — | — | Neon (Postgres) + Drizzle | + filas/jobs, DR |
| Auth | — | — | Better Auth + RBAC (admin) | + MFA, papéis múltiplos |
| Validação | Zod (servidor) | idem | Zod client+server + React Hook Form | idem |
| E-mail | Resend (ou WhatsApp link) | idem | Resend + React Email | idem |
| Anti-abuso | honeypot/Turnstile | idem | Upstash Ratelimit | + limites por usuário |
| Mídia | `next/image` | idem | Cloudinary (se upload) | idem |
| Pagamento | — | — | — | gateway (ex.: Stripe, Mercado Pago, Pagar.me, Asaas) |
| Observabilidade | Vercel Analytics | + Speed Insights | + Sentry | + logs estruturados, alertas |
| Testes | build/lint/tsc + screenshots | idem | + Vitest + Playwright E2E | + integração, contrato |
| CI | — | opcional | GitHub Actions (lint, tsc, test, build) | + deploy previews, checks de segurança |

Não adicione o que não usa. Cada dependência extra: justificativa em uma linha; confirme que o pacote existe e é o correto (cuidado com nomes parecidos).

## 4. Notas sobre Next.js 16.x

- Turbopack é o bundler padrão; o React Compiler está estável; `middleware.ts` foi substituído por `proxy.ts` (há codemod: `npx @next/codemod@canary upgrade latest`). Leia o guia de upgrade antes de migrar.
- Cache é explícito (Cache Components). Páginas de marketing: estático/ISR; dinâmico só onde precisa.
- **Nunca use `proxy`/middleware como única camada de autorização** (vide CVE-2025-29927). Autorize em cada action e route handler.
- Node: use uma versão LTS suportada pela versão do Next.

## 5. Hospedagem e custo

- O plano gratuito (Hobby) da Vercel é para uso pessoal/não comercial; para site de cliente que gera receita confira os termos atuais (plano pago ou outra hospedagem). Isso entra no orçamento e na proposta.
- Considere lock-in (Edge/KV proprietários), limites de funções/banda e onde ficam os dados (LGPD).
- Domínio, DNS e e-mail transacional (SPF/DKIM/DMARC) são parte da entrega, não detalhe.

## 6. Decisões: como decidir
1. Liste 2–3 alternativas reais. 2. Critérios (atributos de qualidade, custo, curva, risco). 3. Escolha a mais simples que atende. 4. Se for cara de reverter (N2+), ADR de 10 linhas. 5. Registre o gatilho que faria revisitar ("se passar de X usuários / se o cliente pedir login").

## 7. Integrações comuns
WhatsApp (link click-to-chat), agenda (Calendly/Cal.com), CRM/planilha via webhook, Meta Pixel/GA4 (**só após consentimento** — ver `08`), mapas (embed leve, carregue sob demanda).
