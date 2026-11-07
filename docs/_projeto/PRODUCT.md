# PRODUCT — Master Pet na Prática

1. **Objetivo e métrica:** captar donos de banho e tosa qualificados e dar à Camila um painel simples para
   acompanhá-los. Métrica: leads qualificados/mês [DEFINIR com a Camila]; demo: formulário → lead no painel em ≤ 2 min.
2. **CTA único:** "Quero conversar com a Camila" (repetido; sempre leva ao formulário).
3. **Público:** dono(a) de banho e tosa já em funcionamento, que tentou curso/mentoria online e não conseguiu
   aplicar sozinho(a). Decide por confiança na pessoa. Objeção: "já tentei e não deu certo".
4. **Diferencial:** "Não é aula. É a Camila dentro do seu Banho & Tosa, resolvendo com você."
5. **Seções:** Hero · Problema · A diferença · Como funciona (3 passos) · O que destrava · Quem é a Camila ·
   Para quem é / não é · FAQ · Formulário · Sucesso · Rodapé. Prova social só qualitativa (sem depoimento inventado).
6. **Premissas:** wordmark no header, pingente "Na Prática" como selo · encontros "planejados sob medida", sem preço ·
   1 admin criado por script, sem cadastro público · leads de demonstração fictícios, apagados na entrega ·
   demo em .vercel.app · destino do WhatsApp/e-mail por variável de ambiente.
7. **Fora de escopo:** multiusuário/papéis, painel de outras LPs, gráficos, upload, e-mail de aviso,
   domínio próprio, blog, pagamento, textos finais/preço/depoimentos (entram quando a Camila enviar).
8. **Sitemap:** `/` · `/politica-de-privacidade` · `/termos-de-uso` · `/admin/login` · `/admin`
10. **RF (MoSCoW)**
   Must: RF-01 formulário grava o lead, validado com Zod no servidor · RF-02 consentimento não pré-marcado,
   com data e versão do texto aceito · RF-03 honeypot + limite de envio · RF-04 mensagem de sucesso ·
   RF-05 login único (Better Auth), sem cadastro público · RF-06 lista de leads com busca e filtro por status ·
   RF-07 mudar status (Novo/Em contato/Convertido/Não convertido) + observação · RF-08 política de privacidade.
   Should: RF-09 resumo por status no topo · RF-10 botão "chamar no WhatsApp" · RF-11 export CSV.
   Won't: aviso por e-mail a cada lead novo; demais itens em 7.
   **RNF:** RNF-01 LCP ≤ 2,5 s no 4G · RNF-02 contraste ≥ 4,5:1 · RNF-03 sem overflow horizontal em 375 px ·
   RNF-04 toda rota/action do admin checa sessão no servidor · RNF-05 testado em webkit (Safari iOS) · RNF-06 CLS ≤ 0,1.
11. **Dados:** lead(id, nome, whatsapp, cidade_uf, negocio, tempo_funcionamento, pessoas, maior_desafio,
   ja_fez_mentoria, mensagem?, status, observacao, origem, criado_em, atualizado_em, anonimizado_em?).
   Consentimento só em consent_events (RF-12).
   Usuário/sessão: tabelas geradas pelo Better Auth.
12. **Riscos:** conteúdo inexistente (preço, depoimentos, encontros) → não inventar · logo embutida no hero-bg →
   decidir no design · conta Neon só na Fase 3 · prazo → válvula: nunca cortar formulário→lead→lista→status.

**Triagem aprovada:** N2 enxuto · 2026-11-05 · sobe para N3 se: área de aluno, pagamento ou mais de um usuário com permissões.

RF-12 (Must) consent_events: lead_id, texto_versao, texto_hash, aceito_em (UTC), origem (URL), user_agent, ip_hmac. Só INSERT; revogação = novo evento.
RF-13 (Must) /termos-de-uso (curto) e /politica-de-privacidade: controladora e contato, finalidade, base legal, compartilhamento, retenção,
  direitos do titular (art. 18), canal do titular. Links no rodapé e junto ao consentimento.
RF-14 (Must) Painel: excluir/anonimizar lead. Exportação dos dados do titular: por e-mail + export manual via script (o botão de CSV é só o RF-11, Should).
RNF-07 Sem analytics, pixels ou cookies não essenciais no MVP (sem banner); fontes via next/font; sem dado pessoal em logs.
RNF-08 Registro simplificado de operações (modelo ANPD), template de registro de incidentes e retenção definida com a Camila.
