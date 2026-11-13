import { STATUS_ROTULO, type Status } from "../_lib/admin/status";
import { Icone } from "./Icone";

// Selo = cor + ícone + texto (nunca só cor). Pares de contraste do handoff (>= 4,5:1) conferidos no PROGRESS.
const SELO: Record<Status, { classe: string; icone: string }> = {
  novo: { classe: "ad-st--novo", icone: "dot" },
  em_contato: { classe: "ad-st--contato", icone: "phone" },
  convertido: { classe: "ad-st--conv", icone: "check" },
  nao_convertido: { classe: "ad-st--nao", icone: "x" },
};

export function SeloStatus({ status }: { status: string }) {
  const s = SELO[status as Status];
  if (!s) return <span className="ad-st">{status}</span>;
  return <span className={`ad-st ${s.classe}`}><Icone nome={s.icone} />{STATUS_ROTULO[status as Status]}</span>;
}
