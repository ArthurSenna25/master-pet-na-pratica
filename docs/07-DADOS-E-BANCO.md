# 07 · Dados e Banco de Dados

**Quando ler:** N2+ ao modelar, migrar ou consultar dados. Também serve de estudo.

## 1. Processo de modelagem

1. **Conceitual (MER):** entidades, atributos, relacionamentos, cardinalidades (1:1, 1:N, N:N) — em linguagem do negócio.
2. **Lógico (relacional):** tabelas, chaves, N:N vira tabela associativa, tipos genéricos.
3. **Físico:** tipos do SGBD, índices, constraints, particionamento, nomes finais.
Modele a partir das **perguntas que o sistema precisa responder** (consultas e regras), não só dos substantivos.

## 2. Regras de ouro

- **Normalização:** 1FN (valores atômicos) → 2FN (sem dependência parcial da chave) → 3FN (sem dependência transitiva) → BCNF. Desnormalize só com medição e registro do motivo.
- **Chaves:** PK em toda tabela; surrogate (identity/UUID) para evitar chave natural instável; UNIQUE nas chaves naturais (e-mail, CPF/CNPJ com validação).
- **Integridade no banco, não só no app:** `NOT NULL`, `FOREIGN KEY`, `UNIQUE`, `CHECK`. O app muda; a constraint protege.
- **Dinheiro:** inteiro em centavos ou `NUMERIC`; **nunca** float.
- **Tempo:** guarde em UTC (`timestamptz` no Postgres); converta na borda.
- **Auditoria:** `created_at`, `updated_at` (e `deleted_at` se houver exclusão lógica; decida soft × hard delete e a política LGPD).
- **Enums/estados:** tipo enum ou tabela de domínio; documente transições válidas.
- **Multi-tenant (N4):** decida cedo (coluna `tenant_id` + RLS × schema por tenant).

## 3. Índices e desempenho

- Índice B-tree em FKs e colunas de filtro/ordenação frequentes; **ordem das colunas** no índice composto importa (igualdade primeiro, depois intervalo/ordenação).
- Meça com `EXPLAIN (ANALYZE)` antes de indexar; índice custa escrita e espaço.
- Evite N+1 (carregue relações em lote); pagine por **keyset** (cursor) em listas grandes, offset só em listas pequenas.
- Pool de conexões em serverless (string pooled do Neon).

## 4. Transações e consistência

ACID: atomicidade, consistência, isolamento, durabilidade. Postgres usa *read committed* por padrão; para "ler e depois escrever" crítico use transação com bloqueio (`SELECT ... FOR UPDATE`) ou `serializable`. Operações que repetem (webhook, retry) precisam de **idempotência** (chave única).

## 5. Migrações

Versionadas (Drizzle Kit), revisadas, **nunca editar migração já aplicada**; mudanças destrutivas em 2 passos (adicionar → migrar dados → remover). Teste a migração em cópia dos dados. Backup antes de produção.

## 6. Privacidade nos dados (LGPD)
Minimização (colete o necessário) · finalidade e base legal por campo · retenção e exclusão definidas · criptografia em trânsito e, para dados sensíveis, em repouso · acesso por papel · log de acesso a dado pessoal.

## 7. Oracle × PostgreSQL (se o projeto/curso usar Oracle)

| Tema | Oracle | PostgreSQL |
|---|---|---|
| Texto | `VARCHAR2`; string vazia **é** `NULL` | `text`/`varchar`; vazio ≠ `NULL` |
| Numérico | `NUMBER(p,s)` | `integer`, `numeric(p,s)` |
| Data | `DATE` inclui hora | `date` (sem hora), `timestamptz` |
| Auto-numeração | Sequence ou `GENERATED ... AS IDENTITY` | `GENERATED ... AS IDENTITY`/`serial` |
| Limite de linhas | `FETCH FIRST n ROWS ONLY` | `LIMIT n` |
| Concatenar | `\|\|` (NULL vira vazio) | `\|\|` (NULL contamina) |

## 8. Estudo: ordem sugerida
Modelagem ER → álgebra relacional/SQL → normalização → índices e planos de execução → transações e concorrência → modelagem para análise (dimensional) → sistemas distribuídos e dados em escala. Livros em `11`.
