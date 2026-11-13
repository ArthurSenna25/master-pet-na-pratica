import Link from "next/link";
import { haQuanto } from "../_lib/admin/visao-geral";
import type { listarLeads } from "../_lib/admin/leads-query";
import { linkWhatsapp } from "../_lib/admin/whatsapp";
import { BotaoWhatsapp } from "./BotaoWhatsapp";
import { Icone } from "./Icone";
import { SeloStatus } from "./SeloStatus";
import { dataCurta as data } from "../_lib/admin/formato";

type Linha = Awaited<ReturnType<typeof listarLeads>>["linhas"][number];

// Um único link por lead (.ad-rl): o ::after cobre a linha/cartão inteiro; o aria-label substitui o texto (sem leitura duplicada).
// O olho da tabela é link só para o mouse (aria-hidden, fora do Tab). O WhatsApp fica acima do link esticado (z-index) e é o 2º foco.
// As duas visões existem no HTML; só uma é exibida (display:none tira do foco e dos leitores de tela).
const rotulo = (l: Linha) => (l.anonimizadoEm ? "Ver lead anonimizado" : `Ver lead ${l.nome}`);
const nome = (l: Linha) => (l.anonimizadoEm ? "Anonimizado" : l.nome);

function Whatsapp({ l }: { l: Linha }) {
  const wa = l.anonimizadoEm ? null : linkWhatsapp(l.whatsapp);
  return wa ? <BotaoWhatsapp href={wa} nome={l.nome} /> : null;
}

export function LeadsLista({ linhas, agora }: { linhas: Linha[]; agora: Date }) {
  return (
    <div className="ad-list">
      <table className="ad-tbl">
        <caption className="ad-vh">Leads recebidos</caption>
        <thead>
          <tr>
            <th scope="col">Nome</th><th scope="col">Negócio</th><th scope="col">Cidade</th><th scope="col">Status</th><th scope="col">Recebido em</th>
            <th scope="col"><span className="ad-vh">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.id}>
              <th scope="row"><Link className="ad-rl" href={`/admin/lead/${l.id}`} prefetch={false} aria-label={rotulo(l)}>{nome(l)}</Link></th>
              <td>{l.anonimizadoEm ? "—" : l.negocio}</td>
              <td>{l.anonimizadoEm ? "—" : l.cidadeUf}</td>
              <td><SeloStatus status={l.status} /></td>
              <td className="ad-dt">{data(l.criadoEm)}</td>
              <td className="ad-act">
                <Link className="ad-eye" href={`/admin/lead/${l.id}`} prefetch={false} aria-hidden="true" tabIndex={-1}><Icone nome="eye" /></Link>
                <Whatsapp l={l} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="ad-lc">
        {linhas.map((l) => (
          <li key={l.id} className="ad-lcard">
            <div className="ad-lcard__top">
              <Link className="ad-rl" href={`/admin/lead/${l.id}`} prefetch={false} aria-label={rotulo(l)}>{nome(l)}</Link>
              <SeloStatus status={l.status} />
            </div>
            {!l.anonimizadoEm && <p className="ad-lcard__m">{l.negocio} · {l.cidadeUf}</p>}
            <p className="ad-lcard__d"><Icone nome="clock" />Recebido em {data(l.criadoEm)} · {haQuanto(l.criadoEm, agora)}</p>
            <div className="ad-lcard__a">
              <Whatsapp l={l} />
              <span className="ad-eyel" aria-hidden="true"><Icone nome="eye" />Ver lead</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
