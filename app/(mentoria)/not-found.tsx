import Link from "next/link";
export default function NotFound() {
  return (
    <main className="nm">
      <h1>Página não encontrada</h1>
      <p><Link href="/">Voltar ao início</Link></p>
    </main>
  );
}
