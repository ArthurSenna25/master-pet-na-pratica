import { vars } from "../../_components/vars";
import { rotuloDia, rotuloDiaCompleto, topoEixo, type Semana } from "../../_lib/admin/visao-geral";

/** Colunas em HTML/CSS no servidor (sem JS). Semana em andamento listrada (não só cor). Texto alternativo lista todas as semanas; "Ver dados" traz a tabela. */
export function GraficoSemanas({ semanas }: { semanas: Semana[] }) {
  const topo = topoEixo(Math.max(0, ...semanas.map((s) => s.n)));
  const total = semanas.reduce((a, s) => a + s.n, 0);
  const topoSemana = semanas.reduce((a, s) => (s.n > a.n ? s : a), semanas[0]);
  const resumo = `Total no período: ${total}.` + (total > 0 ? ` Semana com mais leads: ${rotuloDia(topoSemana.semana)}, com ${topoSemana.n}.` : "");
  const alt = `Leads por semana: gráfico de colunas, últimas ${semanas.length} semanas. ` + semanas.map((s) => `semana de ${rotuloDia(s.semana)}: ${s.n}`).join("; ") + ".";
  return (
    <>
      <div className="ad-chart" role="img" aria-label={alt} aria-describedby="graf-desc">
        <div className="ad-chart__y" aria-hidden="true"><span>{topo}</span><span>{topo / 2}</span><span>0</span></div>
        <ol className="ad-wks" style={vars({ "--c": semanas.length })}>
          {semanas.map((s, k) => {
            const atual = k === semanas.length - 1;
            return (
              <li key={s.semana} className={`ad-wk${atual ? " is-cur" : ""}`}>
                <div className="ad-wk__plot">
                  <span className={`ad-wk__v${s.n === 0 ? " ad-wk__v--0" : ""}`}>{s.n}</span>
                  <span className="ad-wk__bar" style={vars({ "--h": s.n / topo })} />
                </div>
                <span className="ad-wk__l">{rotuloDia(s.semana)}{atual && <em>esta semana</em>}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <p id="graf-desc" className="ad-vh">{resumo}</p>
      <p className="ad-hint">Cada coluna é uma semana (começa na segunda-feira). A listrada é a semana em andamento.</p>
      <details className="ad-data">
        <summary>Ver dados</summary>
        <table className="ad-tb-s">
          <caption className="ad-vh">Leads por semana</caption>
          <thead><tr><th scope="col">Semana (segunda-feira)</th><th scope="col">Leads</th></tr></thead>
          <tbody>
            {semanas.map((s, k) => (
              <tr key={s.semana}><th scope="row">{rotuloDiaCompleto(s.semana)}{k === semanas.length - 1 ? " (em andamento)" : ""}</th><td>{s.n}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}
