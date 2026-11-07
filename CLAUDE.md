# CLAUDE.md — Master Pet na Prática
@docs/00-TRIAGEM-E-PROFUNDIDADE.md

## Contexto
Master Pet na Prática (Camila Becari): LP para captar donos de banho e tosa que querem acompanhamento presencial, com leads em banco e painel simples para a Camila. CTA único: "Quero conversar com a Camila". Nível: N2 enxuto (demo para fechar contrato; .vercel.app). Requisitos legais e de segurança: ver docs/_projeto/PRODUCT.md (RF-12 a RF-14, RNF-07/08).

## Comandos
dev: `npm run dev` · build: `npm run build` · lint: `npm run lint` · tipos: `npx tsc --noEmit` · testes: `npm test` (N2+)
Design: `docs/_projeto/DESIGN.md` · Plano e fases: `docs/_projeto/PLANO.md`

## Regras permanentes
- Profundidade proporcional ao nível. Nenhuma camada, lib ou dependência extra sem justificativa de 1 linha.
- Server Components por padrão; `"use client"` só com interatividade real.
- Valide toda entrada com Zod no servidor. Nunca interpole entrada em SQL.
- Nunca mascarar erro (`any`, `@ts-ignore`, `.d.ts` falso). Mesmo erro 3×: pare e diagnostique a causa raiz.
- Dependência: uma por vez; confirmar que o pacote existe e é o correto; validar antes da próxima.
- Nunca ler nem imprimir `.env`/chaves. Segredos só em `.env.local`.
- Seção visual pronta = screenshot Playwright (mobile + desktop) conferido, não "o código parece certo".
- Comando com saída longa: filtre. Em diagnóstico, se a saída parecer cortada, use `rtk bypass <cmd>`.
- Não faça extras fora do escopo; ideias vão para o Backlog em `docs/_projeto/PROGRESS.md`.

## Quando ler cada doc (só se o gatilho ocorrer)
requisitos/briefing → `docs/03` · visual/UI/motion/a11y → `docs/04` · stack/arquitetura → `docs/05` ·
banco (N2+) → `docs/07` · auth/forms com dados/upload/pagamento/LGPD → `docs/08` · QA/entrega → `docs/09` ·
planejamento N2+ → `docs/02` · tokens/ferramentas → `docs/10`.

## Fluxo por fase
Explorar (plan mode, se couber) → plano curto → implementar → verificar (build/lint/tsc + screenshot) → commit → atualizar `docs/_projeto/PROGRESS.md` (≤ 15 linhas) → `/clear` ao mudar de assunto.

## Ferramentas (precedência — ver docs/10 §7)
Plano/TDD/debug: superpowers · Código: Graphify · Docs de lib: Context7 · Visual: Claude Design → Impeccable/frontend-design · Verificação: Playwright (chromium + webkit) · ECC só quando pedido.
