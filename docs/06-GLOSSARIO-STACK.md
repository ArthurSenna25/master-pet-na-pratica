# 06 · Glossário de Stack (v4)

**Quando ler:** só a linha da tecnologia em dúvida. Não leia o arquivo inteiro.
"Nível" = a partir de qual nível (`00`) a tecnologia é permitida sem justificativa extra. Versões: confirme no setup.

## Framework, estilo e componentes

| Tecnologia | Para quê | Nível | Regra/cuidado |
|---|---|---|---|
| Next.js (App Router) | Framework React; SSG/SSR; Server Actions | N0 | Server Components por padrão; 16.x usa `proxy.ts` no lugar de `middleware.ts` |
| TypeScript strict | Tipos | N0 | Nunca mascarar erro com `any`/`@ts-ignore`/`.d.ts` falso |
| Tailwind CSS v4 | CSS utilitário | N0 | Tokens via `@theme`, nunca hex cru no componente |
| shadcn/ui | Componentes acessíveis (Radix) copiados para o repo | N0 | Base dos componentes de função; instale só os usados |
| 21st.dev | Registry de componentes no formato shadcn | N1 | `npx shadcn add "https://21st.dev/r/{autor}/{componente}"`; revise o código |
| 21st.dev Magic MCP | Gera componente a partir de descrição (`/ui`) | N1 | Precisa de API key; peça componentes pequenos, não seções inteiras |
| Lightswind | Muitos componentes animados (Tailwind + Framer/GSAP) | N1 (vitrine) | Decoração; adapte cores aos tokens |
| ReactBits (+ MCP) | Componentes animados; MCP faz busca estruturada | N1 (vitrine) | Use o MCP em vez de navegar o site |
| Skiper UI | Componentes "incomuns" p/ shadcn (carrossel, preloader, micro-interações); `npx shadcn add @skiper-ui/<nome>` | N1 (vitrine) | Parte grátis, parte paga; seções-vitrine, não a base |
| Vengeance UI | Componentes animados open source (hover com deslocamento, tooltips, cards por scroll) | N1 (vitrine) | Variar repertório sem repetir efeitos |

## Animação

| Tecnologia | Para quê | Nível | Regra/cuidado |
|---|---|---|---|
| GSAP + ScrollTrigger | Orquestração de scroll e reveals | N0 | `gsap.matchMedia()` p/ reduced-motion; 1 timeline por seção |
| Motion (`motion`, import `motion/react`; antigo Framer Motion) | Animação declarativa | N2 (admin) | Se um tutorial citar `framer-motion`, é o nome antigo |
| React Spring | Física de mola (drag/swipe) | N2 | Só onde a física muda a percepção |
| Anime.js | Micro-interação isolada, fora de React | N1 | Não misture com GSAP na mesma seção |
| ShaderGradient | Fundo 3D animado | N1 (vitrine) | `next/dynamic({ ssr:false })`; 1 por página |
| Embla Carousel | Carrossel leve | N0 | Já usado por shadcn |
| dotLottie | Animação vetorial leve | N1 | Prefira `.lottie` a `.json` |
| Spline | Cena 3D | N2 (opcional) | Client-only, lazy |

## Dados, auth, segurança, mídia

| Tecnologia | Para quê | Nível | Regra/cuidado |
|---|---|---|---|
| Neon | Postgres serverless | N2 | Use a string "pooled" em serverless |
| Drizzle ORM | Schema e queries tipadas | N2 | Migrações versionadas; nunca editar migração aplicada |
| Better Auth (+ plugin Admin/RBAC) | Autenticação e papéis | N2 | RBAC desde o schema, mesmo com 1 usuário |
| Zod | Validação | N0 | Servidor sempre; client também em N2+ |
| React Hook Form | Formulários | N2 | Com resolver do Zod |
| Upstash Ratelimit | Rate limiting | N2 | Formulário público e login |
| Cloudinary | Upload/transformação de mídia | N2 (se upload) | Upload assinado |
| Resend + React Email | E-mail transacional | N0 | Verifique domínio (SPF/DKIM/DMARC) |
| exceljs | Planilhas | N2 | Nunca `xlsx`/SheetJS do npm (vulnerabilidades conhecidas) |

## Qualidade e deploy

| Tecnologia | Para quê | Nível | Regra/cuidado |
|---|---|---|---|
| ESLint + Prettier | Lint/format | N0 | Husky/lint-staged só em N2+ |
| Vitest | Testes de unidade/integração | N2 | Teste regra de negócio, não componente trivial |
| Playwright (+ MCP) | E2E e verificação visual real | N0 (screenshots) | Rode também no engine `webkit` |
| GitHub Actions | CI | N2 | lint, tsc, test, build |
| Vercel (+ Analytics/Speed Insights) | Deploy e métricas | N0 | Plano Hobby não é comercial: confira termos |
| Sentry | Erros em produção | N2 | Sem dados pessoais nos eventos |

## Ambiente do agente (não vai no package.json)

| Item | Função | Observação |
|---|---|---|
| Claude Code | Agente de código | Contexto é o recurso crítico (`10`) |
| Claude Design | Protótipo visual → handoff | `claude.ai/design`; conta no limite |
| superpowers | Metodologia: brainstorming, plano, TDD, debugging | Padrão para planejar/TDD |
| ponytail (`full`) | Solução mais simples (YAGNI) | Nunca `ultra` perto de auth/pagamento/dado sensível |
| Impeccable | Refino visual (`init`, `shape`, `audit`, `critique`, `polish`) | `init` por projeto |
| frontend-design, emil-design-eng, taste-skill | Apoio de design | Só se pedido |
| Graphify | Grafo local do código | Consultar em vez de reler tudo |
| Context7 | Docs atualizadas de bibliotecas | MCP remoto; não envie segredos nas consultas |
| Playwright MCP / Chrome DevTools MCP | Browser real / performance e debug | Playwright p/ WebKit |
| RTK | Comprime saída de comandos (hook no Bash) | `rtk bypass <cmd>` quando algo parecer cortado |
| ECC | Agentes/skills/comandos extras | Sobrepõe superpowers; ver precedência em `10` |
| claude-seo | SEO | Só com conteúdo real publicado |
| motiscope | Recria timing de animação de gravação | Opcional |
| extract-approach (skill local) | Documenta aprendizado em `learnings/` | Rodar após problema não trivial |
