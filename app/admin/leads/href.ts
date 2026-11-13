import type { ParamsLista } from "../../_lib/admin/busca";

/** URL da lista com os parâmetros atuais + mudanças. O estado dos filtros vive na URL (links, sem JS). */
export function hrefLeads(p: ParamsLista, mudar: Partial<ParamsLista> = {}): string {
  const n = { ...p, ...mudar };
  const q = new URLSearchParams();
  if (n.q) q.set("q", n.q);
  if (n.status) q.set("status", n.status);
  if (n.ordem !== "desc") q.set("ordem", n.ordem);
  if (n.pagina > 1) q.set("pagina", String(n.pagina));
  const s = q.toString();
  return s ? `/admin/leads?${s}` : "/admin/leads";
}
