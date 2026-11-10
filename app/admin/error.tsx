"use client";

// Texto fixo: nunca mostra error.message nem digest (podem conter dado pessoal ou detalhe técnico).
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div role="alert" className="rounded-lg border border-slate-300 bg-white p-6">
        <p className="m-0 mb-4 text-lg font-semibold">Algo deu errado. Tente novamente.</p>
        <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-400 bg-white px-4 font-[inherit] text-sm font-medium text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Tentar novamente</button>
      </div>
    </main>
  );
}
