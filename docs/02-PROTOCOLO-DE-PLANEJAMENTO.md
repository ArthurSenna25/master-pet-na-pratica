# 02 · Protocolo de Planejamento (v4)

**Quando ler:** planejamento completo em N2+. Em N0/N1 use só os itens marcados ⚡.
Substitui o `PROTOCOLO-MESTRE-PLANEJAMENTO` v3 (que assumia modelo frágil e processo único para tudo).

## Regras

1. ⚡ Triagem primeiro (`00`). Nunca planeje mais fundo do que o nível pede.
2. ⚡ Nenhum código de seção antes do visual aprovado (direção visual em N0; design system em N1+).
3. ⚡ Uma fase por vez: planeje a fase atual, execute, valide, só então a próxima. Prompt/fase que não cabe numa sessão deve ser fatiado antes de começar.
4. Decisões caras de reverter (banco, auth, hospedagem, billing) viram ADR curto (`templates/ADR.template.md`) — só N2+.
5. Se tentar pular etapa "porque já dá pra imaginar o resultado": não pule. Retrabalho histórico veio de design genérico, requisito de segurança esquecido e prompt grande demais.

## Etapas

**E1 · Requisitos (`03`).** Por nível: brief (N0), + sitemap/histórias (N1), + RF/RNF com MoSCoW e critérios de aceite (N2), + casos de uso e regras de negócio (N3), + modelagem de domínio (N4). Mapeie a **jornada** de cada persona principal (descoberta → validação → objeção → decisão → pós-conversão) e também a do **admin**: é aí que nascem requisitos que ninguém lembraria (ex.: notificação de lead novo).

**E2 · Design (`04`).** ⚡ Conceito central que amarra narrativa a linguagem visual concreta, com segunda passada anti-clichê. Paleta nomeada, tipografia, 1 elemento-assinatura, valores concretos (nunca "moderno", "impactante").

**E3 · Motion (`04 §Motion`).** ⚡ Escolha o nível conscientemente. Nível 3 (vídeo/imagem controlado por scroll) só com justificativa e aceite do trade-off (abaixo).

**E4 · Compatibilidade (`09 §Cross-device`).** ⚡ Matriz de dispositivos definida agora, não no fim. Vira fase de QA no roadmap.

**E5 · Stack e arquitetura (`05`).** Aplicar a stack do nível; cada item extra com justificativa de uma linha. Checklist de aproveitamento (decida, não instale tudo):
- [ ] shadcn/21st cobre os componentes funcionais?
- [ ] Alguma seção-vitrine justifica Skiper UI/Vengeance UI/Lightswind/ReactBits em vez de código do zero?
- [ ] Vale gerar um componente via 21st.dev Magic (`/ui`) antes de codar à mão?
- [ ] GSAP (público) × Motion (admin) está claro? React Spring só para gesto (drag/swipe)?
- [ ] N2+: Better Auth + RBAC desde o schema? Zod client+server? Rate limit nos pontos públicos?
- [ ] Upload de mídia com assinatura (Cloudinary) — só se houver upload.

**E6 · Segurança e testes (`08`, `09`).** Desde o primeiro schema (N2+), não depois.

**E7 · Roadmap em fases.** Setup → design system em código → páginas sem animação → motion → admin/CRUDs → segurança/testes/QA cross-device → deploy. Cada fase com critério objetivo de pronto. ⚡ Em N0: scaffold → seções → QA/entrega.

**E8 · Entregáveis do planejamento.** N0: brief + TRIAGEM + `DESIGN.md`. N1: + sitemap. N2+: requisitos, modelo de dados, ADRs, `CLAUDE.md`, scaffold e prompt da Fase 1.

## Técnica de interação cinematográfica (scroll controla vídeo/imagem) — só com pedido explícito

Não existe opção "melhor" universal; escolha com consciência:

| | A) Canvas com sequência de frames (estilo Apple) | B) `<video>` com `currentTime` ligado ao scroll |
|---|---|---|
| Como | `ffmpeg` extrai N imagens; pré-carrega; `<canvas>` desenha o frame do progresso via `ScrollTrigger` | `video.currentTime = duration * progresso` em `onUpdate` throttled por `requestAnimationFrame` |
| Vantagens | Scrub suave, confiável no Safari/iOS | Setup simples, 1 arquivo |
| Custo | Peso (dezenas–centenas de imagens), estado de loading, passo de build | Seek por frame engasga (principalmente iOS); exige `muted playsinline preload="auto"` literais no HTML; só após `loadedmetadata`; encaixa no keyframe |
| Usar quando | Momento-vitrine (Hero ou 1 seção-âncora) | Interação secundária |

Regra: **não escolha B só por ser simples se o objetivo é polimento "cinematográfico"**; B abaixo da ambição decepciona mais do que não ter scroll-vídeo. Em N0/N1 o padrão é não usar.

## Gates de aprovação
Triagem · visual · plano · 1ª versão responsiva · antes do deploy. Entre gates, o Claude não pede confirmação de detalhes triviais.
