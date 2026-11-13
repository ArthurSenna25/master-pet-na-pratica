# Componentes — Painel

Todos sob o escopo `.ad`, com prefixo `ad-`. Tela de catálogo: `admin.html#componentes`.

| Componente | Classe | Variantes / estados |
|---|---|---|
| Botão | `.ad-btn` | `--primary` (ouro, ação principal/WhatsApp), `--secondary`, `--navy`, `--danger`, `--dangero` (contorno), `--onnavy` (cabeçalho); tamanhos `--sm` 44 px, padrão 48 px, `--lg` 56 px; estados: padrão, hover (`.is-hover` no catálogo), foco (anel 3 px), desativado (`aria-disabled`, 55% de opacidade, sem clique), carregando (só o rótulo muda: "Salvando…", "Entrando…"; sem spinner, para não haver loop) |
| Link de ação | `.ad-link` | 44 px de altura útil |
| Selo de status | `.ad-st--novo/contato/conv/nao` | cor + ícone + texto |
| Cartão de métrica | `.ad-kpi` | padrão; `--key` (navy, clicável, "Aguardando contato"); sem dados ("Ainda sem dados suficientes") |
| Linha "Para chamar agora" | `.ad-call` | normal; antiga (> 48 h: ícone de alerta + texto em âmbar escuro) |
| Barra de proporção | `.ad-bar--novo/…/neutral` | preenche por `--p` |
| Gráfico semanal | `.ad-chart`, `.ad-wk` | semana em andamento listrada; colunas de 4 a 8 semanas; "Ver dados" |
| Aba de status | `.ad-pill` | padrão, ativa (`aria-current`), com contagem |
| Chip de filtro | `.ad-chip` | com ✕ (44 px) + "Limpar filtros" |
| Busca/filtros | `.ad-tool` | busca + ordem + Filtrar |
| Tabela de leads | `.ad-tbl` | ≥ 900 px; linha inteira clicável; hover |
| Cartão de lead | `.ad-lcard` | < 900 px |
| Estados de lista | `.ad-empty`, `.ad-err`, `.ad-loading` | vazio (0), vazio com filtro, carregando, erro |
| Campo | `.ad-fld` | normal, hover, foco, erro (`.is-err`), desativado; senha com Mostrar/Ocultar (`.ad-pw`); textarea com contador |
| Seletor de status | `.ad-stsel` + `.ad-rd` | 4 radios em grade 2×2 |
| Modal / página de lead | `.ad-ov` > `.ad-dlg` | modal ≥ 720 px; tela cheia < 720 px; barra Salvar fixa (`.ad-savebar`, sticky) |
| Bloco LGPD | `.ad-lgpd` | separado, contorno tracejado de perigo |
| Confirmação em 2 passos | `.ad-conf` | Anonimizar (âmbar) / Excluir (perigo): "Será apagado", "Será mantido", aviso, botão de perigo, Cancelar |
| Cabeçalho | `.ad-hd` | uma linha ≥ 1000 px; abaixo: marca + abas + "Menu" |
| Menu | `.ad-dd` | Exportar (com aviso do CSV), Menu (mobile) |
| Avisos | `.ad-note`, `.ad-alert`, `.ad-okbar`, `.ad-warn` | info, erro, sucesso, perigo |

## Responsividade
Breakpoints por **container query** (não por viewport): 900 px (tabela, 4 cartões, 2 colunas), 720 px (modal), 1000 px (cabeçalho). Em Tailwind v4: `@container` / `@min-[900px]:`. Todo box-sizing e reset estão explícitos em `.ad` (sem preflight).


## Marcação mínima e dados (por componente)
- **Cartão de métrica** — `<div class="ad-kpi"><p class="ad-kpi__l">Rótulo</p><p class="ad-kpi__n">N</p><p class="ad-kpi__s">subtexto</p></div>`; destaque: `<a class="ad-kpi ad-kpi--key" href="/admin/leads?status=novo">…<span class="ad-kpi__go">Ver lista</span></a>`. Dados: ver DADOS.md (Visão geral).
- **Selo de status** — `<span class="ad-st ad-st--novo"><svg class="i" aria-hidden="true"><use href="…#i-dot"/></svg>Novo</span>`; mapa: novo→dot, em_contato→phone, convertido→check, nao_convertido→x. Dado: status.
- **Tabela de lead** — `<table class="ad-tbl"><thead>…</thead><tbody><tr><th scope="row"><a class="ad-rl" href="/admin/lead/ID">Nome</a></th><td>Negócio</td><td>Cidade/UF</td><td>selo</td><td class="ad-dt">data · hora</td><td class="ad-act"><a class="ad-eye" aria-label="Ver lead …">…</a><a class="ad-btn ad-btn--wa ad-btn--sm">…</a></td></tr></tbody></table>`. O link `.ad-rl` estende o clique à linha (`::after` absoluto; `tr` é `position:relative`).
- **Cartão de lead (mobile)** — `<ul class="ad-lc"><li class="ad-lcard"><div class="ad-lcard__top"><a class="ad-rl">Nome</a>selo</div><p class="ad-lcard__m">negócio · cidade</p><p class="ad-lcard__d">data</p><div class="ad-lcard__a">WhatsApp + "Ver lead"</div></li></ul>`. Mesmos dados da tabela.
- **Chip** — `<li class="ad-chip">Status: Novo<a href="/admin/leads" aria-label="Remover filtro Status: Novo">✕</a></li>` + `<a class="ad-link ad-clear">Limpar filtros</a>`. Dado: parâmetros da URL.
- **Modal** — `<div class="ad-ov"><div class="ad-dlg" role="dialog" aria-modal="true" aria-labelledby="t">…</div></div>`; página: `<article class="ad-dlg ad-dlg--page">`. Conteúdo: form com `.ad-dl` (dados), `.ad-stsel` (status), `.ad-fld` textarea (observação), `.ad-lgpd`, `.ad-savebar`.
- **Confirmação** — `<section class="ad-card ad-conf">…<div class="ad-two">apagado | mantido</div><form class="ad-conf__f"><button class="ad-btn ad-btn--danger">…</button><a class="ad-btn ad-btn--secondary">Cancelar</a></form></section>`.
- **Campos** — `<div class="ad-fld [is-err]"><label for>…</label><input …><p class="ad-hint2">dica ou erro</p></div>`; senha: `.ad-pw` + `.ad-pw__b`.
- **Botões** — ver tabela acima; carregando = só troca o rótulo + `aria-disabled="true"`.
- **Gráfico semanal** — `<div class="ad-chart" role="img" aria-label="…"><div class="ad-chart__y">…</div><ol class="ad-wks" style="--c:N"><li class="ad-wk [is-cur]"><div class="ad-wk__plot"><span class="ad-wk__v">v</span><span class="ad-wk__bar" style="--h:0..1"></span></div><span class="ad-wk__l">dd/mm</span></li>…</ol></div>` + `<details class="ad-data"><table class="ad-tb-s">…</table></details>`. `--h` = valor ÷ topo do eixo (topo = máx(4, maior valor), par). Dados: leads por semana.
- **Funil** — `<ul class="ad-fn"><li><div class="ad-fn__t">selo<span class="ad-fn__n"><b>N</b> de T</span></div><div class="ad-bar ad-bar--novo"><i style="--p:0..1"></i></div></li></ul>`.
- **Para chamar agora** — `<ul class="ad-call-l"><li class="ad-call"><div class="ad-call__who"><b>Nome</b><span>Negócio · Cidade/UF</span></div><span class="ad-call__age [is-old]">há X</span><div class="ad-call__act">botão WhatsApp + link</div></li></ul>`; vazio: `.ad-empty--sm`.
- **Perfil dos leads** — `<details class="ad-card ad-perfil"><summary>…</summary><div class="ad-pf-g"><div class="ad-pf"><h3>Maior desafio</h3><ul><li><span>rótulo</span><b>N</b><div class="ad-bar ad-bar--neutral"><i style="--p"></i></div></li></ul></div>…</div></details>