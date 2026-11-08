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
