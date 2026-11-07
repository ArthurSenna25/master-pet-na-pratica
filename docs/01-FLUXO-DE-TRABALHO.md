# 01 · Fluxo de Trabalho de um Projeto Novo (humano)

**Quando ler:** você, no início de cada projeto. O Claude não precisa ler este arquivo.

## Atalho N0 (landing page) — 11 passos

1. Escopo aprovado por escrito + entrada paga (`templates/proposta-escopo.md`).
2. Conteúdo real do cliente em mãos: textos, logo, fotos, provas.
3. Preencher o briefing (`templates/00-BRIEFING-E-PROMPT-MESTRE.md`, seções 1–5).
4. Claude Code em plan mode: "leia docs/00 e faça a triagem" → você aprova o bloco TRIAGEM.
5. Direção visual: cores, fontes, estilo, referências → Claude Design (3 direções) → escolher → cliente aprova.
6. Handoff para o Claude Code → `docs/_projeto/DESIGN.md` (tokens).
7. Plano de execução curto (3 fases) → você lê.
8. Scaffold + seções, uma por vez, com screenshot a cada seção.
9. Polimento (motion nível 1) + QA (`09`) + LGPD (`08` §LGPD).
10. Deploy, domínio, e-mail, analytics, entrega (`templates/checklist-entrega.md`).
11. Pós: suporte combinado, retro de 10 min, case de portfólio.

## Fases detalhadas

### Fase 0 — Venda e escopo (antes do Claude)
- Conversa de descoberta com as 12 perguntas de `03 §3`. Ouça mais do que fale.
- Proposta por **pacote/valor**, não por hora (a IA reduz seu tempo, não o valor para o cliente).
- Escreva: objetivo e como medir, entregáveis, **fora de escopo**, nº de rodadas de revisão, prazos, pagamento, responsabilidades do cliente (conteúdo, aprovações em X dias), domínio/hospedagem/propriedade, manutenção, quem é o controlador dos dados (LGPD).
- Congele o conteúdo v1. Sem conteúdo real o design vira palpite e o retrabalho dispara.
- **Gate:** escopo aprovado por escrito + entrada.

### Fase 1 — Briefing (15–30 min)
Preencha as seções 1–5 do briefing. Campo vago → o Claude pergunta (em lote pequeno), não inventa marca.

### Fase 2 — Triagem (Claude Code, plan mode)
Prompt: `Leia docs/00-TRIAGEM-E-PROFUNDIDADE.md e meu briefing. Faça a triagem no formato obrigatório e espere meu OK.`
**Gate:** você aprova ou corrige nível, escopo e "fora de escopo".

### Fase 3 — Direção visual (a mais importante para o cliente)
**3.1 Você decide (30 min):** 3 referências (sentimento, não layout) + 2 anti-referências; paleta com nomes (base, texto, destaque, apoio) e contraste AA; 2 fontes (display + corpo); 3 adjetivos de tom; 1 elemento-assinatura ligado à narrativa do negócio.
**3.2 Claude Design (`claude.ai/design`):**
a) crie o design system do projeto (logo, cores, fontes, 1–2 referências);
b) use `templates/prompt-claude-design.md` (Objetivo + Layout + Conteúdo + Público + restrições);
c) peça **3 direções**; compare;
d) escolha 1 e refine em **até 3 rodadas**, uma mudança por mensagem;
e) mostre ao cliente (link/print).
Obs.: o uso conta no seu limite do plano; faça pouco e bem.
**3.3 Handoff:** exporte o pacote de handoff para o Claude Code (ou HTML/PDF) e peça: `Leia o handoff e extraia os tokens para docs/_projeto/DESIGN.md (máx. 60 linhas).`
**Gate:** visual aprovado (você + cliente, se houver). **Nada de código de seção antes disso.**

### Fase 4 — Plano de execução (plan mode)
Fases com critério objetivo de pronto + estimativa de sessões. Edite o plano (Ctrl+G) se preciso. **Gate:** você leu e aprovou.

### Fase 5 — Scaffold (1 sessão curta)
`create-next-app` + Tailwind + shadcn init; tokens do `DESIGN.md` no `@theme`; fontes via `next/font`; layout base. Validar: `tsc --noEmit`, lint, build. Commit.

### Fase 6 — Construção (loop por seção)
Para cada seção: implementar (`templates/prompt-fase-execucao.md`) → verificar (screenshot mobile + desktop, build/lint/tsc) → commit. Mobile-first. `/clear` a cada 2–3 seções ou ao mudar de assunto. Sem animação nesta fase.
**Gate:** primeira versão responsiva funcionando → mostre ao cliente.

### Fase 7 — Motion e polimento
Aplique o nível de motion da triagem. Uma passada de refino (ex.: impeccable audit/polish), não infinitas. Respeite `prefers-reduced-motion`.

### Fase 8 — QA e segurança
Checklist do nível (`09`), segurança (`08`), matriz de dispositivos (teste em celular real quando puder), Lighthouse, acessibilidade, LGPD (política, consentimento, cookies).

### Fase 9 — Revisão final
N2+: revisão independente (subagente/skill de code review). Você lê o diff das partes sensíveis (auth, formulários, pagamentos, permissões).

### Fase 10 — Entrega
Deploy, domínio/DNS, e-mail transacional, analytics, backup, handoff ao cliente (como editar, contatos, acessos pelo gerenciador de senhas), termo de aceite, cobrança. Use `templates/checklist-entrega.md`.

### Fase 11 — Pós-projeto
Janela de suporte combinada (só ajustes pequenos) · retro de 10 min ("o que travou? o que repetir?") · `extract-approach` do que foi aprendido · atualizar este fluxo · case de portfólio (prints + métrica) · pedir depoimento · oferecer manutenção.

## Checkpoints humanos (não pule)
Após a triagem · após o visual · após o plano · após a 1ª versão responsiva · antes do deploy.

## Prazos indicativos (meça no seu consumo real e ajuste)

| Nível | Janelas de 5 h do Claude | Calendário (com idas e vindas do cliente) |
|---|---|---|
| N0 | 1–3 | 1–3 dias |
| N1 | 5–12 | 1–2 semanas |
| N2 | 15–30 | 3–6 semanas |
| N3/N4 | dezenas+ | meses (o plano Pro tende a ser pouco) |

Depois do 1º projeto, anote aqui o % da semana consumido por tipo de entrega.
