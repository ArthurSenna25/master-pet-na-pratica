import "server-only";
import { getSessionOrNull } from "../session";

/**
 * Guarda de route handlers do admin: sem sessão => 401 (nunca redirect); pedido cross-site => 403.
 * Devolve null quando pode seguir. Chamar na PRIMEIRA linha do GET.
 */
export async function negarSeSemSessao(req: Request): Promise<Response | null> {
  if (!(await getSessionOrNull(req.headers))) return new Response("Não autorizado", { status: 401, headers: { "Cache-Control": "no-store" } });
  if (req.headers.get("sec-fetch-site") === "cross-site") return new Response("Proibido", { status: 403, headers: { "Cache-Control": "no-store" } });
  return null;
}
