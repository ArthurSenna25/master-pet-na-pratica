import Link from "next/link";
import { LegalPage } from "../_components/LegalPage";

export default function NotFound() {
  return (
    <LegalPage titulo="Página não encontrada">
      <p>O endereço não existe. <Link href="/">Voltar ao início</Link>.</p>
    </LegalPage>
  );
}
