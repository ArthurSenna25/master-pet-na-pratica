/* Histórico
 * 0.2 (2026-11-08): formulário passa a gravar dados (removido "ainda não coleta"); verbos no presente; consent_events (versão, hash
 *     SHA-256, IP do formulário em HMAC); controle de envios por hash do IP, apagado em até 24 h; cookie de sessão do painel (essencial,
 *     httpOnly, só /admin); IP do login/sessão do painel pode constar em texto puro (item em aberto); banco = Neon, AWS sa-east-1;
 *     hospedagem/região da função e transferência internacional seguem [PENDENTE]; termos: demonstração = dados fictícios.
 * 0.1 (2026-11-07): rascunho inicial.
 */
/** Versão dos textos legais. LEGAL_TEXT_VERSION é a string gravada em consent_events.texto_versao (F4)
 *  e a mesma exibida na faixa de rascunho das páginas: mudou o texto, mude aqui. */
export const LEGAL_VERSION = "0.2";
export const LEGAL_VERSION_DATE = "2026-11-08";
export const LEGAL_TEXT_VERSION = `${LEGAL_VERSION} de ${LEGAL_VERSION_DATE}`;

/** Texto EXATO exibido junto à caixa de consentimento. O servidor grava sha256(CONSENT_TEXT) + LEGAL_TEXT_VERSION.
 *  Mudou uma palavra: suba LEGAL_VERSION. O LeadForm renderiza este mesmo texto (com links nos rótulos finais). */
export const CONSENT_TEXT =
  "Concordo em ser contatado(a) pelo WhatsApp e com o tratamento dos meus dados para esta finalidade, conforme a LGPD. Veja a Política de Privacidade e os Termos de Uso.";
