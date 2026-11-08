import { CONSENT_TEXT } from "./legal-version";

export interface ConsentPart { text: string; href?: string }

/** Trechos do texto que viram link. O texto contínuo renderizado continua IDÊNTICO a CONSENT_TEXT. */
const LINKS: Record<string, string> = {
  "Política de Privacidade": "/politica-de-privacidade",
  "Termos de Uso": "/termos-de-uso",
};

const SPLIT = new RegExp(`(${Object.keys(LINKS).join("|")})`);

export function consentParts(text: string = CONSENT_TEXT): ConsentPart[] {
  return text.split(SPLIT).filter(Boolean).map((t) => (LINKS[t] ? { text: t, href: LINKS[t] } : { text: t }));
}
