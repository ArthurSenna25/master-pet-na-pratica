import { negarSeSemSessao } from "../../_lib/admin/rota-protegida";
import { gerarCsvLeads } from "../../_lib/admin/leads-csv";

export async function GET(req: Request): Promise<Response> {
  const negado = await negarSeSemSessao(req); // 401 sem sessão (getSessionOrNull primeiro), 403 se cross-site
  if (negado) return negado;
  const csv = await gerarCsvLeads();
  const dia = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${dia}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
