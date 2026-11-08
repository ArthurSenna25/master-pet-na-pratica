import { describe, expect, it } from "vitest";
import {
  checarCidadeUf, checarMensagem, checarNegocio, checarNome, checarWhatsapp, DDDS, formatarTelefone, normalizar, UFS,
} from "./lead-rules";
import { leadSchema, errosPorCampo } from "./lead-schema";
import { buscarMunicipio } from "./municipios";

const valor = <T>(r: { ok: boolean; valor?: T; erro?: string }) => (r.ok ? r.valor : `ERRO: ${r.erro}`);

describe("normalizar", () => {
  it("NFC, colapsa espaços e apóstrofo tipográfico", () => {
    expect(normalizar("  José   D’Ávila ")).toBe("José D'Ávila");
  });
});

describe("checarNome", () => {
  it.each(["José", "Conceição", "D'Ávila", "Ana-Maria", "Dr. Silva", "Maria  da   Silva", "Åsa", "李雷"])("aceita %s", (n) => {
    expect(checarNome(n).ok).toBe(true);
  });
  it("normaliza", () => expect(valor(checarNome("  maria   da  silva "))).toBe("maria da silva"));
  it.each([["Ana123", "invalido"], ["Ana_", "invalido"], ["Ana@x", "invalido"], ["-Ana", "invalido"], ["A", "incompleto"], ["", "incompleto"], ["a".repeat(81), "invalido"]])(
    "rejeita %s (%s)",
    (n, tipo) => {
      const r = checarNome(n);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.tipo).toBe(tipo);
    },
  );
});

describe("checarWhatsapp", () => {
  it("tem 67 DDDs", () => expect(DDDS.size).toBe(67));
  it.each([["(14) 99999-0001", "14999990001"], ["14 3333-4444", "1433334444"], ["+55 (11) 98765-4321", "11987654321"], ["5551987654321", "51987654321"], ["55 3222-1111", "5532221111"]])(
    "aceita %s",
    (entrada, esperado) => expect(valor(checarWhatsapp(entrada))).toBe(esperado),
  );
  it.each([
    ["(10) 99999-0001", "invalido"], // DDD inexistente
    ["(14) 89999-0001", "invalido"], // 3º dígito 8
    ["(14) 6333-4444", "invalido"],
    ["(14) 3333-44445", "invalido"], // fixo com 11 dígitos
    ["(14) 9999-0001", "incompleto"], // celular sem o 9 extra
    ["(14) 99999-000", "incompleto"],
    ["(14) 99999-00011", "invalido"], // 12 dígitos
    ["11999999999", "invalido"], // número todo igual
    ["1100000000", "invalido"],
    ["abc", "invalido"],
    ["(14) 9999a-0000", "invalido"],
    ["", "incompleto"],
  ])("rejeita %s (%s)", (entrada, tipo) => {
    const r = checarWhatsapp(entrada);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.tipo).toBe(tipo);
  });
});

describe("formatarTelefone", () => {
  it.each([["1", "(1"], ["14", "(14"], ["149", "(14) 9"], ["14999990001", "(14) 99999-0001"], ["1433334444", "(14) 3333-4444"], ["14999990001999", "(14) 99999-0001"], ["", ""]])(
    "%s -> %s",
    (e, s) => expect(formatarTelefone(e)).toBe(s),
  );
  it("é idempotente", () => expect(formatarTelefone(formatarTelefone("14999990001"))).toBe("(14) 99999-0001"));
});

describe("checarCidadeUf", () => {
  it("tem 27 UFs", () => expect(UFS.size).toBe(27));
  it("aceita e separa", () => expect(valor(checarCidadeUf("  lins / sp "))).toEqual({ cidade: "lins", uf: "SP" }));
  it.each([["Lins", "incompleto"], ["Lins/", "incompleto"], ["Lins/S", "incompleto"], ["Lins/XX", "invalido"], ["Li1ns/SP", "invalido"], ["Lins/SP/RJ", "invalido"], ["/SP", "incompleto"], ["", "incompleto"]])(
    "rejeita %s (%s)",
    (e, tipo) => {
      const r = checarCidadeUf(e);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.tipo).toBe(tipo);
    },
  );
});

describe("municípios (IBGE, só servidor)", () => {
  it("sem acento e sem caixa, devolve o nome oficial", () => {
    expect(buscarMunicipio("sao paulo", "SP")).toBe("São Paulo");
    expect(buscarMunicipio("LINS", "SP")).toBe("Lins");
    expect(buscarMunicipio("Conceição do Araguaia", "PA")).toBe("Conceição do Araguaia");
    expect(buscarMunicipio("sant’ana do livramento", "RS")?.toLowerCase()).toContain("livramento");
  });
  it("cidade em UF errada ou inexistente é null", () => {
    expect(buscarMunicipio("Lins", "RJ")).toBeNull();
    expect(buscarMunicipio("Cidadeinexistente", "SP")).toBeNull();
    expect(buscarMunicipio("Lins", "XX")).toBeNull();
  });
});

describe("checarNegocio", () => {
  it.each(["Pet Shop 24h", "Banho & Tosa da Ana", "Cão-Mania (Centro)", "K9 Spa"])("aceita %s", (n) => expect(checarNegocio(n).ok).toBe(true));
  it.each(["1234", "!!", "<script>", "a\u0000b", "x".repeat(81), ""])("rejeita %j", (n) => expect(checarNegocio(n).ok).toBe(false));
});

describe("checarMensagem", () => {
  it("vazia é ok (opcional) e preserva quebra de linha", () => {
    expect(valor(checarMensagem("   "))).toBeUndefined();
    expect(valor(checarMensagem("oi\r\ntudo bem?"))).toBe("oi\ntudo bem?");
  });
  it("rejeita controle e excesso", () => {
    expect(checarMensagem("a\u0007b").ok).toBe(false);
    expect(checarMensagem("x".repeat(1001)).ok).toBe(false);
    expect(checarMensagem("x".repeat(1000)).ok).toBe(true);
  });
});

describe("leadSchema (servidor) usa as mesmas regras + IBGE", () => {
  const base = {
    nome: "Maria da Silva", whatsapp: "(14) 99999-0001", cidade: "lins/sp", negocio: "Pet 24h",
    tempo: "1 a 3 anos", equipe: "2 a 3", desafio: "Equipe", curso: "Sim", consentimento: "on",
  };
  it("normaliza a cidade para o nome oficial", () => {
    const r = leadSchema.parse({ ...base, cidade: "sao paulo/sp" });
    expect(r.cidade).toBe("São Paulo/SP");
    expect(r.whatsapp).toBe("14999990001");
  });
  it("cidade que não existe na UF vira erro do servidor", () => {
    const r = leadSchema.safeParse({ ...base, cidade: "Lins/RJ" });
    expect(r.success).toBe(false);
    if (!r.success) expect(errosPorCampo(r.error).cidade).toMatch(/não encontrada/);
  });
  it("campos inválidos devolvem a mensagem da regra", () => {
    const r = leadSchema.safeParse({ ...base, nome: "Ana123", whatsapp: "(10) 99999-0001", negocio: "!!" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = errosPorCampo(r.error);
      expect(e.nome).toMatch(/apenas letras/);
      expect(e.whatsapp).toBe("DDD inválido.");
      expect(e.negocio).toBeTruthy();
    }
  });
});
