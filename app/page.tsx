// Provisório (F1): substituído pela LP na F2.
const swatches = [
  ["navy-900", "var(--mp-navy-900)"],
  ["navy-800", "var(--mp-navy-800)"],
  ["beige-100", "var(--mp-beige-100)"],
  ["blue-200", "var(--mp-blue-200)"],
  ["gold-action", "var(--mp-gold-action)"],
  ["gold-400", "var(--mp-gold-400)"],
] as const;

export default function Page() {
  return (
    <main style={{ padding: "var(--space-8) var(--space-3)", maxWidth: "var(--container)", margin: "0 auto" }}>
      <h1 style={{ fontSize: "var(--fs-h1)" }}>Master Pet na Prática</h1>
      <p style={{ marginTop: "var(--space-2)" }}>
        Página provisória da Fase 1: fontes e tokens da Paleta B.
      </p>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", padding: 0, marginTop: "var(--space-4)", listStyle: "none" }}>
        {swatches.map(([name, color]) => (
          <li key={name} style={{ width: 120, fontSize: "var(--fs-small)" }}>
            <div style={{ height: 64, background: color, borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)" }} />
            {name}
          </li>
        ))}
      </ul>
    </main>
  );
}
