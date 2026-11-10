# PROGRESS — Master Pet na Prática (≤ 40 linhas; o Claude lê só isto ao retomar)
**Nível:** N2 enxuto (sobe p/ N3 se: área de aluno, pagamento ou >1 usuário com permissões) · **Fase:** F5b c4 feito (sem push) · F1–F5 ✔ → **F6** (QA/legais/deploy)

## Feito
- F1–F3: Next 16.4.5 + Paleta B; LP estática (CSS do handoff intacto em `app/landing/`); gsap: `LandingFx` cria cenas de `app/_fx/`, pin só ≥900x720; hash+pins corrigidos em `_fx/hash.ts`. CLS 0, `node qa/fx-check.mjs <url>`.
- F4: Neon+Drizzle (`getDb()`), Better Auth (signup off, cookie path=/admin, `requireSession()` em toda página/action admin), `enviarLead` (honeypot→Zod→IP HMAC→limite 5/10 min→`db.batch`), `anonimizarLead`, `LeadForm` (3 passos só pós-hidratação), regras únicas `lead-rules.ts`, 8 CHECKs+triggers, DECISOES-LGPD.md 0.2. **Migrações 0000–0006 SÓ no branch teste do Neon (expira 2026-12-07); produção sem migração.**
- F5: `/admin` (URL como estado q/status/ordem/pagina), detalhe+status+observação, excluir/anonimizar em 2 passos por GET (sem JS), CSVs (`leads.csv`, `auditoria.csv`) e `decisoes-lgpd` com `registrarExportacao`, WhatsApp no servidor, `negarSeSemSessao` (401/403). Links de download = `<a>` (Link faria prefetch e gravaria export).
- F5b c1–c3: login Zod+msg única+CHECK de e-mail; chips/Limpar filtros; modal por intercepting route `@modal/(.)lead/[id]` + `<dialog>` nativo, `prefetch={false}`. Armadilhas: `main section:not(.lp-hero)` do landing-v6.css afeta `<section>` no admin (usar div role=region); sem preflight (`box-border`); Safari não dá Tab em links; `getByRole("alert")` pega o route announcer; matar :3000 antes de e2e após rebuild.
- **F5b c4 (design admin):** cabeçalho navy-900 (“Painel”, e-mail da sessão só renderizado, `data-admin-email`, nunca logado) + barra de exportações/Sair + aviso de dado pessoal; cartões de resumo clicáveis com selo cor+ícone+texto; bloco único busca/filtros/ordem/contador/chips; ≥900 px `<table>` (caption sr-only, th scope=col, 6 colunas), <900 cartões; os dois blocos existem no HTML e um fica `display:none` (sem foco/leitor duplicado); 1 link por lead (`::after` na `tr`, clique na célula testado com mouse real), WhatsApp 2º foco. Arquivos: `ui.tsx`, `LeadsLista.tsx`, `error.tsx` (texto fixo). Tailwind só no admin; classes `!text-` no cabeçalho porque `h1`/`a` globais (sem camada) vencem utilitárias.
- **NÃO há `loading.tsx` de propósito:** a fronteira de Suspense faz o React transmitir o conteúdo oculto, que só um script revela → /admin e a confirmação “sem JS” ficavam vazios (4 testes falharam, voltaram a passar sem ele). Reavaliar só se o sem-JS deixar de ser requisito.
- Screenshots (e-mail coberto por `mask`): antes/depois em chromium+webkit, 390 e 1440 (specs `admin-lista` e `admin-modal`; `SHOT_DIR=<pasta>`).

## Contraste (WCAG, calculado 2026-11-10; todos ≥ 4,5:1)
Cabeçalho: beige-50/navy-900 16,42 · beige-200/navy-900 13,03 · foco gold-400/navy-900 8,06. Selos (texto/fundo): Novo navy-900/blue-100 14,14 · Em contato #5c3d00/#f6e7bd 8,05 · Convertido success/success-bg 5,54 · Não convertido danger/danger-bg 5,70. Cartões e tabela: navy-900/branco 17,87 · ink-muted/branco 7,70 · ink-muted/slate-50 7,36 · ink-muted/blue-100 6,09 · link blue-600/branco 7,80 · cabeçalho de tabela navy-900/#eef2f7 15,89.

## Pesquisa c4 (web, 2026-11-10; fontes de blog/vendor, não normativas)
- Tabela: caption descritiva como 1º filho + `scope` nos th; para cartões, manter a associação cabeçalho↔valor.
- Rolagem horizontal com semântica de tabela é a opção mais acessível quando a largura cabe; aqui <900 usa cartões sem tabela.
- Berkeley DAP desaconselha envolver o cartão todo num `<a>`: usamos 1 link com aria-label + `::after` (o texto do link é só o nome).
- `<dialog>`+`showModal()` nativo: foco entra, volta ao gatilho ao fechar, `aria-labelledby` no título (já é assim).
- Não achei fonte sobre “linha inteira clicável”; referências primárias: W3C WAI Tables Tutorial e APG (dialog).
- Dashboard: resumo → filtros → lista, estado na URL; nunca só cor para status (feito).

## Pendências / bloqueios
- Legais [PENDENTE]: controladora (razão social/CNPJ/endereço) · ME/EPP · hospedagem/região da função (Vercel, conferir iad1) · transferência internacional (art. 33) · retenção (incl. audit_log, admin_events) · e-mail do titular · encarregado · TERMOS (responsável, marca/imagens, foro, contato). Revisão jurídica antes de lead real. Camila: preço · encontros · FAQ · wordmark · regiões · texto de “Camila em ação”.
- IP do login em texto puro no Better Auth (`session.ip_address`, `rate_limit_auth.key`; política 0.2 diz a verdade): hook de sessão e `customStorage`+HMAC são possíveis (ver DECISOES-LGPD). Também: `BETTER_AUTH_URL` de produção · `npm audit` · logs Vercel/Neon fora do painel (registrar no DECISOES-LGPD).
- F6: migrações 0004–0006 NÃO estão na produção; lead “First Teste” é manual (limpar antes de produção); seed de testes usa prefixo `zz-teste-` e se limpa sozinho.

## Backlog: (vazio)
## Consumo — F1 ≈ US$ 6–7 · F2 63% · F4 24%→45% (c4b/c5 fim não medido) · F5 c1 17→21%, c2 21→34% · F5b c1–c3 14→21% · F5b c4: início 21%; janela informada “não medida”.
