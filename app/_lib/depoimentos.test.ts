import { describe, expect, it } from "vitest";
import { DEPOIMENTOS, DESTAQUE, iniciais, publicaveis, type Depoimento } from "./depoimentos";

describe("depoimentos", () => {
  it("só publica com consent=true (vale também para dados reais)", () => {
    const sem: Depoimento = { ...DESTAQUE, consent: false };
    expect(publicaveis([sem, DESTAQUE])).toEqual([DESTAQUE]);
  });

  it("os dados de demo são todos marcados como exemplo", () => {
    for (const d of [DESTAQUE, ...DEPOIMENTOS]) expect(d.isExample).toBe(true);
  });

  it("avatar: iniciais da primeira e da última palavra, sem foto", () => {
    expect(iniciais("Nome da cliente")).toBe("NC");
    expect(iniciais("  maria ")).toBe("M");
  });
});
