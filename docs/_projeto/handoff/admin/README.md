# Handoff — Painel (admin) para Next.js

Admin claro (bege + navy), mesma marca da landing-v6, em modo ferramenta. Decisão: **claro** (leitura no celular sob luz forte; navy fica como estrutura).

## Arquivos
- `README.md` (este), `admin.html`, `admin.css`, `admin.js`
- `MOTION.md`, `COMPONENTES.md`, `DADOS.md`, `ACESSIBILIDADE.md`
- `tokens/status.css` (tokens NOVOS)
- `assets/icons.svg` (sprite de 18 ícones 24×24, traço 1,75 px)
- `preview/` + `preview/LEIA-ME.md`

## Tela do protótipo → rota
| Tela (id em admin.html) | Rota |
|---|---|
| login (+ estados erro, bloqueio, pós-troca) | /admin/login |
| visao, visao-2, visao-0, menu-exportar, senha-sucesso | /admin |
| leads, leads-filtro, leads-sem-resultado, leads-0, leads-carregando, leads-erro | /admin/leads |
| lead-modal, lead-salvando | /admin/leads com modal (rota interceptada) sobre /admin/lead/[id] |
| lead-pagina | /admin/lead/[id] (acesso direto = mesma marcação sem role=dialog) |
| anonimizar, excluir (passo 2) | /admin/lead/[id]/anonimizar e /admin/lead/[id]/excluir (passo 1 = link no bloco LGPD) |
| senha | /admin/senha |
| componentes | só catálogo; não portar |

## Sem JS
Menu Exportar e Menu = `<details>`. Modal = link para a página inteira (o JS só intercepta o clique para abrir sobre a lista). Anonimizar/Excluir = link → página com `<form>`. Gráficos = HTML/CSS com tabela "Ver dados". Salvar = form POST normal. Mostrar/ocultar senha e contador são só melhoria.

## Novo x reaproveitado
Reaproveitado da landing: tokens de cor (navy/ouro/bege/azul), Playfair Display 600 + Source Sans 3 400/600, raios, sombras tingidas de navy, `--bg-navy-depth`, movimento (`--dur-*`, `--ease`, `--motion-reveal-ease`), foco, `--border-input`.
Novo: tokens de status/perigo e componentes `ad-*`. Dependências novas: **nenhuma**.

## Como portar o CSS (Tailwind v4 só no admin)
`admin.css` entra como CSS do layout /admin (escopo `.ad`); não usa preflight. Breakpoints são container queries (`@container`): o wrapper `.ad-c`/`.ad-ov` precisa de `container-type:inline-size`. Os tokens da landing precisam estar disponíveis no admin (`styles.css`/tokens), mais `tokens/status.css`.

## O que mudou em relação ao que mostrei antes
1. Novas telas: menu Exportar aberto, lead salvando, senha alterada (sucesso).
2. admin.css reorganizado por componente; regras de demonstração movidas para o bloco 12 (não portar); ícones extraídos para assets/icons.svg.
3. Comentários `DEMO: não portar` em todas as telas.
4. Divergência conhecida: no protótipo, o gráfico e o "Perfil dos leads" ignoram o lead anonimizado (16 de 17). No app devem contar TODOS (anonimizado mantém criado_em e os campos agregados).

## Decisões em aberto
1. Texto do que Anonimizar apaga/mantém e do que Excluir mantém (validar com o jurídico/LGPD).
2. "Salvo às HH:MM" no servidor: mensagem pós-redirect.
3. Aviso "Senha alterada" no login e/ou no painel (ambos desenhados).
4. Perfil dos leads: fechado por padrão (mudar com `open`).
5. Exportar no mobile fica dentro de "Menu".
6. Linha "Esta semana × semana passada": manter?
7. Modal: Intercepting Routes do Next (@modal) ou client component; a marcação serve aos dois.
8. Copy do lado da marca no login.
