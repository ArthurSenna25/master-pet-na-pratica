# 10 · Como o Claude trabalha: contexto, tokens e ferramentas

**Quando ler:** dúvida sobre como conduzir a sessão, economizar tokens ou qual ferramenta usar. O essencial já está no `CLAUDE.md`.

## 1. Fato central
O contexto é o recurso mais importante: cada mensagem, arquivo lido e saída de comando entra nele, e o desempenho cai conforme enche (documentação oficial do Claude Code). No plano Pro, o limite de uso também é compartilhado com o claude.ai. Economizar contexto = qualidade + limite.

## 2. Regras de economia (obrigatórias)
1. **Profundidade proporcional** ao nível (`00`). É a maior economia.
2. Não releia arquivos grandes; busque com `rg`/Graphify; leia trechos (`view_range`). Não liste árvores inteiras.
3. Filtre saída de comandos (`| head`, `--quiet`). O RTK comprime saída automaticamente; se algo parecer **cortado** em diagnóstico, rode com `rtk bypass <cmd>`.
4. Dependência: uma por vez, só se necessária, e confirmando que o pacote existe e é o correto.
5. **Uma fase por sessão.** `/clear` ao trocar de assunto; `/compact` com instrução do que preservar em sessões longas; `/context` para ver o consumo.
6. Termine cada fase atualizando `docs/_projeto/PROGRESS.md` (≤ 15 linhas: feito, próximo, decisões, pendências). A próxima sessão lê só isso.
7. Plan mode quando a mudança tem várias etapas, toca vários arquivos ou é desconhecida. Se o diff cabe em uma frase, **pule o plano**.
8. Investigação ampla (ler muito código) vai para **subagente**: ele gasta o contexto dele e devolve um resumo.
9. Não explique o que não foi pedido; resposta curta para tarefa curta.

## 3. Como pedir (prompts que funcionam)
- **Específico:** arquivo (`@caminho`), comportamento esperado, restrições, "fora de escopo".
- **Com verificação:** diga como provar que funcionou (comando, teste, screenshot). Dar ao Claude um jeito de se verificar é o maior multiplicador de qualidade.
- **Bug:** descreva o sintoma, o lugar provável e o erro exato; peça causa raiz antes de corrigir.
- **Referências:** aponte um componente existente como padrão em vez de descrever o estilo.
- **Rédea:** corrija cedo e com frequência; interrompa e redirecione em vez de deixar seguir errado.

## 4. Modelo e esforço
Sonnet para quase tudo; modelos maiores (mais caros no limite) só para arquitetura difícil, bug obscuro ou planejamento N3+. Reduza o esforço/pensamento em tarefa simples (`/model`). O Fable não está no uso incluído no Pro (roda em créditos pagos); confira o que o seu plano cobre em `/model`.

## 5. Anti-loop e honestidade
Mesmo erro 3×: pare, diagnostique a causa raiz, mostre ao humano. Nunca mascarar erro (`any`, `@ts-ignore`, `.d.ts` falso, apagar teste). Se não tem certeza de que algo funciona, diga e verifique; não afirme "pronto" sem evidência (build, teste, screenshot).

## 6. Vibe coding profissional
O termo (Karpathy, 2025) descreve "se entregar às vibrações" sem ler o código. Para trabalho de cliente, o padrão é **engenharia assistida por IA**: você continua responsável. Passos pequenos, diff lido nas partes sensíveis, testes como rede de segurança, commits frequentes, checkpoints (`/rewind`) para desfazer.

## 7. Precedência entre ferramentas (padrão sugerido — alinhe ao seu CLAUDE.md global)

| Tarefa | Use | Não use junto |
|---|---|---|
| Brainstorm / plano | superpowers (brainstorming, planos) | `ecc` planner |
| TDD / debugging | superpowers | `ecc` tdd-guide |
| Mapa do código | Graphify | releitura por grep amplo |
| Doc de biblioteca | Context7 | memória do modelo |
| Visual: forma e refino | Claude Design → Impeccable (`shape`, `audit`, `polish`) + frontend-design | taste/emil, salvo pedido |
| Verificar UI | Playwright (webkit) | "parece certo" |
| Perf/debug de página | Chrome DevTools MCP | — |
| Revisão final N2+ | subagente/skill de code review | — |
| Segurança, build-fix, varredura | ECC (`/security-scan`, `/build-fix`) quando pedido | — |

**Conflito conhecido:** as regras `common/` do ECC mandam usar o `planner` e o `tdd-guide` dele, enquanto a tabela acima prefere o superpowers. Decida uma vez, num projeto real: rode uma tarefa pequena com cada um, escolha o que rendeu melhor e registre a decisão no `CLAUDE.md` global. Enquanto não decidir, siga esta tabela.

**N0/N1:** use no máximo superpowers (brainstorming leve) + frontend-design/Impeccable + Playwright. Nada de acionar 5 plugins por tarefa.

## 8. Hooks e permissões
Hooks de plugins (ECC GateGuard, RTK) rodam em chamadas de Bash; o primeiro Bash da sessão pode pedir fatos antes de liberar — informe-os e repita. Em instalações, mantenha o modo manual de permissão. Não desligue hooks de segurança por conveniência.

## 9. Sessão típica (N0)
Triagem (plan mode) → aprovar → scaffold → seção 1 → verificar → commit → seção 2 → ... → `/clear` → QA → deploy. Cada passo cita este fluxo, não o reexplica.
