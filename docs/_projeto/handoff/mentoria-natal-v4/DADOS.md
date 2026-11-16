# DADOS — formulário de pré-inscrição (v2)

`POST /api/pre-inscricao` (Server Action). Validar sempre no servidor com as mesmas regras; o JS do protótipo é só experiência.

| Campo (`name`) | Rótulo | Passo | Tipo / input | Obrig. | Limites / regra | Mensagem de erro |
|---|---|---|---|---|---|---|
| `nome` | Nome | 1 | text, `autocomplete=name` | sim | 2–80 caracteres após trim | Informe seu nome (pelo menos 2 letras). |
| `whatsapp` | WhatsApp | 1 | tel, `inputmode=tel`, máscara `(DD) 9XXXX-XXXX` | sim | 10 ou 11 dígitos; guardar só dígitos (+55 no envio) | Informe DDD e número. Ex.: (14) 99999-9999. |
| `cidade` | Cidade/UF | 2 | text, `autocomplete=address-level2` | sim | 2–60 + `/` + UF (2 letras) | Use o formato Cidade/UF. Ex.: Lins/SP. |
| `negocio` | Nome do negócio | 2 | text, `autocomplete=organization` | sim | 2–80 | Informe o nome do seu banho e tosa. |
| `tempo` | Tempo de funcionamento | 2 | radio: `menos-1`, `1-3`, `3-5`, `mais-5` | sim | enum fechado (**provisório**) | Escolha uma opção. |
| `equipe` | Pessoas na equipe | 2 | radio: `so-eu`, `2-3`, `4-mais` | sim | enum fechado (**provisório**) | Escolha uma opção. |
| `desafio` | Maior desafio hoje | 2 | radio: `processos`, `preco`, `equipe`, `atendimento`, `tudo` | sim | enum fechado (**provisório**) | Escolha uma opção. |
| `consentimento` | Consentimento | 2 | checkbox, **desmarcado**, separado, com links | sim | deve ser `true`; registrar texto exibido + data/hora + versão | Para entrar na lista, marque o consentimento. |
| `website` | (anti-robô, oculto) | 2 | text, fora da tela, `tabindex=-1`, `aria-hidden` | não | **deve vir vazio**; se preenchido, responder sucesso sem gravar | — |

Gravar também (servidor): `criado_em`, `origem=mentoria-natal`, versão do texto de consentimento, IP/UA só se a política de privacidade previr. Rate limit por IP/WhatsApp. Duplicidade: mesmo WhatsApp = atualizar, não duplicar (sem revelar ao usuário).

## Texto do consentimento (PLACEHOLDER — texto final definido no código)
> Concordo em ser contatado(a) pelo WhatsApp sobre a abertura da turma da Mentoria Master Pet e com o tratamento dos meus dados para esta finalidade, conforme a LGPD. Leia a Política de Privacidade e os Termos de Uso.

Links: `/politica-de-privacidade`, `/termos-de-uso`. Checkbox nunca pré-marcado; não agrupar com outros textos.

## Estados do formulário
`data-step="1|2"` · `data-state=""|"sending"|"ok"`. Erro por campo: `[data-nm-f][data-state=invalid]` + `aria-invalid`. Validação em tempo real: após o primeiro blur/alteração do campo (não grita antes).

## Confirmação (`.nm-ok`)
Título "Pronto, você está na lista!" · agradecimento · "O que acontece agora" (3 itens, **sem prazos**) · bloco opcional "Quer entrar no grupo da mentoria?" com link placeholder (`#grupo-placeholder`; ninguém é adicionado sem pedir). O nome digitado não é repetido na tela (evita PII em captura).

## Aviso
"demonstração: use dados fictícios" aparece no topo e no fim do passo 2 — **remover em produção**.

## Mudanças na v2
- **Mesmos campos, tipos, limites, mensagens e texto de consentimento (placeholder).** Identificadores iguais (`nome, whatsapp, cidade, negocio, tempo, equipe, desafio, consentimento, website`).
- **Pré-seleção de `desafio`** pela interação "Onde o seu dia trava?": gesto local, sem rede. Mapa: Gargalos→`processos` · Equipe→`equipe` · Precificação→`preco` · Padrões→`atendimento` · Raio-X→`tudo`. A resposta **não é enviada nem armazenada**; só o valor do rádio, se a pessoa enviar o formulário com consentimento. Aviso visível no grupo ("Pré-selecionado… Você pode mudar") some quando o usuário escolhe outra opção.
- Erros por campo agora aparecem em "etiqueta" clara sobre o vidro; `aria-invalid` e `aria-describedby` continuam por campo.
- Confirmação: mesma estrutura; acrescenta celebração (26 faíscas, uma vez; sem efeito em reduced-motion). Link do grupo continua opcional e placeholder.
- Honeypot `website`: igual.
