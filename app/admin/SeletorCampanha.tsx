import Link from "next/link";
import { CAMPANHAS, CAMPANHA_ROTULO, type Campanha } from "../_lib/admin/campanha";

/** "Todas | Presencial | Mentoria": links (sem JS); a escolha vive na URL. `href` monta a URL preservando o resto do estado. */
export function SeletorCampanha({ atual, href }: { atual?: Campanha; href: (c?: Campanha) => string }) {
  const item = (c: Campanha | undefined, texto: string) => (
    <Link key={texto} className={`ad-pill${atual === c ? " is-on" : ""}`} href={href(c)} prefetch={false} aria-current={atual === c ? "true" : undefined}>{texto}</Link>
  );
  return (
    <nav className="ad-pills ad-pills--camp" aria-label="Filtrar por campanha">
      {item(undefined, "Todas")}
      {CAMPANHAS.map((c) => item(c, CAMPANHA_ROTULO[c]))}
    </nav>
  );
}
