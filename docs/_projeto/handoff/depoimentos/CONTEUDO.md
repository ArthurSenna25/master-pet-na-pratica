# Conteúdo — Depoimentos

**Todo o conteúdo desta versão é FICTÍCIO (demo de venda).** Cada cartão exibe o selo "exemplo". Sem nomes reais, sem fotos de pessoas, sem números ou resultados.

## Estrutura de dado (cartão e destaque)
| Campo | Obrigatório | Limite | Observação |
|---|---|---|---|
| quote | sim | cartão: 40–220 caracteres (2–3 linhas; máx. 5 linhas ≈ 280); destaque: 80–320 | citação literal, específica, sem promessa numérica |
| name | sim | 40 | nome autorizado |
| business | sim | 40 | nome do negócio |
| city | sim | 30 | "Cidade/UF" |
| team | sim | 20 | "equipe de N" |
| photo | não | 104×104 .webp (cartão); 1200×1500 .webp (destaque) | só com autorização de imagem; sem foto → avatar de iniciais (2 letras, derivado de name) |
| consent | sim (interno, não exibido) | boolean + data | sem consent=true o cartão não publica |
| isExample | sim | boolean | true exibe o selo "exemplo" |
| video | não | url + poster 1760×990 + legenda + transcrição | clique para tocar, sem autoplay, som desligado |

Exemplo JSON: `{"quote":"…","name":"…","business":"…","city":"…","team":"equipe de 3","photo":null,"consent":true,"isExample":false}`

## 6 cartões de EXEMPLO (+1 destaque)
Destaque: "[exemplo] Aqui entra a frase de destaque da cliente: a mudança concreta que ela percebeu no dia a dia do salão depois de aplicar com a Camila." — Nome da cliente · Salão exemplo · Cidade/UF · equipe de 3.

Cartões 1–6, todos com selo "exemplo", "Nome da cliente · Salão exemplo · Cidade/UF", avatar "NC":
1. "[exemplo] Aqui entra a frase da cliente sobre uma mudança concreta em a rotina da equipe do salão." — equipe de 3
2. "… em a precificação do salão." — equipe de 2
3. "… em o fluxo de atendimento do salão." — equipe de 5
4. "… em o padrão de tosa do salão." — equipe de 3
5. "… em a agenda do dia do salão." — equipe de 4
6. "… em a comunicação com o tutor do salão." — equipe de 3
(Gramática "em a/em o" é aceitável só porque é texto-modelo.) Linha de transparência (provisória, marcada): "Depoimentos com autorização de cada pessoa."

## Quando o conteúdo for real
1. Remover selos "exemplo" e "[exemplo]"; remover "texto provisório" da linha de transparência só após autorização escrita.
2. Foto: trocar `<span class="lp-av">NC</span>` por `<img class="lp-av" width="52" height="52" alt="" src=".webp">`. No destaque, trocar `.lp-fe__img` + `.lp-fe__mono` por `<img width="1200" height="1500" alt="">`; o parallax já cobre.
3. Texto de até 5 linhas: cartões da grade esticam juntos (altura igual na linha); a faixa mobile idem. Mais que isso: encurtar ou promover ao destaque (aguenta ~6 linhas).
4. Vídeo: trocar o placeholder por botão com poster que injeta o player ao clique; legenda e transcrição. Sem vídeo, remover `<figure class="lp-vid">`.
5. Nº de cartões: grade de 3 colunas — 3 ou 6 ficam completos; 4–5 deixam a última linha incompleta; 7+ → usar a faixa horizontal também no desktop (decisão em aberto). A cascata B1 pega todos os `.lp-tc`.
6. Nada de resultado numérico sem comprovação.
