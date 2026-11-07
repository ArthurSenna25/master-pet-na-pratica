# Briefing + Prompt Mestre (v4) — substitui o PROMPT-MESTRE-NOVO-PROJETO v3

**Como usar:** 1) preencha as seções 1–5 (campo vago = o Claude pergunta, não inventa). 2) Abra o Claude Code na pasta do projeto (com `docs/` e `CLAUDE.md` copiados), em plan mode. 3) Cole o **Prompt** do final. Stack, metodologia e portões **não** se editam: estão em `docs/`.

## 1 · Identidade
Cliente/projeto: [  ] · Instagram/site atual: [  ] · Segmento: [  ]
Modelo de negócio deste projeto (escopo fechado / demo para fechar contrato + retainer / interno): [  ]

## 2 · Narrativa e diferencial
O que o negócio faz (1–3 frases): [  ]
Diferencial real (o que ninguém no nicho faz, ou faz pior): [  ]
Provas (prêmios, certificações, anos, clientes, números, depoimentos): [  ]
História de origem (opcional): [  ]

## 3 · Público
1–3 personas (quem é, o que busca, como decide, objeção) — ou "proponha com base nas seções 1–2": [  ]
Objetivo e métrica de sucesso (leads/mês, agendamentos, vendas): [  ]
**Ação única** que o visitante deve fazer (CTA): [  ]

## 4 · Identidade visual
Referências (sentimento, não layout): [  ] · Anti-referências: [  ]
Paleta (ou "proponha"): [  ] · Tom de voz (3 adjetivos): [  ]
Metáfora/direção criativa (ou "proponha uma que amarre com a seção 2"): [  ]

## 5 · Escopo técnico
Tipo: landing / site institucional / site+admin / app com login de usuário final / sistema complexo: [  ]
Login de usuário final? [  ] · Integrações (WhatsApp, agenda, pagamento, CRM, newsletter, pixels): [  ]
Idiomas: [  ] · Prazo e motivo: [  ] · Quem mantém depois / hospedagem / domínio: [  ]
Motion: nível 1 padrão / 2 vitrine / 3 vídeo-scroll — ou "proponha": [  ]
Dispositivos prioritários além da matriz mínima: [  ] · Restrições legais/regulatórias: [  ]
Conteúdo já disponível (textos, logo, fotos, vídeos): [  ]

## Prompt (cole no Claude Code, em plan mode)
```
Projeto novo. Siga docs/: leia APENAS docs/00-TRIAGEM-E-PROFUNDIDADE.md agora e,
depois, só o que a triagem indicar. Meu briefing está acima (seções 1–5).

1) Se campos das seções 1–5 estiverem vazios, vagos ou contraditórios, pergunte
   (no máximo o orçamento de perguntas do nível, em lote por tema). Não invente
   identidade de marca. Se a resposta não muda nível, identidade, prazo ou custo,
   assuma e registre em "Premissas".
2) Faça a TRIAGEM no formato obrigatório do doc 00 e espere meu OK.
3) Depois do OK, proponha o PLANO por fases, proporcional ao nível, cada fase com
   critério objetivo de pronto e estimativa indicativa de sessões. Espere meu OK.
4) Não escreva código de seção antes de eu aprovar o visual (vou trazer do Claude
   Design; você extrai os tokens para docs/_projeto/DESIGN.md).
5) Não instale nada além do que o nível pede. Uma dependência por vez, validando.
6) Credenciais que eu colar são sensíveis: não peça reenvio; sugira rotação.
```
