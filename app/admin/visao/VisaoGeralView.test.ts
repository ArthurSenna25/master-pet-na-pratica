// Estados da Visão geral sem banco: renderiza o componente no servidor com dados montados à mão.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { preencherSemanas, semanasRecentes } from "../../_lib/admin/visao-geral";
import type { VisaoGeral } from "../../_lib/admin/visao-geral-query";
import { VisaoGeralView } from "./VisaoGeralView";

const agora = new Date("2031-03-12T15:00:00Z");
const base = (o: Partial<VisaoGeral>): VisaoGeral => ({
  total: 0, porStatus: { novo: 0, em_contato: 0, convertido: 0, nao_convertido: 0 }, hoje: 0, seteDias: 0, novosHaMaisDe48h: 0,
  semanas: preencherSemanas(semanasRecentes(agora), []), chamar: [], ...o,
});
const html = (d: VisaoGeral, perfil = []) => renderToStaticMarkup(createElement(VisaoGeralView, { dados: d, perfil, agora }));

describe("VisaoGeralView", () => {
  it("0 leads: tela inteira com zeros, aviso de poucos leads, estado vazio e sem Perfil", () => {
    const h = html(base({}));
    expect(h).toContain("<h1>Visão geral</h1>");
    expect(h).toContain("Com poucos leads, as tendências ainda não são confiáveis.");
    expect(h).toContain("Nenhum lead ainda.");
    expect(h).toContain("Ainda sem dados suficientes");
    expect(h).not.toContain("Perfil dos leads");
    expect(h.match(/class="ad-wk[ "]/g)).toHaveLength(4); // 4 semanas sem lead
  });

  it("menos de 10 leads: aviso; com 10 ou mais: sem aviso", () => {
    expect(html(base({ total: 9 }))).toContain("Com poucos leads");
    expect(html(base({ total: 10 }))).not.toContain("Com poucos leads");
  });

  it("taxa só com 5 decididos; 'Aguardando' mostra o total de novos e o aviso de 48 h", () => {
    const sem = html(base({ total: 12, porStatus: { novo: 6, em_contato: 2, convertido: 2, nao_convertido: 2 }, novosHaMaisDe48h: 2 }));
    expect(sem).toContain("Ainda sem dados suficientes");
    expect(sem).toContain("4 até agora");
    expect(sem).toContain("2 há mais de 48 h");
    const com = html(base({ total: 12, porStatus: { novo: 3, em_contato: 1, convertido: 5, nao_convertido: 3 } }));
    expect(com).toContain("63%"); // 5 de 8 = 62,5% arredonda para 63
    expect(com).toContain("5 de 8 leads com resultado");
  });

  it("gráfico: texto alternativo lista as semanas, resumo e tabela 'Ver dados'", () => {
    const h = html(base({ total: 3 }));
    expect(h).toContain('role="img"');
    expect(h).toContain("Leads por semana: gráfico de colunas, últimas 8 semanas."); // lead só fora da janela de 12 semanas = 8
    expect(h).toContain("Total no período: 0.");
    expect(h).toContain("Ver dados");
  });

  it("Perfil dos leads aparece fechado e só com contagens", () => {
    const h = html(base({ total: 2 }), [{ dim: "tempo", titulo: "Tempo de funcionamento", itens: [{ rotulo: "1 a 3 anos", n: 2 }] }] as never);
    expect(h).toContain("Perfil dos leads");
    expect(h).toContain("1 a 3 anos");
    expect(h).not.toMatch(/<details[^>]*ad-perfil[^>]*open/);
  });
});
