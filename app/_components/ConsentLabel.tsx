import Link from "next/link";
import { Fragment } from "react";
import { consentParts } from "../_lib/consent";
import { CONSENTIMENTOS, type CampanhaConsentimento } from "../_lib/legal-version";

/** Texto do consentimento da campanha, com os dois rótulos finais como link. O texto contínuo é IDÊNTICO a CONSENTIMENTOS[campanha]
 *  (o hash gravado no servidor é o desse texto). Usado pelos formulários das duas campanhas. */
export function ConsentLabel({ campanha }: { campanha: CampanhaConsentimento }) {
  return (
    <>
      {consentParts(CONSENTIMENTOS[campanha]).map((p, i) => (
        <Fragment key={i}>
          {p.href ? <Link href={p.href} target="_blank" rel="noopener noreferrer">{p.text}</Link> : p.text}
        </Fragment>
      ))}
    </>
  );
}
