import { describe, expect, it } from "vitest";
import { filtrosAtivos, lerParams } from "./busca";

describe("filtrosAtivos", () => {
  it("padrão = nenhum filtro (página não conta)", () => {
    expect(filtrosAtivos(lerParams({ pagina: "3" }))).toEqual([]);
  });
  it("lista busca, status e ordem com o que cada chip remove", () => {
    const f = filtrosAtivos(lerParams({ q: "ana", status: "novo", ordem: "asc", pagina: "2" }));
    expect(f.map((x) => x.id)).toEqual(["q", "status", "ordem"]);
    expect(f[0].limpar).toMatchObject({ q: "", pagina: 1 });
    expect(f[1].rotulo).toBe("Status: Novo");
    expect(f[2].limpar).toMatchObject({ ordem: "desc" });
  });
  it("campanha vira chip removível; inválida não gera chip", () => {
    const f = filtrosAtivos(lerParams({ campanha: "mentoria", pagina: "4" }));
    expect(f).toEqual([{ id: "campanha", rotulo: "Campanha: Mentoria", limpar: { campanha: undefined, pagina: 1 } }]);
    expect(filtrosAtivos(lerParams({ campanha: "zz" }))).toEqual([]);
  });
  it("valores inválidos na URL caem no padrão e não geram chip", () => {
    expect(filtrosAtivos(lerParams({ status: "xx", ordem: "zz" }))).toEqual([]);
  });
});
