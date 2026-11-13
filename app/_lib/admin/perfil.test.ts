import { describe, expect, it } from "vitest";
import { montarPerfil, type LinhaPerfil } from "./perfil";

describe("montarPerfil", () => {
  const l = (dim: LinhaPerfil["dim"], valor: string, n: number): LinhaPerfil => ({ dim, valor, n });
  it("ordena por contagem; empate segue a ordem das opções do formulário; grupo vazio some", () => {
    const g = montarPerfil([l("tempo", "3 a 5 anos", 2), l("tempo", "Menos de 1 ano", 2), l("tempo", "1 a 3 anos", 5), l("mentoria", "Não", 0)]);
    expect(g.map((x) => x.dim)).toEqual(["tempo"]);
    expect(g[0].itens.map((i) => i.rotulo)).toEqual(["1 a 3 anos", "Menos de 1 ano", "3 a 5 anos"]);
  });
  it("sem linhas = sem grupos (nada a mostrar)", () => {
    expect(montarPerfil([])).toEqual([]);
  });
});
