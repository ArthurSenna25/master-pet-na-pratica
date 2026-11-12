import Link from "next/link";
import { linkWhatsapp } from "../../_lib/admin/whatsapp";
import type { ParaChamar as Item } from "../../_lib/admin/visao-geral-query";
import { haQuanto } from "../../_lib/admin/visao-geral";
import { BotaoWhats } from "../LeadsLista";
import { BOTAO } from "../ui";

export function ParaChamarLista({ itens, agora }: { itens: Item[]; agora: Date }) {
  if (itens.length === 0) {
    return <p className="m-0 rounded-lg border border-dashed border-slate-400 bg-white p-4">Nenhum lead esperando. Bom trabalho!</p>;
  }
  return (
    <ol className="m-0 grid list-none gap-3 p-0">
      {itens.map((l) => {
        const wa = l.anonimizado ? null : linkWhatsapp(l.whatsapp);
        const nome = l.anonimizado ? "Lead anonimizado" : l.nome;
        return (
          <li key={l.id} className="rounded-lg border border-slate-300 bg-white p-4">
            <p className="m-0 text-lg font-semibold">{nome}</p>
            {!l.anonimizado && <p className="m-0 mt-1 break-words text-sm">{l.negocio} · {l.cidadeUf}</p>}
            <p className="m-0 mt-1 text-sm text-(--mp-ink-muted)">Chegou {haQuanto(l.criadoEm, agora)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {wa && <BotaoWhats href={wa} />}
              <Link href={`/admin/lead/${l.id}`} prefetch={false} aria-label={`Ver lead ${nome}`} className={BOTAO}>Ver lead</Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
