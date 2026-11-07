import Link from "next/link";
import { BrandChip } from "./BrandChip";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <Wordmark />
        <BrandChip />
        <span>Mentoria presencial e individual para donos de banho e tosa.</span>
        <nav className="lp-footer__legal" aria-label="Documentos legais">
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>
          <Link href="/termos-de-uso">Termos de Uso</Link>
        </nav>
      </div>
    </footer>
  );
}
