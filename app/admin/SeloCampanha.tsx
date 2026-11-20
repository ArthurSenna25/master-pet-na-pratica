import { CAMPANHA_ROTULO, type Campanha } from "../_lib/admin/campanha";
import { Icone } from "./Icone";

// Selo = ícone + texto (nunca só cor). Pares de cor: os mesmos do pill ativo/inativo (contraste já conferido no F8).
const ICONE: Record<Campanha, string> = { presencial: "dot", mentoria: "chat" };

export function SeloCampanha({ campanha }: { campanha: string }) {
  if (!(campanha in CAMPANHA_ROTULO)) return <span className="ad-st">{campanha}</span>;
  const c = campanha as Campanha;
  return <span className={`ad-st ad-st--camp-${c}`}><Icone nome={ICONE[c]} />{CAMPANHA_ROTULO[c]}</span>;
}
