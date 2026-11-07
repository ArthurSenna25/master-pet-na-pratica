# Checklist de entrega

**Técnico**
- [ ] `tsc --noEmit`, lint, build e testes (se houver) passam no CI/local
- [ ] Deploy de produção ok; rollback sabido
- [ ] Domínio, DNS, SSL, redirect www ↔ raiz
- [ ] E-mail transacional com SPF/DKIM/DMARC; envio de teste recebido (e fora do spam)
- [ ] Variáveis de ambiente de produção; nenhum segredo no repo
- [ ] Headers de segurança ativos (verificar no navegador)
- [ ] Lighthouse mobile: perf/a11y/SEO/boas práticas; CWV razoáveis
- [ ] Testado em iPhone/Android reais (ou Playwright webkit + Chromium); iPad
- [ ] 404, favicon, OG image, sitemap, robots
- [ ] N2+: backup/restore testado, Sentry ativo, revisão independente feita

**Privacidade (LGPD)**
- [ ] Política de privacidade publicada e linkada nos formulários
- [ ] Consentimento não pré-marcado (quando base = consentimento); registro de aceite
- [ ] Banner de cookies com "rejeitar"; analytics/pixels só após consentimento
- [ ] Fluxo de exclusão/contato do titular definido com o cliente

**Conteúdo e negócio**
- [ ] Textos e imagens finais aprovados; links e telefones testados
- [ ] Analytics + meta de sucesso configurados (conversão do CTA medida)
- [ ] Formulário chega a quem deve; resposta automática (se combinado)

**Entrega ao cliente**
- [ ] Documento de entrega: como editar conteúdo, contatos, quem paga o quê (domínio, hospedagem, e-mail)
- [ ] Acessos entregues por gerenciador de senhas (nunca por chat/e-mail em texto)
- [ ] Termo de aceite assinado/confirmado por escrito
- [ ] Cobrança final emitida; janela de suporte e o que ela cobre
- [ ] Oferta de manutenção/retainer apresentada

**Pós**
- [ ] Case de portfólio (prints, métrica, depoimento) · retro de 10 min · `extract-approach` · atualizar `01-FLUXO`
