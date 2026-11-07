# 09 · Qualidade, QA e Entrega

**Quando ler:** antes de dizer "pronto", ao fazer QA, performance, cross-device, SEO, entrega.

## 1. Definition of Done por nível

| Nível | Pronto quando |
|---|---|
| N0 | `tsc --noEmit`, lint e build passam · screenshots mobile+desktop conferidos · Lighthouse mobile bom (indicativo ≥ 90 perf/a11y/SEO) · formulário testado de ponta a ponta · política/consentimento no ar · headers ativos · deploy + domínio + e-mail ok |
| N1 | N0 + matriz de dispositivos + todas as páginas navegáveis + SEO por página |
| N2 | N1 + Vitest da lógica + Playwright nos fluxos críticos + checklist `08` N2 + backup/restore testado + revisão independente |
| N3/N4 | N2 + integração/webhooks + CI + monitoramento + plano de rollback + checklist `08` do nível |

## 2. Portões de qualidade (após CADA etapa, não só no fim)
`tsc --noEmit` · lint · build · test (se existir). Falhou: corrija a **causa raiz**; nunca mascare com `any`/`@ts-ignore`/`.d.ts` falso. Mesmo erro 3×: pare e diagnostique.
Cada seção visual nova: confirmação por **screenshot real** (Playwright), mobile e desktop — nunca "o código parece certo".
`npm audit`: triar cada item. Dependências: uma por vez, validar antes da próxima.

## 3. Performance (Core Web Vitals, p75 em campo)
LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1.
- Imagens: AVIF/WebP, `next/image`, dimensões, `priority` só no hero, lazy abaixo da dobra.
- Fontes: `next/font`, subset, ≤ 2 famílias e ≤ 3 pesos.
- JS: poucos pacotes; animação pesada só por justificativa; carregue sob demanda (`next/dynamic`).
- Evite layout shift (dimensões, reserva de espaço); não bloqueie render com scripts de terceiros.
- Meça no mobile com throttling; Lighthouse local + Vercel Speed Insights depois.

## 4. SEO e descoberta
`<title>` e meta description por página · Open Graph/Twitter · `sitemap.xml` e `robots.txt` · um `h1` · URLs limpas · `lang="pt-BR"` · dados estruturados (Schema.org, ex.: `LocalBusiness`) · texto real indexável (não só imagem) · Search Console · analytics só após consentimento.

## 5. Cross-device e cross-browser (decidido no planejamento, executado aqui)

**Matriz mínima:** iPhone (Safari/WebKit) · Android (Chrome) · iPad (Safari; layout intermediário próprio) · tablet Android · desktop (Chrome, Safari, Firefox, Edge). Prioridade extra conforme o público (ex.: majoritariamente iOS = redobrar WebKit).

**Armadilhas de iOS Safari/WebKit — verifique sempre:**
- Altura: use `100dvh`/`100svh`, nunca `100vh` puro.
- Autoplay de vídeo exige `muted` **e** `playsinline` literais no HTML.
- `backdrop-filter` pode precisar do prefixo `-webkit-`; teste de verdade.
- `position: sticky` quebra se um ancestral tiver `overflow: hidden`.
- Notch/Dynamic Island: `env(safe-area-inset-*)` em layouts full-bleed.
- Hover não existe em toque: nada crítico (CTA, informação) só em `:hover`.
- Teste no Playwright com engine `webkit` explícito; passar no Chromium não cobre o caso. Sempre que possível, confirme num aparelho real.

## 6. Acessibilidade (rápido)
Teclado completo · foco visível · contraste AA · `alt`/`label` · axe/Lighthouse sem erros críticos · `prefers-reduced-motion`. Detalhe em `04 §4`.

## 7. Revisão
- Auto-revisão: o diff cumpre os critérios de aceite? Sobrou código morto, `console.log`, TODO, segredo?
- N2+: revisão independente (subagente ou skill de code review) com contexto limpo; o humano lê o diff de auth, formulários, pagamentos, permissões.
- Segurança: checklist do nível em `08`.

## 8. Entrega (checklist completo em `templates/checklist-entrega.md`)
Deploy de produção · domínio/DNS/SSL e redirect www · e-mail transacional com SPF/DKIM/DMARC · analytics + consentimento · 404 e favicon · variáveis de ambiente de produção · backup (N2+) · monitoramento de erro (N2+) · documentação de entrega ao cliente (como editar, contatos, acessos via gerenciador de senhas, quem paga o quê) · termo de aceite · cobrança final · janela de suporte combinada.

## 9. Manutenção e pós-lançamento
Atualizar dependências periodicamente (retainer) · revisar `npm audit` · acompanhar métrica de sucesso definida no escopo · backlog de ideias separado do que foi vendido.
