import Link from "next/link";
import { vars } from "../../_components/vars";
import { haQuanto } from "../../_lib/admin/visao-geral";
import type { ParaChamar as Item } from "../../_lib/admin/visao-geral-query";
import { linkWhatsapp } from "../../_lib/admin/whatsapp";
import { BotaoWhatsapp } from "../BotaoWhatsapp";
import { Icone } from "../Icone";

const H48_MS = 48 * 3_600_000;
const LINK_LISTA = "/admin/leads?status=novo&ordem=asc";

/** "Para chamar agora": até 5 leads "novo", os mais antigos primeiro. > 48 h = ícone de alerta + texto âmbar (nunca só cor). */
export function ParaChamarLista({ itens, agora, totalAguardando, semLeads }: { itens: Item[]; agora: Date; totalAguardando: number; semLeads: boolean }) {
  if (itens.length === 0) {
    return (
      <div className="ad-empty ad-empty--sm">
        <Icone nome="check" className="ad-empty__i" />
        {semLeads
          ? <p><b>Nenhum lead ainda.</b><br />Quando alguém enviar o formulário da página, ele aparece aqui.</p>
          : <p><b>Nenhum lead esperando.</b><br />Bom trabalho!</p>}
      </div>
    );
  }
  return (
    <>
      <ul className="ad-call-l">
        {itens.map((l, k) => {
          const wa = l.anonimizado ? null : linkWhatsapp(l.whatsapp);
          const nome = l.anonimizado ? "Lead anonimizado" : l.nome;
          const antigo = agora.getTime() - l.criadoEm.getTime() > H48_MS;
          return (
            <li key={l.id} className="ad-call ad-in" style={vars({ "--i": k + 3 })}>
              <div className="ad-call__who"><b>{nome}</b>{!l.anonimizado && <span>{l.negocio} · {l.cidadeUf}</span>}</div>
              <span className={`ad-call__age${antigo ? " is-old" : ""}`}><Icone nome={antigo ? "alert" : "clock"} />{haQuanto(l.criadoEm, agora)}</span>
              <div className="ad-call__act">
                {wa && <BotaoWhatsapp href={wa} nome={nome} />}
                <Link className="ad-link" href={`/admin/lead/${l.id}`} prefetch={false} aria-label={`Ver lead ${nome}`}>Ver lead</Link>
              </div>
            </li>
          );
        })}
      </ul>
      {totalAguardando > itens.length && (
        <Link className="ad-more" href={LINK_LISTA} prefetch={false}>Ver todos os {totalAguardando} aguardando<Icone nome="arrow" /></Link>
      )}
    </>
  );
}
