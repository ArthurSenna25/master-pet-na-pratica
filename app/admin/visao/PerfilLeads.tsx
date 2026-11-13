import { vars } from "../../_components/vars";
import type { GrupoPerfil } from "../../_lib/admin/perfil";
import { Icone } from "../Icone";

/** Perfil dos leads (recolhido): contagens por categoria, sem dado pessoal. Barra = n ÷ total de leads; o número está escrito. */
export function PerfilLeads({ grupos, total }: { grupos: GrupoPerfil[]; total: number }) {
  if (grupos.length === 0) return null;
  return (
    <details className="ad-card ad-perfil ad-in" style={vars({ "--i": 10 })}>
      <summary><span><b>Perfil dos leads</b><small>Dos {total} {total === 1 ? "lead" : "leads"} · opcional</small></span><Icone nome="chev" /></summary>
      <div className="ad-pf-g">
        {grupos.map((g) => (
          <div key={g.dim} className="ad-pf">
            <h3>{g.titulo}</h3>
            <ul>
              {g.itens.map((i) => (
                <li key={i.rotulo}>
                  <span>{i.rotulo}</span><b>{i.n}</b>
                  <div className="ad-bar ad-bar--neutral" aria-hidden="true"><i style={vars({ "--p": total ? i.n / total : 0 })} /></div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
