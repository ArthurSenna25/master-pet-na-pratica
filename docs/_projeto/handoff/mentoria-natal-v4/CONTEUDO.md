# CONTEUDO — textos e status (v2)

Legenda: **FATO** = dito pela Camila · **PROV** = provisório (selo "provisório" ou "a definir") · **EX** = exemplo (selo "exemplo" / "foto a receber"). Nada aqui tem preço, desconto, vagas contadas, contagem regressiva, sorteio ou número de resultado.

| Seção | Texto | Status |
|---|---|---|
| Header | CTA "Entrar na lista da turma" | FATO (nome ajustável) |
| 1 Hero | Selo "Pré-inscrição aberta" (sem prazo) | FATO |
| | H1 "Comece o ano com o seu banho e tosa organizado." | copy de marca, revisar |
| | "Mentoria online e individual… turma abre no ano que vem… sem pagar nada" | FATO |
| | "Cerca de 10 encontros de ~2 h" | **PROV** (selo) |
| | "Abertura: no ano que vem, data a definir" | FATO (data = a definir) |
| | Cartão "Lista da turma" (aviso em primeira mão, WhatsApp individual, sem pagar) | FATO |
| 2 Problema | 4 dores: dia manda em você / cada um faz de um jeito / preço sem critério / equipe sem alinhamento | copy de marca, **validar com a Camila** (dores reais) |
| 3 Mentoria | Trilha: raio-X, gargalos, equipe, precificação+combos+planos, padrões, organização+métodos | FATO (estrutura); descrições = copy |
| | Tags: ~10 encontros de ~2 h | **PROV**; exercícios, materiais, acompanhamento e suporte: FATO |
| 4 Rotina | 5 pares antes → depois (sem números) + nota "sem promessa de resultado" | copy, revisar |
| 5 Para quem | 3 sim / 3 não | **PROV** (selo) |
| 6 Camila | "Especialista em banho e tosa, sócia do Center Vet, Lins/SP; referência em atendimento veterinário em Lins" | FATO (mesmo da v6) |
| | 2 fotos | **EX** — placeholders "foto a receber" |
| 7 Pré-inscrição | 3 passos; "Preciso pagar? Não." | FATO |
| | "Ninguém é adicionado a grupo sem pedir" | FATO |
| 8 Bônus | "Bônus exclusivo para a lista: a definir" + apresentação do presente | **EX** (selo "exemplo") |
| 9 Depoimentos | 2 cartões marcadores, recolhido | **EX** — sem texto inventado de pessoa; só entra com relato real e autorização |
| 10 FAQ | quando abre (no ano que vem; data a definir) · quanto custa (na abertura) · pagar para entrar (não) · ao vivo (individual e online; detalhes a definir) · quantas pessoas (individual; tamanho a definir) · acompanhamento (exercícios, materiais, suporte; detalhes a definir) | FATO + **PROV** (selos "a definir") |
| 11 Formulário | Rótulos, mensagens de erro, aviso "demonstração: use dados fictícios" | rótulos FATO; opções de tempo/equipe/desafio **PROV** |
| | Consentimento | **PLACEHOLDER** (texto final no código) |
| | Confirmação: "Pronto, você está na lista!", o que acontece agora (sem prazos), grupo opcional | texto revisar; link do grupo **EX** |
| 12 Rodapé | Links `/politica-de-privacidade`, `/termos-de-uso` | FATO |

## O que muda quando o conteúdo for real
- Remover selos `provisório`/`exemplo`/`foto a receber` conforme cada item for confirmado (um selo = um `<span class="nm-seal">`; apagar o elemento).
- Formato: ajustar "cerca de 10 encontros, ~2 h" (hero, trilha, FAQ).
- Data de abertura e preço: trocar "a definir" (hero, passo 3, FAQ) — **não** adicionar contagem regressiva nem urgência.
- Bônus: substituir a caixa e o título; manter o presente (ou trocar a ilustração).
- Fotos: trocar `.nm-ph__in` por `<img>` webp com `width/height`, `loading="lazy"` (nunca no hero), alt descritivo; nunca imagem gerada por IA de pessoa.
- Depoimentos: com nome, cidade, autorização; sem selo "exemplo" só quando real.
- Consentimento: texto final definido com o jurídico; manter checkbox desmarcado e links.

## Mudanças de texto na v2 (conteúdo e fatos inalterados)
| Onde | Texto | Status |
|---|---|---|
| 1 Abertura | Dica "Role para abrir" (decorativa, `aria-hidden`) | microcopy |
| 2 Problema | "Capítulo N de 4"; uma dor por capítulo (mesmos 4 títulos da v1) | copy, **validar com a Camila** |
| 3 Trilha | 6 estações = mesmas etapas da v1; o chip "Cerca de 10 encontros, ~2 h" segue **PROV** | FATO + PROV |
| 4 Interação (nova) | "Onde o seu dia trava?" + 5 respostas: *O dia vira correria e eu apago incêndio* → Gargalos · *Cada pessoa da equipe faz de um jeito* → Equipe · *Não sei se o meu preço está certo* → Precificação · *O atendimento muda conforme quem atende* → Padrões · *Não sei por onde começar* → Raio-X | copy nova, **revisar**; a lógica é só orientação, sem promessa |
| 4 Interação | "A trilha começaria por: …" + frase da estação | derivado do texto da trilha |
| 5 Antes/depois | mesmas 5 linhas, agora no divisor ("Improviso" / "Processo") | copy v1 |
| 7 Camila | Legendas dos placeholders: "Retrato da Camila — enquadramento 4:5, olhar para a esquerda, luz de janela", "Camila no atendimento" | **EX** (selo "foto a receber") |
| 9 Bônus | Título passou a "Quem entra antes da abertura recebe um convite." (sem "presente", para não confundir com o 3D) | **EX** (selo "exemplo") |
| 12 Formulário | H2 "Entre na lista e saiba primeiro."; aviso "Pré-selecionado pela sua escolha em 'Onde o seu dia trava?'" | copy |
Continua valendo a lista de proibidos: sem preço, faixa de preço, vagas, contagem regressiva, sorteio, depoimento sem selo, número de resultado, foto de pessoa gerada por IA. O valor de mercado citado no briefing **não aparece** em nenhum lugar da página.

### O que muda quando o conteúdo for real
Igual à v1, mais: (1) trocar os dois placeholders de Camila por `<img>` webp com `width/height` aplicando `filter:url(#nm-duotone)` (já definido no HTML); (2) confirmar/ajustar o mapeamento das 5 respostas; (3) o 3D e o poster não mudam com o conteúdo.


## v4 · Etapa A — Camila e Bônus (ponto focal do rosto)
Todas as molduras da Camila são 4:5 (mesma proporção das fotos, sem corte), com a mesma linha de topo e de base. `object-position` = ponto focal (x% y%):
| Foto | Arquivo | Ponto focal |
|---|---|---|
| Retrato sentada | camila-retrato.webp | 46% 12% (rosto no terço superior) |
| Camiseta bordada | camila-logo.webp | 47% 22% |
| Corpo inteiro | camila-112.webp | 52% 18% |
| Bônus | camila-bonus.webp | 40% 16% |
Foto nova: definir o ponto focal aqui antes de publicar. Regra: o rosto nunca é cortado nem fica sob o header fixo (`scroll-margin-top` = header + 8px).


## v4 · Etapa B — Depoimentos e FAQ
**Depoimentos (todos FICTÍCIOS):** 1 destaque + 4 cartões + 2 espaços de vídeo (vertical no topo, horizontal na faixa). Cada cartão e cada vídeo tem selo "exemplo". Autoria genérica ("Nome da aluna · Banho e tosa · Cidade/UF"), avatar de iniciais "NA", sem foto de pessoa, sem número de resultado. Textos de exemplo: explicar o mesmo passo várias vezes; preço sem conta; equipe atendendo do mesmo jeito; encontros individuais; correria com ordem; padrão por escrito.
**Quando houver depoimento real:** (1) autorização POR ESCRITO de cada pessoa (texto e, se houver, imagem/vídeo), guardada fora da página; (2) nome, tipo de negócio e cidade/UF reais, como a pessoa autorizou; (3) foto real da pessoa (opcional) no lugar do avatar de iniciais, com alt; nunca imagem gerada por IA; (4) vídeo: arquivo próprio com legenda e transcrição, sem autoplay e sem som; trocar o botão de demonstração por `<video controls preload="none" poster>`; (5) remover o selo "exemplo" só do item aprovado; (6) sem números de resultado; (7) atualizar o aviso do cabeçalho ("Todos os relatos abaixo são fictícios…").
**FAQ:** 6 perguntas inalteradas; respostas pendentes continuam "a definir" (data, preço, ao vivo, tamanho da turma, acompanhamento). Nada novo foi respondido.


## v4 · FAQ v3 e CTA (Etapa C)
- FAQ: foto da Camila removida; texto de apoio "Respostas curtas. O que ainda não foi definido está marcado como “a definir”." Respostas inalteradas.
- CTA único em toda a página: **"Entrar na lista da turma"**. Microcopy: "Gratuito. Você só recebe o aviso da abertura." (meio da página, passos 1 e 2 do formulário).
- Fechamento: título "Seu banho e tosa pode andar sem você presa na bancada."; apoio "Entre na lista da turma e receba o aviso da abertura em primeira mão." Foto: camila-retrato.webp, ponto focal 46% 10%.
- Sem urgência, sem contagem regressiva, sem "vagas".
