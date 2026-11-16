import { textos } from "../textos";

export function Fab() {
  const t = textos();
  return (
    <a className="nm-btn nm-fab" href="#lista" data-nm-fab>
      <span>
        {t.cta}
      </span>
      <svg className="nm-ico" aria-hidden="true" focusable="false">
        <use href="#nm-arrow" />
      </svg>
    </a>
  );
}
