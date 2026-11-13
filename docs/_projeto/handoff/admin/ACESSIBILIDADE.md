# Acessibilidade — Painel

## Estrutura e roles
- Cada tela: `<header>` (navegação) + `<main>` com um único `<h1>`; seções com `<h2>` e `aria-labelledby`.
- Navegação: `<nav aria-label="Seções">` com `aria-current="page"` na aba ativa.
- Menus Exportar/Menu: `<details><summary>` (teclado nativo: Enter/Espaço abre; Esc fecha e devolve o foco ao botão — admin.js). O aviso do CSV está dentro do menu, em texto.
- Gráfico semanal: `role="img"` com `aria-label` que lista todas as semanas e valores; tabela equivalente em `<details>` "Ver dados" (`<th scope>`).
- Funil e perfil: listas com número escrito ("6 de 17"); barras são complementares (a informação está no texto).
- Selos de status: ícone + texto sempre; ícones `aria-hidden`.
- Lista de leads: `<table>` com `<th scope="col|row">` no desktop; `<ul>` de cartões no mobile. O nome é um link; o clique na linha/cartão inteiro usa o mesmo link (área estendida). Botões de ação têm `aria-label` com o nome ("Chamar Fulana no WhatsApp", "Ver lead Fulana").
- Busca: `<form role="search">` com labels visíveis. Chips: link "✕" com `aria-label="Remover filtro …"`. Contador com `aria-live="polite"`.
- Carregando: `role="status"`; erro: `role="alert"`; confirmação "Salvo" e "Senha alterada": `role="status"`.
- Modal: `role="dialog" aria-modal="true" aria-labelledby` (nome do lead). Foco entra no botão Fechar, fica preso (Tab/Shift+Tab), Esc ou clique no fundo fecham, foco volta ao item que abriu. Fundo com rolagem travada. A mesma marcação, sem `role="dialog"`, serve de página (`<article>`, `<h1>`).
- Status do lead: `<fieldset><legend>Status</legend>` com 4 radios (setas navegam; marcado = ícone + texto + ✓).
- Campos: todos com `<label for>`; erros em texto com ícone, ligados por `aria-describedby` e `aria-invalid`; senha com botão Mostrar/Ocultar (`aria-pressed`, rótulo atualizado).
- Confirmação de LGPD: passo 1 = link (funciona sem JS); passo 2 = página com `<form>` e botão de perigo; Cancelar é link.

## Ordem de Tab
Cabeçalho: marca → Visão geral → Leads → Exportar → Alterar senha → Sair (mobile: marca → abas → Menu). Conteúdo na ordem visual: cartões → "Para chamar agora" (WhatsApp, Ver lead por lead) → funil → gráfico/Ver dados → Perfil. Leads: filtros por status → busca → ordem → Filtrar → chips → linhas (nome, olho, WhatsApp). Modal: Fechar → WhatsApp → status → observação → Anonimizar → Excluir → Salvar.

## Teclado
Tudo operável sem mouse; foco sempre visível (anel 3 px; dourado sobre o cabeçalho navy).

## Alvos de toque
Botões e campos ≥ 48 px; botões pequenos, olho, fechar chip, abas e links de ação ≥ 44 px. Sem overflow horizontal em 390 (a faixa de filtros de status rola dentro do próprio contêiner).

## Contraste (calculado, WCAG 2.x; Paleta B)
| Par | Cores (frente / fundo) | Razão | Mínimo | Resultado |
|---|---|---|---|---|
| Texto principal navy-900 / bege-50 | #0a1633 / #f9f5ec | 14.46:1 | 4.5:1 | OK |
| Texto principal navy-900 / bege-100 (fundo da página) | #0a1633 / #f4ede0 | 13.66:1 | 4.5:1 | OK |
| Texto secundário ink-muted / bege-50 | #46536f / #f9f5ec | 5.46:1 | 4.5:1 | OK |
| Texto secundário ink-muted / bege-100 | #46536f / #f4ede0 | 5.16:1 | 4.5:1 | OK |
| Link blue-600 / bege-100 | #27557f / #f4ede0 | 5.28:1 | 4.5:1 | OK |
| Selo Novo: #10224f / #d6e7f6 | #10224f / #d6e7f6 | 10.27:1 | 4.5:1 | OK |
| Selo Em contato: #5a3d05 / #f6e4b5 | #5a3d05 / #f6e4b5 | 6.29:1 | 4.5:1 | OK |
| Selo Convertido: #1b5230 / #d8ead9 | #1b5230 / #d8ead9 | 5.78:1 | 4.5:1 | OK |
| Selo Não convertido: #842619 / #f6dad4 | #842619 / #f6dad4 | 5.90:1 | 4.5:1 | OK |
| Botão primário/WhatsApp: navy-900 / gold-500 | #0a1633 / #b8913a | 6.21:1 | 4.5:1 | OK |
| Botão primário hover: navy-900 / gold-400 | #0a1633 / #cdaa55 | 7.91:1 | 4.5:1 | OK |
| Botão navy: bege-50 / navy-800 | #f9f5ec / #10224f | 11.64:1 | 4.5:1 | OK |
| Botão perigo: #ffffff / #a3281b | #ffffff / #a3281b | 6.08:1 | 4.5:1 | OK |
| Perigo texto: #a3281b / bege-50 | #a3281b / #f9f5ec | 5.67:1 | 4.5:1 | OK |
| Perigo texto: #a3281b / #fbeae6 | #a3281b / #fbeae6 | 5.35:1 | 4.5:1 | OK |
| Cabeçalho: bege-50 / navy-900 | #f9f5ec / #0a1633 | 14.46:1 | 4.5:1 | OK |
| Cabeçalho: abas inativas blue-200 / navy-900 | #c6ddf2 / #0a1633 | 11.72:1 | 4.5:1 | OK |
| Cabeçalho: e-mail bege-200 / navy-900 | #e6dbc6 / #0a1633 | 11.91:1 | 4.5:1 | OK |
| Cartão destaque: número gold-400 / navy-900 (texto sobre navy) | #cdaa55 / #0a1633 | 7.91:1 | 4.5:1 | OK |
| Cartão destaque: rótulo bege-200 / navy-800 | #e6dbc6 / #10224f | 9.59:1 | 4.5:1 | OK |
| Aviso no menu: #5a3d05 / #f6e4b5 | #5a3d05 / #f6e4b5 | 6.29:1 | 4.5:1 | OK |
| Selo "dados de demonstração": blue-600 / bege-100 | #27557f / #f4ede0 | 5.28:1 | 4.5:1 | OK |
| UI: barra Novo #1b3470 / bege-50 (trilho #e6dbc6: ver abaixo) | #1b3470 / #f9f5ec | 8.59:1 | 3:1 | OK |
| UI: barra Em contato #8f6200 / bege-50 | #8f6200 / #f9f5ec | 3.97:1 | 3:1 | OK |
| UI: barra Convertido #2d7a4c / bege-50 | #2d7a4c / #f9f5ec | 3.90:1 | 3:1 | OK |
| UI: barra Não convertido #b0382a / bege-50 | #b0382a / #f9f5ec | 4.71:1 | 3:1 | OK |
| UI: barra Em contato #8f6200 / trilho #e6dbc6 | #8f6200 / #e6dbc6 | 3.27:1 | 3:1 | OK |
| UI: barra Convertido #2d7a4c / trilho #e6dbc6 | #2d7a4c / #e6dbc6 | 3.21:1 | 3:1 | OK |
| UI: barra Não convertido / trilho | #b0382a / #e6dbc6 | 3.88:1 | 3:1 | OK |
| UI: colunas do gráfico navy-700 / bege-50 | #1b3470 / #f9f5ec | 8.59:1 | 3:1 | OK |
| UI: borda de campo #6a7a9b / bege-50 | #6a7a9b / #f9f5ec | 3.22:1 | 3:1 | OK |
| UI: anel de foco navy-700 / bege-50 | #1b3470 / #f9f5ec | 8.59:1 | 3:1 | OK |
| UI: anel de foco gold-400 / navy-900 (cabeçalho) | #cdaa55 / #0a1633 | 7.91:1 | 3:1 | OK |
| UI: borda botão secundário navy-800 / bege-50 | #10224f / #f9f5ec | 11.64:1 | 3:1 | OK |

Notas: o ouro só aparece como preenchimento de botão e como texto/ícone sobre navy. Texto secundário usa ink-muted (≥ 5,1:1 nos fundos da página). O cartão "Aguardando contato" usa gold-400 sobre navy (≥ 6:1).
