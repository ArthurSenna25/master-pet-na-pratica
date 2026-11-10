import { STATUS_ROTULO, type Status } from "../_lib/admin/status";

export const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
export const BOTAO = `inline-flex font-[inherit] no-underline text-slate-900 min-h-11 items-center justify-center rounded-md border border-slate-400 bg-white px-4 text-sm font-medium ${FOCO}`;
export const CAMPO = `min-h-11 font-[inherit] text-slate-900 rounded-md border border-slate-400 bg-white px-3 ${FOCO}`;
export const data = (d: Date) => d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

// Selo = cor + forma (ícone) + texto. Pares de contraste (≥ 4,5:1) registrados em PROGRESS.md.
const SELO: Record<Status, { cor: string; icone: React.ReactNode }> = {
  novo: { cor: "bg-(--mp-blue-100) text-(--mp-navy-900) border-(--mp-navy-900)/30", icone: <circle cx="12" cy="12" r="4" fill="currentColor" /> },
  em_contato: { cor: "bg-[#f6e7bd] text-[#5c3d00] border-[#5c3d00]/40", icone: <path d="M4 5h16v11H9l-5 4z" /> },
  convertido: { cor: "bg-(--mp-success-bg) text-(--mp-success) border-(--mp-success)/40", icone: <path d="M5 12.5l4.5 4.5L19 7.5" /> },
  nao_convertido: { cor: "bg-(--mp-danger-bg) text-(--mp-danger) border-(--mp-danger)/40", icone: <path d="M6 6l12 12M18 6L6 18" /> },
};

export function SeloStatus({ status }: { status: string }) {
  const s = SELO[status as Status];
  if (!s) return <span className="rounded-full border border-slate-400 bg-slate-100 px-2 py-1 text-sm">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-sm font-semibold ${s.cor}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{s.icone}</svg>
      {STATUS_ROTULO[status as Status]}
    </span>
  );
}

export function IconeOlho() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
  );
}
