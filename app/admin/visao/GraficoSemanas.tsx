import { rotuloDia, type Semana } from "../../_lib/admin/visao-geral";

// Gráfico de barras horizontais em SVG gerado no servidor (sem JS). Horizontal de propósito: 12 rótulos legíveis em 390 px.
// Barras navy-700 (#1b3470) sobre branco ≈ 11:1 (mínimo 3:1); texto slate-900 ≈ 17:1. O valor está escrito em cada linha (não só cor).
const L = 360, LINHA = 28, ESQ = 56, DIR = 36, ALTURA_BARRA = 18;

export function GraficoSemanas({ semanas }: { semanas: Semana[] }) {
  const max = Math.max(1, ...semanas.map((s) => s.n));
  const total = semanas.reduce((a, s) => a + s.n, 0);
  const topo = semanas.reduce((a, s) => (s.n > a.n ? s : a), semanas[0]);
  const h = semanas.length * LINHA + 4;
  const area = L - ESQ - DIR;
  const resumo = `Leads por semana, de ${rotuloDia(semanas[0].semana)} a ${rotuloDia(semanas[semanas.length - 1].semana)}. Total no período: ${total}.` +
    (total > 0 ? ` Semana com mais leads: ${rotuloDia(topo.semana)}, com ${topo.n}.` : "");
  return (
    <div>
      <svg role="img" aria-labelledby="graf-titulo" aria-describedby="graf-desc" viewBox={`0 0 ${L} ${h}`} className="block h-auto w-full max-w-xl">
        <title id="graf-titulo">Leads por semana (últimas {semanas.length} semanas)</title>
        <desc id="graf-desc">{resumo}</desc>
        <line x1={ESQ} x2={ESQ} y1={0} y2={h} stroke="#475569" strokeWidth={1} />
        {semanas.map((s, i) => {
          const y = i * LINHA + 2;
          const w = (s.n / max) * area;
          return (
            <g key={s.semana}>
              <text x={ESQ - 6} y={y + LINHA / 2} textAnchor="end" dominantBaseline="middle" fontSize={13} fill="#0f172a">{rotuloDia(s.semana)}</text>
              {s.n > 0 && <rect x={ESQ} y={y + (LINHA - ALTURA_BARRA) / 2} width={w} height={ALTURA_BARRA} rx={2} fill="var(--mp-navy-700)" />}
              <text x={ESQ + w + 6} y={y + LINHA / 2} dominantBaseline="middle" fontSize={13} fontWeight={700} fill="#0f172a">{s.n}</text>
            </g>
          );
        })}
      </svg>
      <p className="m-0 mt-2 text-sm text-(--mp-ink-muted)">Cada linha é uma semana (começa na segunda-feira). A última é a semana em andamento.</p>
      <details className="mt-2">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium underline text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Ver dados</summary>
        <table className="mt-2 w-full max-w-xs border-collapse text-left text-sm">
          <caption className="sr-only">Leads por semana</caption>
          <thead><tr><th scope="col" className="border-b border-slate-300 px-2 py-1">Semana de</th><th scope="col" className="border-b border-slate-300 px-2 py-1 text-right">Leads</th></tr></thead>
          <tbody>
            {semanas.map((s) => (
              <tr key={s.semana}><th scope="row" className="border-b border-slate-200 px-2 py-1 font-normal">{rotuloDia(s.semana)}</th><td className="border-b border-slate-200 px-2 py-1 text-right">{s.n}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
