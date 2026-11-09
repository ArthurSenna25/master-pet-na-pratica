import { describe, expect, it } from "vitest";
import { linkWhatsapp, normalizarWhatsapp } from "./whatsapp";

describe("normalizarWhatsapp", () => {
  it("celular (11) e fixo (10): prefixa 55", () => {
    expect(normalizarWhatsapp("67999990001")).toBe("5567999990001");
    expect(normalizarWhatsapp("6733334444")).toBe("556733334444");
  });
  it("já com 55 (12/13 dígitos): não duplica", () => {
    expect(normalizarWhatsapp("5567999990001")).toBe("5567999990001");
    expect(normalizarWhatsapp("556733334444")).toBe("556733334444");
  });
  it("DDD 55 (RS) com 10/11 dígitos ganha o país normalmente", () => {
    expect(normalizarWhatsapp("55999998888")).toBe("5555999998888");
  });
  it("ignora máscara; rejeita tamanho inválido e vazio", () => {
    expect(normalizarWhatsapp("(67) 99999-0001")).toBe("5567999990001");
    for (const x of ["", "123", "999999999", "679999900011", "4467999990001"]) expect(normalizarWhatsapp(x)).toBeNull();
  });
});

describe("linkWhatsapp", () => {
  it("wa.me com o número normalizado e texto neutro (sem nome nem negócio)", () => {
    const u = new URL(linkWhatsapp("67999990001")!);
    expect(u.origin + u.pathname).toBe("https://wa.me/5567999990001");
    const texto = u.searchParams.get("text")!;
    expect(texto.length).toBeGreaterThan(10);
    expect(texto).toMatch(/Master Pet na Prática/);
  });
  it("sem número válido => null (anonimizado tem whatsapp vazio)", () => {
    expect(linkWhatsapp("")).toBeNull();
  });
});
