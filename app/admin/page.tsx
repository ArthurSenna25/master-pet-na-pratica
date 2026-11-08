import { logoutAction } from "./actions";
import { requireSession } from "../_lib/session";

// F4: página mínima protegida. O painel completo é a F5.
export default async function AdminPage() {
  await requireSession();
  return (
    <>
      <h1>Painel</h1>
      <p role="status">Sessão ativa.</p>
      <form action={logoutAction}><button type="submit">Sair</button></form>
    </>
  );
}
