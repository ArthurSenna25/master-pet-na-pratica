# DECISOES-LGPD — Master Pet na Prática

> Material de apoio técnico, **não é parecer jurídico** e não garante conformidade. O documento completo (mapa de dados, decisões, checklist) entra no commit 5 da F4. Versão dos textos legais: ver `app/_lib/legal-version.ts`.

## Itens abertos

### IP em texto puro no Better Auth (login do painel) — investigado em 2026-11-08 (tipagem do pacote better-auth 1.7.18)
O Better Auth grava o IP de quem faz login em texto puro em dois lugares: `session.ip_address` e na chave de `rate_limit_auth` (`<IP>|/sign-in/email`). Vale só para o usuário admin do painel; o IP do formulário público é HMAC (`consent_events.ip_hmac`, `rate_limit.ip_hmac`). Nada foi alterado em `app/_lib/auth.ts`.

- (a) IP da sessão: **possível.** `advanced.ipAddress.disableIpTracking` desliga o IP, mas também o limite de login por IP (a própria tipagem avisa de risco de abuso). Alternativa: `databaseHooks.session.create.before` devolvendo `ipAddress: null` (ou o HMAC). Hook existe na tipagem; **não testado**.
- (b) Chave do rate limit: **possível, com código nosso.** Não há opção pronta (a chave é montada internamente a partir do IP e do caminho). Caminho: `rateLimit.customStorage` implementando `consume(key, rule)` sobre a tabela, aplicando HMAC ao trecho do IP antes de gravar.
- Recomendação: desligar o IP na sessão (hook) + HMAC na chave (customStorage), se ambos forem aceitos; senão, manter e documentar na política com prazo de retenção. Hoje a política diz a verdade: o IP do admin pode constar em texto na sessão e no limite de login.

### Outros itens abertos
- `audit_log` (e futuro `admin_events`) sem prazo de retenção definido: pendência para o advogado.
- `consent_events.lead_id` com `on delete cascade`: excluir o lead apaga o histórico de consentimento; avaliar guardar o evento sem dado pessoal.
- Hospedagem (Vercel) e região da função: **[PENDENTE]** (conferir em Settings > Functions). Transferência internacional (art. 33): **[PENDENTE]**.

## Decisões técnicas adotadas (a validar com advogado)

### Consentimento imutável no banco (trigger) — adotada em 2026-11-08
Trigger `consent_events_guard_tg` (BEFORE UPDATE em `consent_events`, migração `drizzle/0003_f4b_triggers.sql`). Bloqueia qualquer mudança em `id`, `lead_id`, `tipo`, `texto_versao`, `texto_hash`, `aceito_em` e `origem`. `ip_hmac` e `user_agent` só podem ser **zerados** (é o que `anonimizar_lead` faz); trocar por outro valor é bloqueado. `DELETE` e o `ON DELETE CASCADE` de `lead_id` não passam pelo trigger. Efeito: nem um erro de código, nem alguém com acesso à aplicação, consegue reescrever a prova do que foi aceito, quando e em qual versão do texto. Alternativa descartada: confiar só no código da aplicação ("só INSERT" por convenção). Limite: quem tem acesso de administrador ao banco pode desativar o trigger; o `audit_log` registra apenas a anonimização, não essa hipótese.

### Validação em 3 camadas — adotada em 2026-11-08
(1) navegador (conveniência, mesmas regras de `app/_lib/lead-rules.ts`); (2) servidor (Zod; autoridade; confere também a cidade na lista de municípios do IBGE); (3) banco (CHECKs em `lead`; `drizzle/0002_f4b_checks_lead.sql`). Lead anonimizado (`anonimizado_em` preenchido) fica fora dos CHECKs de nome, WhatsApp e negócio, porque esses campos são zerados por desenho. `lead.atualizado_em` é renovado por trigger em todo UPDATE.
