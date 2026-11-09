# DECISOES-LGPD — Master Pet na Prática

**Versão dos textos legais a que este documento se refere: 0.2 de 2026-11-08** (igual a `LEGAL_TEXT_VERSION` em `app/_lib/legal-version.ts`). Textos publicados no site: [/politica-de-privacidade](/politica-de-privacidade) e [/termos-de-uso](/termos-de-uso). Documento escrito em 2026-11-08, para entrega à Camila Becari e a um(a) advogado(a).

## 1. Aviso

Este é um **material de apoio técnico**. **Não é parecer jurídico** e não garante conformidade com a LGPD (Lei nº 13.709/2018) nem com qualquer outra norma. Descreve o que o sistema faz hoje e as decisões técnicas tomadas. **Todas as decisões abaixo são "adotadas tecnicamente, a validar"** por profissional habilitado antes de qualquer uso com dados reais. Onde um fato depende da Camila, do advogado ou de uma conferência ainda não feita, aparece como **[PENDENTE]**. Nada aqui foi inventado: razão social, CNPJ, e-mails e prazos não definidos ficam em aberto.

O sistema está em **demonstração**: só deve receber dados fictícios (o formulário avisa isso na tela).

## 2. Resumo do sistema

- **O que é:** landing page de captação para a mentoria presencial da Camila Becari (donos de banho e tosa). Um formulário em 3 passos, um painel de acesso restrito (login único) e um banco de dados.
- **O que coleta:** nome, WhatsApp, cidade/UF, nome do negócio, tempo de funcionamento, tamanho da equipe, maior desafio, se já fez mentoria/curso, mensagem (opcional) e o registro do consentimento (seção 4). Sem analytics, pixels, cookies de rastreamento nem banner de cookies.
- **Onde fica:** banco Postgres do provedor Neon (plano gratuito, AWS região América do Sul — São Paulo, `sa-east-1`). Código hospedado na Vercel (planejado). Região de execução das funções: **[PENDENTE]** (conferir no painel da Vercel).
- **Quem acessa:** apenas a pessoa administradora do painel (conta única, criada por script local; não existe cadastro público). Não há outros perfis.
- **Estado do banco:** as migrações foram aplicadas **somente** no branch de teste do Neon. O banco de produção ainda não recebeu migração e não tem administrador criado.

## 3. Mapa de dados

Base legal pretendida para todos os campos: **consentimento do titular (LGPD, art. 7º, I)**, dado ao marcar a caixa do formulário. **Retenção:** proposta técnica de **12 meses após o último contato, depois anonimizar** (decisão 12 do PLANO), **[PENDENTE: confirmar com a Camila e o advogado]**. Não existe rotina automática: a anonimização é manual (função `anonimizar_lead`, botão no painel previsto para a F5).

| Campo | Finalidade | Retenção proposta | Quem acessa |
|---|---|---|---|
| nome, WhatsApp | identificar a pessoa e retornar o contato pelo WhatsApp | 12 meses após o último contato **[PENDENTE]**; zerados na anonimização | administradora |
| cidade/UF | entender a região do negócio | idem; **mantida** após anonimização (dado agregável) | administradora |
| nome do negócio | entender o negócio | idem; zerado na anonimização | administradora |
| tempo de funcionamento, pessoas na equipe, maior desafio, já fez mentoria/curso | qualificar o momento do negócio | idem; **mantidos** após anonimização (respostas fechadas) | administradora |
| mensagem (opcional), observação interna (painel, F5) | contexto da conversa | idem; zeradas na anonimização | administradora |
| status do lead, datas de criação/atualização | acompanhar o atendimento | idem; mantidos | administradora |
| origem (URL da página) | saber de onde veio o envio | idem; mantida | administradora |
| consentimento: data (UTC), versão e hash do texto, URL de origem | **provar** o que foi aceito, quando e em qual versão | **[PENDENTE]** (base de retenção para defesa: advogado) | administradora |
| consentimento: user agent e IP **em HMAC** | segurança e prova; limite de envios | zerados na anonimização | administradora |
| controle de limite de envios (HMAC do IP + hora) | conter abuso do formulário | apagado em até 24 h | sistema |
| registro de auditoria (`audit_log`: ação, id do lead (nulo quando a ação não tem lead), data UTC) | provar que uma anonimização, exclusão ou exportação ocorreu; **sem dado pessoal** | **sem prazo definido [PENDENTE]** | administradora |
| registro de ações do painel (`admin_events`: login, logout, exportações; só ação e data UTC) | rastrear o uso do painel; **sem IP, sem e-mail, sem dado pessoal** | **sem prazo definido [PENDENTE]** | administradora |
| IP e user agent do login do painel | segurança do acesso (apenas a administradora) | ver seção 5, item "IP do login" **[PENDENTE]** | sistema |

Observação: o WhatsApp é, além de dado coletado, o **canal de contato**: um serviço de terceiro, sujeito aos próprios termos.

## 4. Registro de consentimento

Tabela `consent_events` (fonte **única** de consentimento; o lead não guarda campos de consentimento):

| Coluna | Conteúdo |
|---|---|
| `lead_id` | a quem pertence |
| `tipo` | `aceite` ou `revogacao` (revogação é um **novo evento**, nunca altera o aceite) |
| `texto_versao` | `LEGAL_TEXT_VERSION` vigente no envio (hoje: 0.2 de 2026-11-08) |
| `texto_hash` | SHA-256 do texto **exato** exibido ao lado da caixa (`CONSENT_TEXT`) |
| `aceito_em` | data/hora em UTC |
| `origem` | URL da página do envio |
| `user_agent` | navegador (zerado na anonimização) |
| `ip_hmac` | HMAC-SHA256 do IP (zerado na anonimização) |

- **Texto aceito = texto exibido:** o formulário renderiza o texto a partir de `CONSENT_TEXT`; um teste automatizado compara o texto do DOM com essa constante. O servidor **ignora** qualquer texto vindo do navegador: grava ele mesmo a versão e o hash.
- **Versionamento:** qualquer mudança no texto exige subir `LEGAL_VERSION`; o histórico fica comentado em `legal-version.ts`.
- **Caixa desmarcada por padrão**, separada dos demais campos, com links (nova aba) para a política e os termos.
- **Revogação:** o fluxo existe no modelo de dados (`tipo = revogacao`), mas ainda **não há tela** para registrá-la; hoje seria feita a pedido do titular, pelo canal da seção 7 **[PENDENTE: canal]**.

## 5. Decisões técnicas adotadas (a validar) e alternativa descartada

**5.1 IP do formulário como HMAC × IP puro.** *Adotado:* só o HMAC-SHA256 do IP é gravado (chave secreta fora do código). Permite limitar envios e relacionar eventos sem guardar o IP. *Descartada:* guardar o IP puro. *A validar:* o Marco Civil da Internet (art. 15) trata da guarda de registros de acesso por provedores de aplicações; o advogado deve dizer se e como isso se aplica a este site e se o HMAC é suficiente.

**5.2 IP do login do painel (item aberto, a validar).** O Better Auth grava o IP de quem faz login **em texto puro** em dois lugares: `session.ip_address` e na chave da tabela de limite de login (`rate_limit_auth`, formato `<IP>|<caminho>`). Vale só para a pessoa administradora; **não** é o IP de quem preenche o formulário. A política (0.2) descreve isso como verdade hoje. Nada foi alterado. Investigação na tipagem do pacote (versão 1.7.18, 2026-11-08):
- **(a) IP da sessão — possível.** O hook `databaseHooks.session.create.before` pode devolver `ipAddress` nulo (ou em hash); **não testado**. A opção `advanced.ipAddress.disableIpTracking` também existe, mas desliga o limite de login por IP (a própria tipagem avisa do risco).
- **(b) Chave do limite — possível só com código nosso.** Não há opção pronta; seria preciso um `rateLimit.customStorage` que implemente `consume(key, rule)` e aplique HMAC ao trecho do IP.
- **Recomendação:** aplicar (a) e (b), se aceitos; senão, manter e documentar com prazo de retenção **[PENDENTE]**.

**5.3 Anonimização por função única e `audit_log`.** *Adotado:* `anonimizarLead` zera nome, WhatsApp, negócio, mensagem e observação do lead e `ip_hmac`/`user_agent` dos eventos, **sem tocar** em versão, hash e data do consentimento; grava uma linha em `audit_log` (ação, id, data UTC; sem dado pessoal), tudo na mesma transação. Deve ser chamada só após checar a sessão no servidor. *Descartada:* anonimização espalhada por várias rotinas, sem registro. *Pendente:* `audit_log` **não tem prazo de retenção** definido, e o `admin_events` também não **[PENDENTE: advogado]**. **Exclusão:** `excluirLeadAction` grava `excluir_lead` em `audit_log` (sem dado pessoal; o `lead_id` não tem chave estrangeira e sobrevive) e apaga o lead **na mesma transação** (`db.batch`); os `consent_events` saem por cascade. Exige confirmação em dois passos (funciona sem JavaScript) e checa a sessão antes de tudo.

**5.4 `ON DELETE CASCADE` em `consent_events` × guardar o evento sem dado pessoal.** *Adotado (a validar):* ao excluir um lead, os eventos de consentimento são excluídos junto. *Alternativa:* manter o evento de consentimento, já sem dado pessoal, como prova de defesa. A escolha depende de haver base legal e prazo para guardar essa prova **[PENDENTE: advogado]**; hoje a prova remanescente de uma exclusão é só a anonimização (que mantém o evento).

**5.5 Imutabilidade de `consent_events` por trigger (a validar).** Trigger `consent_events_guard_tg` (migração `0003`) bloqueia qualquer mudança em `id`, `lead_id`, `tipo`, `texto_versao`, `texto_hash`, `aceito_em` e `origem`; `ip_hmac` e `user_agent` só podem ser **zerados** (o que a anonimização faz). `DELETE` e o cascade não passam pelo trigger. *Efeito:* nem um erro de código reescreve a prova do consentimento. *Descartada:* confiar só em "só INSERT" por convenção no código. *Limite:* quem tem acesso de administrador ao banco consegue desativar o trigger; o `audit_log` não registra essa hipótese.

**5.6 Validação em 3 camadas.** (1) **Navegador:** conveniência, com as mesmas regras do servidor (`app/_lib/lead-rules.ts`). (2) **Servidor (Zod):** é a autoridade; normaliza (NFC, espaços) e confere a cidade na lista oficial de municípios. (3) **Banco:** CHECKs em `lead` (tamanhos, WhatsApp só dígitos, UF entre as 27, formato de cidade/UF, status) e trigger que renova `atualizado_em` (migrações `0002` e `0003`). Lead anonimizado fica fora dos CHECKs de nome, WhatsApp e negócio, que são zerados por desenho.
- **Lista de municípios:** API de localidades do IBGE (`servicodados.ibge.gov.br/api/v1/localidades/municipios`), baixada em **2026-11-08**: 5 571 municípios em 27 UFs, gravada em arquivo estático e conferida **só no servidor** (não é enviada ao navegador). Não é atualizada automaticamente.
- **Telefone:** celular = DDD + 9 + 8 dígitos; fixo = DDD + 2 a 5 + 7 dígitos; 67 DDDs em uso. A lista de DDDs foi conferida em fonte de terceiros que cita a Anatel (não em fonte oficial primária). Rejeita número com todos os dígitos iguais.
- **Alcance:** essas regras são **critério técnico de formato e plausibilidade. Não garantem que o dado seja verdadeiro** nem pertença a quem o informou, e não impedem dado falso bem formado.
- **Locale do banco de produção — conferir antes de migrar:** os CHECKs usam `[[:alpha:]]`, que só reconhece letras acentuadas se o banco usar locale UTF-8. O branch de teste usa `C.UTF-8` e foi testado com "José", "Conceição" e "D'Ávila" (aceitos) e "Ana123" (rejeitado). O banco de produção **ainda não foi conferido**.

**5.7 Limite de envio por tabela (10 min, 5 envios, limpeza 24 h).** *Adotado:* contagem por HMAC do IP em tabela do próprio Neon; linhas com mais de 24 h são apagadas a cada novo envio; sem rotina agendada. *Descartada:* serviço externo de limite (Upstash), por adicionar operador e dependência. *Limite:* contar e inserir não é atômico, então uma corrida pode deixar passar 1 ou 2 envios a mais. **Premissa de segurança:** o IP vem de `x-vercel-forwarded-for`, que **só é confiável na Vercel** (que o define e o sobrescreve). Fora dela, os cabeçalhos de IP podem ser forjados pelo cliente, e o limite deixa de proteger. Sem nenhum cabeçalho, o envio é recusado em produção (nunca se agrupa todo mundo num IP).

**5.8 Sem analytics, pixels nem banner.** *Adotado:* nenhum rastreador; fontes servidas pelo próprio site; logs do servidor sem dado pessoal (só nome/código de erro). *Descartada:* analytics de terceiros e banner de cookies. Se isso mudar, a política e o consentimento precisam ser revistos antes.

**5.9 Cookie de sessão do painel.** *Adotado:* um único cookie, essencial, `httpOnly`, restrito ao caminho `/admin`, só depois do login. A página pública e o formulário não definem cookies. *Descartada:* sessão com escopo no site inteiro.

**5.10 Administrador único, criado por script.** *Adotado:* cadastro público **desligado**; o script local cria o único usuário (ou redefine a senha dele) e recusa criar um segundo; não há rota de cadastro. *Descartada:* cadastro com aprovação manual. Login limitado a 5 tentativas por minuto.

**5.11 Consentimento em caixa única × duas caixas.** *Adotado:* uma caixa cobre o contato pelo WhatsApp **e** o tratamento dos dados para esse fim (finalidade única). *Alternativa:* duas caixas (tratamento × contato). **[PENDENTE: advogado decide se a caixa única basta.]**

**5.12 Exclusão × anonimização.** *Adotado:* o painel (F5) oferecerá as duas: **excluir** apaga o lead (e os eventos, por cascade); **anonimizar** mantém respostas fechadas, cidade/UF, status e datas, sem dado pessoal. *Descartada:* guardar tudo indefinidamente. **[PENDENTE: advogado confirma a regra de cada caso.]**

**5.13 Auditoria exportável e `admin_events` (implementado, F5).** Na tela inicial do painel, a Camila baixa sem depender de desenvolvedor: (a) `/admin/auditoria.csv`: `audit_log`, `consent_events` e `admin_events` em um CSV com colunas `fonte, id, evento, lead_id, texto_versao, texto_hash, data_utc`. **Fora do arquivo:** nome, WhatsApp, negócio, mensagem, observação, URL de origem, `ip_hmac` e `user_agent`. Células que começam com `=`, `+`, `-`, `@`, tabulação ou retorno de carro recebem `'` na frente (proteção contra fórmula em planilha). (b) `/admin/decisoes-lgpd`: este documento. Ambas as rotas exigem sessão: sem sessão respondem **401** (sem redirect); pedido marcado como `cross-site` pelo navegador recebe 403. **O próprio export se registra** (uma linha em `admin_events` com a ação `export_auditoria` e uma em `audit_log` com `lead_id` nulo, ambas sem dado pessoal), **antes** de ler as tabelas, então o arquivo entregue já contém a linha que prova que foi gerado. **`admin_events` existe** (migração `0004`): ações `login`, `logout`, `export_auditoria` e `export_leads` (o CSV de leads é a etapa seguinte da F5), só ação e data UTC, **sem IP**; o CHECK do banco limita as ações a essas quatro. O `audit_log` passou a aceitar `lead_id` nulo (migração `0005`) para ações sem lead. Nenhuma mudança nos textos públicos, então a versão `0.2` dos textos legais **não** mudou. **Limite conhecido:** o export é um GET que grava registro; o `cross-site` é barrado, mas quem já tem sessão e abre o link gera registro. Sem paginação (volume pequeno); revisar acima de ~100 mil linhas. **Sem prazo de retenção para `audit_log` e `admin_events` [PENDENTE: advogado].**

**5.14 Logs de infraestrutura fora do painel.** Os logs da hospedagem (Vercel) e do banco (Neon) **não** aparecem no painel. Eles ficam com os provedores, e a **retenção deles é a do provedor** **[PENDENTE: levantar prazo e o que registram]**. A aplicação não escreve dado pessoal nos próprios logs.

## 6. Operadores e transferência internacional (art. 33)

| Operador | Função | Local | Situação |
|---|---|---|---|
| Neon | banco de dados Postgres | AWS, América do Sul (São Paulo, `sa-east-1`), plano gratuito, Postgres 18 | informado; histórico de restauração de 6 h no plano atual; sem restrição de IP configurada |
| Vercel | hospedagem do site | região de execução das funções: **[PENDENTE]** | **[PENDENTE]**: conferir em *Settings > Functions* (o padrão costuma ser nos EUA; é suposição, não fato) |
| WhatsApp | canal de contato (fora do sistema) | — | serviço de terceiro, termos próprios |

**Transferência internacional (art. 33): [PENDENTE].** O banco está em São Paulo, mas o provedor do banco e a hospedagem são empresas de fora do Brasil, e a região das funções ainda não foi conferida. Se a função rodar fora do Brasil, os dados trafegam para lá a cada envio. O advogado deve dizer se há transferência, qual a salvaguarda aplicável e como isso entra na política. Não afirmamos aqui que haja ou não haja.

## 7. Direitos do titular (art. 18) e atendimento

Direitos previstos: confirmação do tratamento e acesso; correção; anonimização, bloqueio ou eliminação de dados desnecessários ou em desconformidade; portabilidade; eliminação dos dados tratados com consentimento; informação sobre compartilhamento; informação sobre a possibilidade de não consentir; revogação do consentimento.

**Fluxo proposto, por e-mail:**
1. O titular escreve para o canal do titular: **[PENDENTE: e-mail]**.
2. A administradora confirma a identidade por meio razoável (por exemplo, respondendo ao mesmo WhatsApp informado) **[PENDENTE: procedimento]**.
3. Localiza o lead no painel (busca na F5).
4. Atende: exportar os dados do titular (hoje, por script manual; RF-14), corrigir, **anonimizar** ou **excluir**; para revogação, registrar novo evento `revogacao`.
5. Responde ao titular e registra o atendimento. **Prazos de resposta: [PENDENTE: advogado]**.

**Encarregado (DPO):** **[PENDENTE: nome e contato, ou confirmação de dispensa conforme o enquadramento da controladora, que também depende de ser ME/EPP]**.

## 8. Incidentes e registro de operações

**8.1 Template de registro de incidente** (preencher a cada ocorrência; art. 48 exige avaliar a comunicação à ANPD e aos titulares quando houver risco ou dano relevante; **[PENDENTE: advogado confirma critérios e prazo]**):

| Campo | Preenchimento |
|---|---|
| Data/hora em que ocorreu e em que foi detectado | |
| Quem detectou e como | |
| Descrição (o que aconteceu) | |
| Dados e titulares afetados (categorias e quantidade) | |
| Causa provável | |
| Medidas de contenção e correção | |
| Risco ou dano relevante aos titulares? (sim/não e por quê) | |
| Comunicação à ANPD / aos titulares (data, meio, texto) | |
| Responsável pelo registro | |

**8.2 Modelo simplificado de registro de operações** (RNF-08; preencher com base na seção 3 e validar com o advogado):

| Item | Preenchimento |
|---|---|
| Controladora | **[PENDENTE: razão social, CNPJ, endereço]** |
| Encarregado | **[PENDENTE]** |
| Operação | captação de contatos pelo formulário do site |
| Finalidade | retornar o contato pelo WhatsApp e entender o momento do negócio |
| Base legal | consentimento (art. 7º, I) |
| Categorias de titulares / dados | interessados em mentoria; dados da seção 3 |
| Compartilhamento / operadores | seção 6 |
| Transferência internacional | **[PENDENTE]** |
| Retenção | **[PENDENTE]** (proposta: 12 meses após o último contato) |
| Medidas de segurança | seção 9 |

## 9. Segurança implementada (o que existe no código)

- Validação de toda entrada **no servidor** (Zod), além de CHECKs e triggers no banco; consultas sempre parametrizadas.
- **Campo oculto anti-robô** (honeypot): preenchido, o envio é descartado com resposta de sucesso genérica.
- **Limite de envio** por HMAC do IP (5 em 10 min) e **limite de login** (5 por minuto).
- IP do formulário **só em HMAC**; chave secreta fora do código.
- Cadastro público **desligado**; administrador único criado por script; senha com hash do Better Auth (nunca em texto).
- **Sessão checada no servidor** em toda página e ação do painel; sem sessão, as páginas redirecionam ao login e as rotas de download (`auditoria.csv`, documento) respondem 401.
- Cookie de sessão `httpOnly`, restrito a `/admin`; painel fora dos mecanismos de indexação (`noindex`).
- **Sem dado pessoal em logs** da aplicação (erros registram só nome e código).
- Segredos **fora do git** (arquivo local ignorado; só um modelo sem valores é versionado); busca automática por segredos antes de cada commit.
- Cabeçalhos: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`. **Não há CSP** (decisão de escopo; reavaliar antes do deploy final). HTTPS depende da hospedagem: **a confirmar no deploy**.
- Testes automatizados (unidade, banco e navegador) cobrem validação, imutabilidade do consentimento, honeypot, limite de envio, login e cadastro fechado, sempre com dados fictícios identificáveis e removidos ao fim.
- **Limites conhecidos:** nenhuma medida elimina todos os riscos; sem revisão externa de segurança; `npm audit` ainda não executado (previsto na F6).

## 10. Pendências

**Para a Camila (controladora):**
- Razão social, CNPJ e endereço da controladora; se é ME/EPP; quem é o encarregado (ou dispensa).
- E-mail do canal do titular.
- Prazo de retenção dos leads e confirmação da proposta de 12 meses.
- Foro, responsável pelo site e titular das marcas/imagens (termos).
- Opções reais dos campos do formulário (hoje provisórias) e textos finais do site.
- Região e conta da hospedagem; criação do administrador no banco de produção.

**Para o advogado:**
- Revisão dos textos `/politica-de-privacidade` e `/termos-de-uso` (hoje rascunho, sem revisão jurídica).
- Consentimento em **caixa única × duas**; texto do consentimento.
- **`ON DELETE CASCADE`** × guardar o evento de consentimento sem dado pessoal.
- **IP em HMAC** (formulário) e **IP em texto puro no login do painel** (opções a e b); aplicação do art. 15 do Marco Civil.
- Base legal e prazo de retenção para **defesa** (guarda da prova do consentimento) e para `audit_log` / `admin_events`.
- **Transferência internacional (art. 33):** existe? qual salvaguarda?
- Necessidade de **RIPD/DPIA** e critérios do registro de operações e de incidentes (art. 48).
- Regra de atendimento ao titular (prazos) e de exclusão × anonimização.

**Técnicas, antes do deploy:** conferir o **locale do banco de produção** antes de migrar; conferir a **região da função** na Vercel; definir a URL de produção do sistema de login; revisar CSP; `npm audit`; criar o administrador de produção.

## 11. Checklist antes de qualquer lead real

- [ ] Textos legais revisados por advogado e versão atualizada (`LEGAL_VERSION`); este documento revisado para a mesma versão.
- [ ] Controladora, e-mail do titular e encarregado (ou dispensa) preenchidos nos textos; nenhum `[PENDENTE]` restante nas páginas legais.
- [ ] Prazo de retenção definido (leads, `audit_log`, `admin_events`) e procedimento de anonimização/exclusão combinado.
- [ ] Decisões "a validar" da seção 5 respondidas (em especial 5.1, 5.2, 5.4, 5.11).
- [ ] Hospedagem e região da função conferidas; transferência internacional resolvida e descrita na política.
- [ ] Locale do banco de produção conferido; migrações aplicadas **primeiro** em branch/local, depois em produção; trigger de consentimento presente em produção.
- [ ] Administrador de produção criado; senha forte; login testado; cadastro público inacessível em produção.
- [ ] Aviso "demonstração: use dados fictícios" removido **somente** depois dos itens acima; leads de teste apagados do banco.
- [ ] Segredos de produção definidos no ambiente da hospedagem (nunca no git); busca por segredos vazia.
- [ ] Canal de atendimento ao titular testado de ponta a ponta (recebimento, exportação, anonimização, exclusão).
- [ ] Modelo de registro de operações e de incidentes preenchidos e guardados.
- [ ] Suíte de testes (Vitest e Playwright) e verificação de desempenho passando no ambiente final.
