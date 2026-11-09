import { gerarCsvAuditoria } from "../../_lib/admin/auditoria";
import { negarSeSemSessao } from "../../_lib/admin/rota-protegida";

export async function GET(req: Request): Promise<Response> {
  const negado = await negarSeSemSessao(req);
  if (negado) return negado;
  const csv = await gerarCsvAuditoria();
  const dia = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="auditoria-${dia}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
