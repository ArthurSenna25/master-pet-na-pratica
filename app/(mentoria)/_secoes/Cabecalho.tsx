import { textos } from "../textos";

export function Cabecalho() {
  const t = textos();
  return (
    <header className="nm-header">
      <a className="nm-wordmark" href="#abertura" aria-label="Master Pet — início">
        <b>
          MASTER
        </b>
        <span>
          PET
        </span>
      </a>
      <a className="nm-btn nm-btn--sm" href="#lista">
        {t.cta}
      </a>
    </header>
  );
}
