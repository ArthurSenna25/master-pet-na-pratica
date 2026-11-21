import { negarSeSemSessao } from "../../_lib/admin/rota-protegida";
import { lerCampanha } from "../../_lib/admin/campanha";
import { gerarCsvLeads } from "../../_lib/admin/leads-csv";

export async function GET(req: Request): Promise<Response> {
  const negado = await negarSeSemSessao(req); // 401 sem sessão (getSessionOrNull primeiro), 403 se cross-site
  if (negado) return negado;
  const campanha = lerCampanha(new URL(req.url).searchParams.get("campanha")); // inválido = todas
  const csv = await gerarCsvLeads(campanha);
  const dia = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads${campanha ? `-${campanha}` : ""}-${dia}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
