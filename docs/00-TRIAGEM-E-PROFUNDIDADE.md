# 00 · Triagem e Profundidade — LEIA PRIMEIRO

**Quando ler:** início de todo projeto; sempre que o escopo mudar.

## Princípio

Entregue o **menor processo que produz um resultado correto, seguro e bonito
para ESTE projeto**. A profundidade é proporcional a risco, valor e vida útil.
Mais camadas não são mais qualidade: são mais tokens, mais prazo e mais
superfície de bug. Capacidade do Claude não é motivo para complexidade.

## 1. Classifique (5 perguntas)

1. Há dados que persistem (banco) além de enviar um formulário?
2. Há login de alguém além do dono/admin?
3. Há dinheiro, dado sensível (saúde, financeiro, menores) ou obrigação legal pesada?
4. Quantas telas/fluxos distintos existem e quem mantém depois?
5. Qual a vida útil: demo de dias, campanha de meses, produto de anos?

## 2. Níveis

| Nível | Exemplos | Stack | Planejamento (entregáveis) | Segurança mínima | QA mínimo | Motion |
|---|---|---|---|---|---|---|
| **N0 Página única** | landing page, one-pager, convite, link-in-bio | Next.js (SSG) + Tailwind + shadcn só do usado · sem banco · formulário → e-mail/WhatsApp | Brief de 1 página + direção visual aprovada | Headers, Zod no servidor, anti-spam, LGPD básico | build + lint + tsc + screenshots mobile/desktop + Lighthouse | Nível 1 |
| **N1 Site institucional** | 3–8 páginas, blog opcional, contato | N0 + MDX/conteúdo em arquivo, SEO | Brief + sitemap + `DESIGN.md` | igual N0 | N0 + matriz de dispositivos | Nível 1 (2 se vitrine) |
| **N2 Site/app com admin e banco** | leads em banco, CRUD, upload, painel | N1 + Neon + Drizzle + Better Auth + Upstash (+ Cloudinary/Resend só se usar) | Requisitos RF/RNF (MoSCoW) + modelo de dados + fases | ASVS L1, RBAC, authz em toda action/rota | + Vitest da lógica + Playwright nos fluxos críticos | 1–2 público · lib Motion no admin |
| **N3 Aplicação com usuários finais** | login, papéis, assinatura/pagamento, regras de negócio | N2 + billing, jobs, Sentry, CI | + casos de uso, regras de negócio, ADRs, riscos | ASVS L2 nas partes sensíveis | + integração, webhooks idempotentes | conforme produto |
| **N4 Sistema complexo** | multi-tenant, integrações críticas, dado sensível | N3 + modelagem de domínio, filas, DR | Modelagem de domínio ANTES do design; threat model; metas de disponibilidade | ASVS L2/L3 + threat model | + carga leve, backup/restore testado | conforme produto |

Se hesitar entre dois níveis, escolha o menor e registre o gatilho que subiria.

## 3. Orçamento de profundidade

| Nível | Perguntas ao humano (máx.) | Docs de planejamento | ADRs | Fases | Dependências além do padrão |
|---|---|---|---|---|---|
| N0 | 5 | 1 (brief) | 0 | 3 | 0 |
| N1 | 8 | 2 | 0–1 | 4 | ≤ 3 |
| N2 | 12 (em lotes) | 4 | só decisões irreversíveis | 5–6 | justificar cada |
| N3/N4 | em lotes por tema | completos | por decisão | 7+ | justificar cada |

## 4. Proibido por padrão em N0/N1

Banco/ORM · autenticação · Docker · monorepo · microsserviços · gerenciador de
estado global · camadas `actions/` e `lib/db` · testes unitários de componente
trivial · CI elaborado · i18n com um idioma só · tokens de 3 camadas · Storybook ·
Three.js/ShaderGradient/scroll-vídeo sem pedido explícito do humano · bibliotecas
de animação extras além da escolhida · "arquitetura de pastas" sofisticada.

## 5. Premissa em vez de pergunta

Se a resposta não muda nível, identidade visual, prazo ou custo: **assuma**,
registre em "Premissas" no brief e siga. Pergunte só o que muda essas quatro coisas.

## 6. Saída obrigatória da triagem (≤ 12 linhas; espere 1 OK)

```
TRIAGEM
Nível: N_ — motivo em 1 linha
Entrega: 3–5 itens
Fora de escopo: o que NÃO será feito
Stack: ...
Docs que vou ler: ...
Fases: ... (critério de pronto de cada)
Premissas: ...
O que subiria o nível: ...
Estimativa de sessões: ... (indicativa)
```

## 7. Mudança de escopo

Se surgir algo que sobe o nível ("área do cliente", "pagamento online", "login"):
**PARE**, diga o novo nível, o que passa a ser exigido e o impacto em prazo/sessões,
e peça decisão antes de continuar. Registre em `PROGRESS.md`.

## 8. Regra de parada

Pronto = critérios do nível em `09` atendidos. Não adicione extras depois. Ideias
de melhoria vão para "Backlog" no `PROGRESS.md`, não para o código.
