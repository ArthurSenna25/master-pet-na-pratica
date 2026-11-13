import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ok } = await searchParams;
  return (
    <main className="ad-login">
      <div className="ad-login__brand">
        <small>Master Pet</small>
        <b>Painel</b>
        {/* COPY PROVISÓRIA do handoff (sugestão): conferir com a Camila. Registrado no PROGRESS. */}
        <p>Seus leads, um por um.<br />Quem chamar primeiro está sempre no topo.</p>
      </div>
      <div className="ad-login__form"><LoginForm okSenha={ok === "senha"} /></div>
    </main>
  );
}
