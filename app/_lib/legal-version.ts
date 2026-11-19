/* Histórico
 * 0.3 (2026-11-16): campanhas (F10). Política e termos compartilhados ganham a seção da pré-inscrição da Mentoria (RASCUNHO, [PENDENTE]);
 *     consentimento passa a ter texto próprio por campanha (CONSENTIMENTOS); origem gravada só com host e caminho (sem query).
 *     O texto do consentimento "presencial" NÃO mudou (mesmo hash de 0.2); a versão sobe porque os documentos legais mudaram.
 *     Texto do consentimento da mentoria: RASCUNHO A VALIDAR PELO ADVOGADO.
 * 0.2 (2026-11-08): formulário passa a gravar dados (removido "ainda não coleta"); verbos no presente; consent_events (versão, hash
 *     SHA-256, IP do formulário em HMAC); controle de envios por hash do IP, apagado em até 24 h; cookie de sessão do painel (essencial,
 *     httpOnly, só /admin); IP do login/sessão do painel pode constar em texto puro (item em aberto); banco = Neon, AWS sa-east-1;
 *     hospedagem/região da função e transferência internacional seguem [PENDENTE]; termos: demonstração = dados fictícios.
 * 0.1 (2026-11-07): rascunho inicial.
 */
/** Versão dos textos legais. LEGAL_TEXT_VERSION é a string gravada em consent_events.texto_versao (F4)
 *  e a mesma exibida na faixa de rascunho das páginas: mudou o texto, mude aqui. */
export const LEGAL_VERSION = "0.3";
export const LEGAL_VERSION_DATE = "2026-11-16";
export const LEGAL_TEXT_VERSION = `${LEGAL_VERSION} de ${LEGAL_VERSION_DATE}`;

/** Textos EXATOS exibidos junto à caixa de consentimento, um por campanha. O servidor grava sha256(texto da campanha) + LEGAL_TEXT_VERSION.
 *  Mudou uma palavra: suba LEGAL_VERSION. O formulário renderiza este mesmo texto (ConsentLabel, com links nos rótulos finais).
 *  Os rótulos "Política de Privacidade" e "Termos de Uso" viram link (consent.ts): mantenha-os. */
export const CONSENTIMENTOS = {
  presencial:
    "Concordo em ser contatado(a) pelo WhatsApp e com o tratamento dos meus dados para esta finalidade, conforme a LGPD. Veja a Política de Privacidade e os Termos de Uso.",
  // RASCUNHO A VALIDAR PELO ADVOGADO (DECISOES-LGPD 5.19).
  mentoria:
    "Concordo em receber, pelo WhatsApp, um contato individual para avisar sobre a abertura da turma da Mentoria Master Pet, e com o tratamento dos meus dados (nome, WhatsApp, cidade, negócio e respostas do formulário) apenas para essa finalidade, conforme a LGPD. Posso retirar o consentimento a qualquer momento. Veja a Política de Privacidade e os Termos de Uso.",
} as const;

export type CampanhaConsentimento = keyof typeof CONSENTIMENTOS;

/** Alias do texto da campanha original (presencial): testes e código antigo seguem valendo. */
export const CONSENT_TEXT = CONSENTIMENTOS.presencial;
