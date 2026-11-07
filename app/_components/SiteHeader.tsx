import { Wordmark } from "./Wordmark";

export function SiteHeader() {
  return (
    <>
      <div className="lp-progress" aria-hidden="true"><i /></div>
      <a className="lp-skip" href="#conversar">Ir para o formulário</a>
      <header className="lp-header">
        <a className="lp-logo" href="#" aria-label="Master Pet na Prática — início"><Wordmark /></a>
        <a className="mp-btn mp-btn--primary mp-btn--sm" href="#conversar">Quero conversar com a Camila</a>
      </header>
    </>
  );
}
