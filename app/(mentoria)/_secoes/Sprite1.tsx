
export function Sprite1() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <symbol id="nm-spark" viewBox="0 0 24 24">
        <path d="M12 0c.8 6.6 3.4 9.2 12 12-8.6 2.8-11.2 5.4-12 12-.8-6.6-3.4-9.2-12-12 8.6-2.8 11.2-5.4 12-12z" fill="currentColor" />
      </symbol>
      <symbol id="nm-check" viewBox="0 0 24 24">
        <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </symbol>
      <symbol id="nm-x" viewBox="0 0 24 24">
        <path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>
      <symbol id="nm-arrow" viewBox="0 0 24 24">
        <path d="M5 12h14m-7-7 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </symbol>
      <symbol id="nm-plus" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>
      <symbol id="nm-alert" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 7.5v5.5M12 16.2v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>
      <filter id="nm-duotone" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"></feColorMatrix>
        <feComponentTransfer>
          <feFuncR type="table" tableValues=".04 .93"></feFuncR>
          <feFuncG type="table" tableValues=".09 .84"></feFuncG>
          <feFuncB type="table" tableValues=".2 .62"></feFuncB>
        </feComponentTransfer>
      </filter>
    </svg>
  );
}
