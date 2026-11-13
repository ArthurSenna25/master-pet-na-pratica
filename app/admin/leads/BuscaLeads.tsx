import type { ParamsLista } from "../../_lib/admin/busca";
import { Icone } from "../Icone";

/** Busca + ordem (formulário GET, funciona sem JS). O status vem das abas; vai junto num campo oculto para não se perder ao buscar. */
export function BuscaLeads({ p }: { p: ParamsLista }) {
  return (
    <form className="ad-tool" method="get" action="/admin/leads" role="search">
      {p.status && <input type="hidden" name="status" value={p.status} />}
      <div className="ad-fld ad-fld--grow">
        <label htmlFor="busca-q">Buscar por nome, negócio, cidade ou telefone</label>
        <div className="ad-in-ic">
          <Icone nome="search" />
          <input id="busca-q" name="q" type="search" defaultValue={p.q} maxLength={100} autoComplete="off" />
        </div>
      </div>
      <div className="ad-fld">
        <label htmlFor="busca-ordem">Ordem</label>
        <select id="busca-ordem" name="ordem" defaultValue={p.ordem}>
          <option value="desc">Mais recentes</option>
          <option value="asc">Mais antigos</option>
        </select>
      </div>
      <button className="ad-btn ad-btn--navy" type="submit">Filtrar</button>
    </form>
  );
}
