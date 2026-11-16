import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "96px 24px", maxWidth: "40rem", margin: "0 auto" }}>
      <h1>Página não encontrada</h1>
      <p><Link href="/">Voltar ao início</Link></p>
    </main>
  );
}
