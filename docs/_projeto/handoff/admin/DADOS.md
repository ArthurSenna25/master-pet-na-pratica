# DADOS — elemento exibido → campo real

Campos reais do lead: `nome, whatsapp, cidade/UF, negocio, tempo_funcionamento, equipe, maior_desafio, ja_fez_mentoria, mensagem (opcional), status (novo | em_contato | convertido | nao_convertido), observacao, origem (URL), criado_em, atualizado_em, anonimizado_em`.
"Derivado" = calculado no servidor a partir dos campos reais, sem coluna nova.

## Visão geral
| Elemento | Origem |
|---|---|
| Novos hoje | derivado: count(criado_em ≥ 00:00 de hoje, fuso America/Sao_Paulo) |
| Novos nos últimos 7 dias | derivado: count(criado_em ≥ agora − 7 dias) |
| Aguardando contato | derivado: count(status = novo) |
| "N há mais de 48 h" | derivado: count(status = novo e criado_em < agora − 48 h) |
| Taxa de conversão | derivado: convertido ÷ (convertido + nao_convertido), só se esse total ≥ 5; senão "Ainda sem dados suficientes" |
| Para chamar agora (até 5) | status = novo, ordem criado_em ascendente, limit 5; nome, negocio, cidade/UF, "há X" (criado_em), botão WhatsApp (whatsapp), link Ver lead (id) |
| "Ver todos os N aguardando" | link para /admin/leads?status=novo, N = count(status = novo) quando > 5 |
| Funil por status (+ barras) | derivado: count por status; barra = count ÷ total |
| Leads por semana | derivado: count(criado_em) por semana (início na segunda, fuso de SP); 4 a 8 semanas, a partir da primeira semana com lead; semana em andamento listrada |
| Esta semana × semana passada | derivado do mesmo agrupamento |
| Ver dados (tabela) | os mesmos números do gráfico |
| Aviso "poucos leads" | derivado: total < 10 |
| Perfil dos leads (recolhível) | derivado: contagens de maior_desafio, tempo_funcionamento, equipe, ja_fez_mentoria; top cidades/UF (cidade/UF). |

## Leads
| Elemento | Origem |
|---|---|
| Busca | nome, negocio, cidade, whatsapp (só dígitos) |
| Filtro / abas de status + contagem | status; count por status |
| Ordem | criado_em (mais recentes / mais antigos) |
| Contador "N leads" | count do resultado filtrado |
| Chips de filtro | parâmetros da URL (status, q) |
| Tabela/cartão | nome, negocio, cidade/UF, status, criado_em (data e hora), id (link), whatsapp (botão) |
| Lead anonimizado | anonimizado_em ≠ null: mostra "Anonimizado", sem botão WhatsApp, só o olho |

## Lead (modal e página)
Cabeçalho: nome, criado_em ("Recebido em…"), status. Dados: negocio, cidade/UF, whatsapp (formatado (14) 99999-3211), tempo_funcionamento, equipe, maior_desafio, ja_fez_mentoria (Sim/Não), mensagem (omitir bloco se vazia), origem. Seletor de status → status. Observação (≤ 2000) → observacao. "Salvo às HH:MM" → atualizado_em depois do POST. Bloco LGPD → ações Anonimizar (preenche anonimizado_em e apaga nome, negocio, whatsapp, mensagem, observacao) e Excluir (remove a linha).

## Cabeçalho
E-mail do admin = sessão. Exportar: Leads CSV, Auditoria CSV, Documento LGPD (rotas já existentes). "Alterar senha" e "Sair": sessão.

## NÃO PORTAR (nada disso depende de dado inexistente)
- Os 17 leads, nomes, telefones, negócios e o e-mail do protótipo: **DEMO**.
- Selo "dados de demonstração" e a barra "Telas": **NÃO PORTAR**.
- O texto "Seus leads, um por um…" no login é copy sugerida (conferir com a Camila).
- Não existe no protótipo: prioridade, tags, responsável, receita, campanha, funil de e-mail. Nada a remover.
- "Esta semana × semana passada" é derivado; se não quiser, remover só a linha `.ad-sub` do cartão do gráfico.
