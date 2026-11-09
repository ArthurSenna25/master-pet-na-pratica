import { describe, expect, it } from "vitest";
import { celulaCsv, montarCsv } from "./csv";

describe("celulaCsv", () => {
  it.each(["=1+1", "+1", "-1", "@SUM(A1)", "\tx", "\rx"])("prefixa ' em célula que começa com %j", (v) => {
    expect(celulaCsv(v).replace(/^"/, "").startsWith("'")).toBe(true);
  });
  it("não mexe em texto normal, número, null e data", () => {
    expect(celulaCsv("anonimizar_lead")).toBe("anonimizar_lead");
    expect(celulaCsv(42)).toBe("42");
    expect(celulaCsv(null)).toBe("");
    expect(celulaCsv(undefined)).toBe("");
    expect(celulaCsv(new Date("2026-11-09T12:00:00Z"))).toBe("2026-11-09T12:00:00.000Z");
  });
  it("escapa aspas, vírgula e quebra de linha; fórmula + vírgula fica prefixada E entre aspas", () => {
    expect(celulaCsv('a"b')).toBe('"a""b"');
    expect(celulaCsv("a,b")).toBe('"a,b"');
    expect(celulaCsv("a\nb")).toBe('"a\nb"');
    expect(celulaCsv("=HYPERLINK(x,y)")).toBe(`"'=HYPERLINK(x,y)"`);
  });
});

describe("montarCsv", () => {
  it("BOM + cabeçalho + linhas em CRLF", () => {
    expect(montarCsv(["a", "b"], [[1, "=x"]])).toBe("﻿a,b\r\n1,'=x\r\n");
  });
});
