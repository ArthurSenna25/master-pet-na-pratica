# preview

A ferramenta de captura só fotografa a janela de 907 × 540 px e não permite mudar o tamanho. Por isso:
- **1440-NN-*.png**: tela renderizada em 1440 px de largura e reduzida a 63% (layout desktop real; texto menor que o real). Mostram o topo; algumas têm segunda captura com rolagem.
- **390-NN-*.png**: tela renderizada em 390 px de largura (faixa central), tamanho real, em fatias de ~500 px.
- Ícones podem aparecer levemente diferentes (a captura redesenha SVG).

## Cobertura
Login (padrão, erro, bloqueio, pós-troca — nos "estados"), Visão geral (17, 2, 0 leads), Leads (dados, filtro, vazio com filtro, 0, carregando, erro), modal do lead, página do lead, Anonimizar (passo 2), Excluir (passo 2), Alterar senha (erros por campo), catálogo.
**Faltam** (existem em admin.html, mas não foram capturados): menu Exportar aberto (#menu-exportar), modal salvando (#lead-salvando), senha alterada com sucesso (#senha-sucesso), modal mobile na rolagem final e hover/foco ao vivo. A ferramenta de captura travou ao tentar fotografá-los.
