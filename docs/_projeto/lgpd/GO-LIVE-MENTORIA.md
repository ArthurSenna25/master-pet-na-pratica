# GO-LIVE — formulário da Mentoria (condições antes de ligar em produção)

**Estado hoje (2026-11-19):** em produção o formulário está DESLIGADO (`MENTORIA_FORM_ATIVO` ausente = "Em breve", sem `<form>`; a action recusa sem gravar). O flag falha fechado: só `=1`, ou preview/development, ou `next dev` o ligam. **Este documento é uma lista de condições, não uma declaração de conformidade.** Nenhum item abaixo está atendido só por existir no repositório; o que depende de pessoa, empresa ou advogado está marcado `[PENDENTE]` e precisa de resposta real (não inventar CNPJ, e-mail ou prazo).

Referências: `DECISOES-LGPD.md` (3, 4, 5.19, 9, 11) · `SEGURANCA.md` · `docs/_projeto/PROGRESS.md`.

## A. Pessoas e empresa `[PENDENTE]` (dono / advogado)
- [ ] **Controladora identificada**: razão social, CNPJ e endereço, preenchidos na política e nos termos. Confirmar se é ME/EPP (muda obrigações e eventual dispensa).
- [ ] **E-mail do titular** (canal de direitos do art. 18) definido, com **responsável** nomeado e fluxo testado de ponta a ponta (recebimento, exportação, anonimização, exclusão; ver DECISOES-LGPD 7).
- [ ] **Retenção** definida e escrita (leads da mentoria, `consent_events`, `audit_log`, `admin_events`); procedimento de anonimização/exclusão combinado. Hoje há apenas proposta técnica (DECISOES-LGPD 3).
- [ ] **Encarregado (DPO)** nomeado, ou dispensa formalmente avaliada e registrada.

## B. Revisão jurídica `[PENDENTE]` (advogado)
- [ ] Política de Privacidade, Termos de Uso e **texto de consentimento da mentoria** (rascunho em DECISOES-LGPD 5.19: finalidade, frase e canal de retirada) revisados.
- [ ] Depois da revisão: atualizar `LEGAL_VERSION` / `LEGAL_TEXT_VERSION` em `app/_lib/legal-version.ts` (o hash do texto da campanha muda e prova o que foi aceito); revisar DECISOES-LGPD para a mesma versão. Nenhum `[PENDENTE]` restante nas páginas legais.
- [ ] **Convite ao grupo de WhatsApp**: link real definido (hoje não há) e **avaliação jurídica** do grupo como serviço de terceiro e da exposição de números entre participantes; texto da política e do consentimento coerente com o que será feito.

## C. Infraestrutura e transferência internacional
- [ ] **Região da função** em `gru1` (`preferredRegion`), hoje NÃO aplicada; confirmar a região efetiva do deploy e do banco.
- [ ] **Transferência internacional (art. 33)**: operadores (Vercel, Neon, outros) e base escolhida descritas na política (DECISOES-LGPD 6); validar com o advogado.
- [ ] **Vercel**: `DATABASE_URL` de Preview/Development NÃO aponta para produção (o flag liga em preview); segredos de produção só no ambiente da hospedagem (nunca no git).
- [ ] **2FA** ligado nas contas Vercel, Neon e GitHub; **alerta de gasto** configurado (Vercel/Neon) para conter abuso do formulário.
- [ ] Migração 0008 já aplicada em produção (2026-11-19); conferir de novo antes do deploy que produção está na mesma versão do código (código antes da migração falha todo envio).

## D. Antes de ligar
- [ ] Remover o aviso **"demonstração: use dados fictícios"** do formulário (`FormMentoria.tsx`, `FormularioMentoria.tsx`) **somente depois** de A, B e C; apagar leads de teste do banco.
- [ ] **Teste final em preview** (com o flag ligado só lá): envio real de ponta a ponta com dados de teste, selo "Mentoria" no painel, filtro, CSV com `campanha`, exclusão pelo modal, mensagem de erro e de sucesso, mobile e desktop. Limpar o que o teste criou.
- [ ] Suíte completa (vitest e playwright, chromium e webkit) e checagem de segredos (`git grep`) limpas no commit que vai ao ar.
- [ ] Depoimentos reais autorizados por escrito, se forem usados (5.18); senão manter os selos "exemplo".

## E. Ligar
1. Definir `MENTORIA_FORM_ATIVO=1` em **Production** (Vercel).
2. **Redeploy** (a variável só vale no próximo deploy).
3. Enviar um lead de teste na produção, conferir no painel e excluir; confirmar `rate_limit` e `admin_events` sem anomalia.
4. Plano de recuo: remover a variável (ou `=0`) e redeploy; o formulário volta a "Em breve" sem perder dados já gravados.
