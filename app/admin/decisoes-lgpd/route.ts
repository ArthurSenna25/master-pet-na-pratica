import { readFile } from "node:fs/promises";
import path from "node:path";
import { negarSeSemSessao } from "../../_lib/admin/rota-protegida";

const DOC_LGPD = path.join(process.cwd(), "docs", "_projeto", "lgpd", "DECISOES-LGPD.md");

export async function GET(req: Request): Promise<Response> {
  const negado = await negarSeSemSessao(req);
  if (negado) return negado;
  const md = await readFile(DOC_LGPD, "utf8");
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="DECISOES-LGPD.md"',
      "Cache-Control": "no-store",
    },
  });
}
