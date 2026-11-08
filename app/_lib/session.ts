import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** RNF-04: toda página/action do admin chama isto no servidor, antes de qualquer outra coisa. */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/login");
  return session;
}
