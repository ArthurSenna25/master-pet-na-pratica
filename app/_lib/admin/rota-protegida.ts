import "server-only";
import { getSessionOrNull } from "../session";

/**
 * Guarda de route handlers do admin: sem sessão => 401 (nunca redirect); pedido cross-site => 403.
 * Devolve null quando pode seguir. Chamar na PRIMEIRA linha do GET.
 */
export async function negarSeSemSessao(req: Request): Promise<Response | null> {
  if (!(await getSessionOrNull(req.headers))) return new Response("Não autorizado", { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!mesmaOrigem(req)) return new Response("Proibido", { status: 403, headers: { "Cache-Control": "no-store" } });
  return null;
}

/** GET que grava registro não pode ser disparado por outro site. Sec-Fetch-Site (quando existe) só admite same-origin/none (digitado, favorito);
 *  Origin (quando existe) tem de ser o próprio host. Navegador antigo sem nenhum dos dois: o SameSite=Lax do cookie é a barreira restante. */
function mesmaOrigem(req: Request): boolean {
  const sfs = req.headers.get("sec-fetch-site");
  if (sfs && sfs !== "same-origin" && sfs !== "none") return false;
  const origin = req.headers.get("origin");
  if (origin) {
    try { if (new URL(origin).host !== new URL(req.url).host) return false; } catch { return false; }
  }
  return true;
}
