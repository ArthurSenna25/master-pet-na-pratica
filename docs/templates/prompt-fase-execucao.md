# Prompt de fase de execução (genérico + prontos para N0)

Regras: 1 fase = 1 sessão. Cite arquivos com `@`. Sempre inclua **critério de pronto verificável** e **fora de escopo**. Não reexplique contexto: o `CLAUDE.md` e o `PROGRESS.md` já têm.

## Molde
```
FASE: [nome]
OBJETIVO: [resultado observável em 1–2 frases]
CONTEXTO: leia só @docs/_projeto/PROGRESS.md e @[arquivos relevantes]
FAÇA: [lista curta e específica]
FORA DE ESCOPO: [o que NÃO fazer]
PRONTO QUANDO: tsc --noEmit, lint e build passam; [comportamento]; screenshot mobile+desktop conferido
AO TERMINAR: atualize docs/_projeto/PROGRESS.md (≤ 15 linhas) e faça commit.
```

## N0 — prontos
**1. Scaffold**
```
FASE: Scaffold. OBJETIVO: projeto Next.js (App Router, TS strict, Tailwind v4) rodando com os tokens do @docs/_projeto/DESIGN.md em @theme, fontes via next/font, layout base e shadcn init (nenhum componente ainda). FORA DE ESCOPO: banco, auth, animação, seções. PRONTO: tsc/lint/build ok; página em branco com tipografia e cores corretas.
```
**2. Seção (repita por seção)**
```
FASE: Seção [hero]. OBJETIVO: implementar a seção conforme @docs/_projeto/DESIGN.md e o handoff, mobile-first, com copy real de @[arquivo]. FORA DE ESCOPO: animação, outras seções. PRONTO: responsivo em 390/768/1440; foco visível; contraste AA; screenshots conferidos.
```
**3. Formulário**
```
FASE: Formulário. OBJETIVO: formulário de contato com Zod no servidor (Server Action), honeypot + limite de envio, envio por Resend (ou link WhatsApp), mensagens de erro/sucesso, checkbox de consentimento não pré-marcado com link para a política. PRONTO: testado ponta a ponta (válido, inválido, spam); nenhum segredo no repo.
```
**4. Motion nível 1**
```
FASE: Motion. OBJETIVO: reveals por seção com GSAP+ScrollTrigger conforme DESIGN.md, com gsap.matchMedia() para reduced-motion; animar só transform/opacity. FORA DE ESCOPO: 3D, scroll-vídeo, outras libs. PRONTO: sem layout shift; CLS/INP não pioram no Lighthouse.
```
**5. SEO, privacidade e QA**
```
FASE: QA. OBJETIVO: metadata/OG/sitemap/robots/lang pt-BR, política de privacidade e banner de cookies (rejeitar fácil; analytics só após consentimento), headers de segurança, Lighthouse mobile, axe, Playwright webkit. Siga docs/09 (N0) e docs/08 §N0/N1. PRONTO: checklist do N0 completo; liste o que falhou.
```
**6. Deploy** — use `checklist-entrega.md`.
