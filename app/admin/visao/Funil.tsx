import Link from "next/link";
import { STATUS, type Status } from "../../_lib/admin/status";
import { vars } from "../../_components/vars";
import { SeloStatus } from "../SeloStatus";

const BARRA: Record<Status, string> = { novo: "ad-bar--novo", em_contato: "ad-bar--contato", convertido: "ad-bar--conv", nao_convertido: "ad-bar--nao" };

/** Funil por status. O número está escrito ("6 de 17"); a barra (largura = n ÷ total) é complementar. Cada linha leva à lista filtrada. */
export function Funil({ porStatus, total }: { porStatus: Record<Status, number>; total: number }) {
  return (
    <ul className="ad-fn">
      {STATUS.map((s) => (
        <li key={s}>
          <Link className="ad-fn__a" href={`/admin/leads?status=${s}`} prefetch={false}>
            <div className="ad-fn__t"><SeloStatus status={s} /><span className="ad-fn__n"><b>{porStatus[s]}</b> de {total}</span></div>
            <div className={`ad-bar ${BARRA[s]}`} aria-hidden="true"><i style={vars({ "--p": total ? porStatus[s] / total : 0 })} /></div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
