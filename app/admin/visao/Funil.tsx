import Link from "next/link";
import { STATUS, type Status } from "../../_lib/admin/status";
import { FOCO, SeloStatus } from "../ui";

// Barras em CSS no servidor. Cada linha = selo (cor + ícone + texto) + número + barra decorativa; leva à lista filtrada.
export function Funil({ porStatus, total }: { porStatus: Record<Status, number>; total: number }) {
  const max = Math.max(1, ...STATUS.map((s) => porStatus[s]));
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {STATUS.map((s) => (
        <li key={s}>
          <Link href={`/admin/leads?status=${s}`} prefetch={false} className={`grid min-h-11 gap-1 rounded-md px-2 py-1 no-underline text-slate-900 hover:bg-slate-100 ${FOCO}`}>
            <span className="flex items-center justify-between gap-2">
              <SeloStatus status={s} />
              <span className="text-lg font-semibold">{porStatus[s]} <span className="text-sm font-normal text-(--mp-ink-muted)">de {total}</span></span>
            </span>
            <span aria-hidden="true" className="block h-3 rounded bg-slate-200">
              <span className="block h-3 rounded bg-(--mp-navy-700)" style={{ width: `${(porStatus[s] / max) * 100}%` }} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
