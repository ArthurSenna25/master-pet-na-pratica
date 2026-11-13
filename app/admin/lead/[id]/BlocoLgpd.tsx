import { Icone } from "../../Icone";
import { NavLead } from "./NavLead";

/** Passo 1 (link, funciona sem JS): leva ao passo 2 com ?confirmar=. Lead anonimizado: só Excluir (não há o que anonimizar). */
export function BlocoLgpd({ base, modal, anonimizado }: { base: string; modal: boolean; anonimizado: boolean }) {
  return (
    <div className="ad-lgpd" role="region" aria-labelledby="zona">
      <h3 className="ad-h3" id="zona"><Icone nome="shield" />Privacidade (LGPD)</h3>
      <p>Ações permanentes sobre os dados desta pessoa. Cada uma pede uma confirmação.</p>
      <div className="ad-lgpd__a">
        {!anonimizado && <NavLead modal={modal} href={`${base}?confirmar=anonimizar`} className="ad-btn ad-btn--secondary">Anonimizar…</NavLead>}
        <NavLead modal={modal} href={`${base}?confirmar=excluir`} className="ad-btn ad-btn--dangero"><Icone nome="trash" />Excluir…</NavLead>
      </div>
    </div>
  );
}
