// Oculto por padrão (CSS) e inerte: sem JS não pode receber foco invisível. F3-motion mostra e remove o inert.
export function StickyCta() {
  return (
    <div className="lp-sticky" inert>
      <a className="mp-btn mp-btn--primary mp-btn--lg mp-btn--block" href="#conversar">Quero conversar com a Camila</a>
    </div>
  );
}
