import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ok } = await searchParams;
  return (
    <main className="mx-auto grid min-h-screen max-w-sm content-center px-4 py-8">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
        <header className="bg-(--mp-navy-900) px-6 py-4">
          <h1 className="m-0 font-[family-name:var(--font-display)] text-2xl font-semibold !text-(--mp-beige-50)">Painel</h1>
        </header>
        <div className="grid gap-4 p-6">
          {ok === "senha" && <p role="status" className="m-0 rounded-md bg-green-100 p-3 text-sm">Senha alterada. Entre com a nova senha.</p>}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
