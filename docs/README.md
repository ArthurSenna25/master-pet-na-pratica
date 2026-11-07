# docs/ — Base de conhecimento do projeto (v4 · nov/2026)

> **Para o Claude:** NÃO leia esta pasta inteira. No início do projeto leia só
> `00-TRIAGEM-E-PROFUNDIDADE.md`. Depois leia apenas o arquivo que o gatilho
> abaixo indicar. Cada arquivo começa com "Quando ler".
>
> **Para o humano:** copie esta pasta `docs/` para a raiz de cada projeto novo,
> copie `templates/CLAUDE.md.template` para a raiz como `CLAUDE.md`, e siga
> `01-FLUXO-DE-TRABALHO.md`.

## Roteador (gatilho → arquivo)

| Gatilho | Ler |
|---|---|
| Início de QUALQUER projeto, ou escopo mudou | `00-TRIAGEM-E-PROFUNDIDADE.md` (obrigatório) |
| Definir escopo, requisitos, MVP, briefing | `03-REQUISITOS-E-NEGOCIO.md` |
| Definir visual, copy, UI/UX, motion, acessibilidade | `04-DESIGN-UI-UX.md` |
| Escolher/alterar stack, estrutura de pastas, decisão técnica | `05-ARQUITETURA-E-STACK.md` |
| Detalhe de uma lib/ferramenta específica | `06-GLOSSARIO-STACK.md` (só a linha da lib) |
| Banco de dados, modelagem, migração (N2+) | `07-DADOS-E-BANCO.md` |
| Auth, formulário com dados pessoais, upload, pagamento, LGPD | `08-SEGURANCA-E-PRIVACIDADE.md` |
| Antes de entregar, QA, performance, cross-device, SEO | `09-QUALIDADE-E-ENTREGA.md` |
| Planejamento completo (N2+) | `02-PROTOCOLO-DE-PLANEJAMENTO.md` |
| Dúvida de como trabalhar / economizar tokens / qual ferramenta | `10-CLAUDE-CODE-E-TOKENS.md` |
| Fluxo do humano (fases, gates) | `01-FLUXO-DE-TRABALHO.md` (humano) |
| Livros, autores, estudo | `11-BIBLIOGRAFIA.md` (**só humano; Claude não lê**) |
| Precisa de modelo de documento/prompt | `templates/` |

## O que mudou em relação às versões anteriores

| Documento antigo | Agora |
|---|---|
| `PROMPT-MESTRE-NOVO-PROJETO.md` | `templates/00-BRIEFING-E-PROMPT-MESTRE.md` (enxuto, com níveis) |
| `PROTOCOLO-MESTRE-PLANEJAMENTO.md` | `02-PROTOCOLO-DE-PLANEJAMENTO.md` (proporcional ao nível) |
| `GLOSSARIO-STACK.md` | `06-GLOSSARIO-STACK.md` (+ nível mínimo de cada tecnologia) |
| `PROMPT-SETUP-GLOBAL.md` | `../_ambiente-global/PROMPT-SETUP-GLOBAL.md` (não vai nos projetos) |
| (novo) | 00, 01, 03, 04, 05, 07, 08, 09, 10, 11 e templates |

## Documentos vivos de cada projeto (criados durante o trabalho)

Ficam em `docs/_projeto/`: `PRODUCT.md`, `DESIGN.md`, `PROGRESS.md`, `decisions/`.
Se rodar `/impeccable init`, use o PRODUCT.md/DESIGN.md que ele gerar na raiz e
NÃO crie cópias em `docs/_projeto/`.
