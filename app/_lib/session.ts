import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Sessão ou null, sem redirect. Para route handlers, que devem responder 401 (não 307). */
export async function getSessionOrNull(h?: Headers) {
  return auth.api.getSession({ headers: h ?? (await headers()) });
}

/** RNF-04: toda página/action do admin chama isto no servidor, antes de qualquer outra coisa. */
export async function requireSession() {
  const session = await getSessionOrNull();
  if (!session) redirect("/admin/login");
  return session;
}
