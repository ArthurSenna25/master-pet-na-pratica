# 03 · Requisitos, Elicitação e Negócio

**Quando ler:** ao definir escopo, briefing, requisitos ou MVP. Proporcional ao nível (`00`).

## 1. Princípios

- **Problema antes de solução.** Requisito descreve necessidade verificável, não tecnologia ("o visitante agenda em 2 cliques", não "usar Calendly").
- **Níveis de requisito** (Wiegers): de negócio (por que existe) → de usuário (o que as pessoas fazem) → funcionais (o que o sistema faz) + atributos de qualidade + restrições.
- **Atividades** (Sommerville): elicitação e análise → especificação → validação → gestão de mudanças. Elas se repetem; não são uma cascata.
- **Um bom requisito é** (ISO/IEC/IEEE 29148): necessário, não ambíguo, completo, singular (uma ideia só), viável, verificável, correto e consistente com os demais.
- **Palavras proibidas sem número:** rápido, fácil, moderno, amigável, seguro, escalável. Troque por medida ("LCP ≤ 2,5 s no 4G", "cadastro em ≤ 3 campos").

## 2. Técnicas de elicitação (use as poucas que couberem)

| Técnica | Em projeto de freela |
|---|---|
| Entrevista | Principal. 30–45 min com o dono do negócio; roteiro no §3 |
| Análise de documentos e concorrentes | Site atual, Instagram, 3 concorrentes, materiais de venda |
| Observação | Ver como o cliente atende hoje (WhatsApp, agenda, planilha) |
| Prototipagem | Claude Design com 3 direções: mostrar vale mais que descrever |
| Workshop | N3/N4 com várias pessoas; 1 sessão curta, com decisor presente |
| Questionário | Só se houver público grande para ouvir; senão evite |
| Brainstorming | Para funcionalidades (N2+); depois priorize, não implemente tudo |

**Regras de entrevista (The Mom Test, Fitzpatrick):** pergunte sobre a vida e o passado da pessoa, não sobre sua ideia; peça fatos específicos ("como foi a última vez que um cliente pediu orçamento?"), não opiniões hipotéticas ("você usaria?"); fale menos, ouça mais; elogio e promessa vaga não são dados.

## 3. As 12 perguntas do briefing

1. Qual o objetivo de negócio e como medir (leads/mês, agendamentos, vendas)?
2. Qual a **ação única** que o visitante deve fazer (CTA principal)?
3. Quem é o público (1–3 personas: quem é, o que busca, como decide, objeção)?
4. O que o negócio faz e qual o diferencial **real**?
5. Provas disponíveis (depoimentos, números, certificações, clientes, antes/depois)?
6. Três referências (sentimento) e duas anti-referências?
7. Conteúdo existente (textos, fotos, logo, vídeo) e quem produz o que falta?
8. Tom de voz (3 adjetivos) e restrições de marca?
9. Integrações (WhatsApp, agenda, pagamento, CRM, newsletter, pixels)?
10. Prazo (e por quê) e orçamento?
11. Quem mantém depois? O cliente edita conteúdo? Hospedagem e domínio?
12. Restrições legais (dados pessoais; profissões com regras de publicidade, como saúde e advocacia — confirme com o cliente)?

## 4. Modelagem de negócio (leve, quando o projeto é produto/serviço novo)

- **Business Model Canvas** (Osterwalder & Pigneur): 9 blocos; uma página.
- **Value Proposition Canvas**: tarefas, dores e ganhos do cliente × como a oferta alivia/gera.
- **Lean Canvas** (Maurya): troca blocos por problema, solução, métricas e vantagem injusta; bom para ideias novas.
- **Impact Mapping** (Adzic): objetivo → atores → impactos → entregas. Impede construir o que não move o objetivo.
- **Jobs To Be Done**: "quando [situação], quero [motivação], para [resultado]".
- **Métrica de sucesso:** landing = taxa de conversão (leads ÷ visitas); site institucional = contatos qualificados; produto = ativação e retenção. Defina antes de projetar.

## 5. Especificação por nível

| Nível | Documento |
|---|---|
| N0 | **Brief de 1 página** (`templates/PRODUCT.md.template`, versão curta): objetivo, CTA, público, seções, conteúdo, premissas, fora de escopo |
| N1 | + sitemap e histórias curtas |
| N2 | + RF/RNF numerados, MoSCoW, critérios de aceite, rascunho do modelo de dados |
| N3 | + casos de uso, regras de negócio, fluxos de estado, glossário do domínio, riscos |
| N4 | + modelagem de domínio (linguagem ubíqua, contextos delimitados) antes do design |

## 6. Histórias e critérios de aceite (N1+)

- Formato: "**Como** [persona], **quero** [ação], **para** [benefício]".
- **INVEST:** independente, negociável, valiosa, estimável, pequena, testável.
- Aceite em Given/When/Then: *Dado* que estou no formulário, *quando* envio com e-mail inválido, *então* vejo o erro no campo e nada é enviado.
- **Definition of Ready:** critério de aceite escrito, conteúdo disponível, dependências conhecidas.

## 7. Priorização e MVP

- **MoSCoW:** Must (sem isso o cliente não paga/aprova), Should, Could, Won't (agora). Em freela, escreva o Won't: é seu "fora de escopo".
- Outras: Kano (encantar × obrigatório), RICE (produto), valor × esforço.
- **MVP** (Ries) é o menor experimento que valida a hipótese principal, não uma versão ruim. Defina a hipótese ("se X, então Y mede Z") antes de listar funcionalidades.
- **Walking skeleton** (Cockburn): primeiro uma fatia fina ponta a ponta (formulário → banco → e-mail), depois engorde.
- **Appetite** (Shape Up, Basecamp): decida quanto tempo vale gastar e ajuste o escopo ao prazo, não o contrário.

## 8. Gestão de mudanças (proteção do seu tempo)

Baseline = escopo aprovado. Pedido novo → registrar → estimar impacto (nível, prazo, custo) → decisão do cliente **por escrito** → só então entra. Rodadas de revisão são limitadas e contadas. Registre premissas e aprovações no `PROGRESS.md`.

## 9. Anti-padrões
Gold plating (extras não pedidos) · requisito = solução ("use carrossel") · ambiguidade sem número · escopo sem "fora de escopo" · conteúdo "depois" · aprovar visual com lorem ipsum · aceitar mudança de escopo por mensagem informal.
