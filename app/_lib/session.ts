import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";

/** Sessão ou null, sem redirect. Para route handlers, que devem responder 401 (não 307). */
export async function getSessionOrNull(h?: Headers) {
  // headers() ANTES de getAuth(): sinaliza ao Next que a rota é dinâmica antes de qualquer acesso ao banco (senão o build tenta pré-renderizar).
  const hs = h ?? (await headers());
  return getAuth().api.getSession({ headers: hs });
}

/** RNF-04: toda página/action do admin chama isto no servidor, antes de qualquer outra coisa. */
export async function requireSession() {
  const session = await getSessionOrNull();
  if (!session) redirect("/admin/login");
  return session;
}
