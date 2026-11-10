import { describe, expect, it } from "vitest";
import { ERRO_SENHA_CONFIRMACAO, ERRO_SENHA_CURTA, ERRO_SENHA_IGUAL, trocaSenhaSchema } from "./senha-schema";

const ok = { atual: "senha-antiga-1", nova: "senha-nova-123", confirmacao: "senha-nova-123" };
const msgs = (d: unknown) => {
  const r = trocaSenhaSchema.safeParse(d);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe("trocaSenhaSchema", () => {
  it("aceita o caso válido e não altera as senhas", () => {
    expect(trocaSenhaSchema.parse(ok)).toEqual(ok);
  });
  it("nova: 11 recusa, 12 e 200 aceitam, 201 recusa", () => {
    const com = (n: number) => ({ ...ok, nova: "a".repeat(n), confirmacao: "a".repeat(n) });
    expect(msgs(com(11))).toContain(ERRO_SENHA_CURTA);
    expect(msgs(com(12))).toEqual([]);
    expect(msgs(com(200))).toEqual([]);
    expect(msgs(com(201))).toContain(ERRO_SENHA_CURTA);
  });
  it("atual: vazia e acima de 200 recusam; 1 e 200 aceitam", () => {
    expect(msgs({ ...ok, atual: "" })).not.toEqual([]);
    expect(msgs({ ...ok, atual: "a".repeat(201) })).not.toEqual([]);
    expect(msgs({ ...ok, atual: "a" })).toEqual([]);
    expect(msgs({ ...ok, atual: "a".repeat(200) })).toEqual([]);
  });
  it("recusa nova igual à atual", () => {
    expect(msgs({ atual: "mesma-senha-123", nova: "mesma-senha-123", confirmacao: "mesma-senha-123" })).toContain(ERRO_SENHA_IGUAL);
  });
  it("recusa confirmação diferente", () => {
    expect(msgs({ ...ok, confirmacao: "outra-coisa-123" })).toEqual([ERRO_SENHA_CONFIRMACAO]);
  });
  it("recusa tipos errados (campo ausente)", () => {
    expect(msgs({ atual: "x", nova: null, confirmacao: undefined })).not.toEqual([]);
  });
  it("nenhuma mensagem contém a senha digitada", () => {
    const d = { atual: "segredo-atual-9", nova: "curta", confirmacao: "x" };
    for (const m of msgs(d)) expect(m).not.toContain("segredo-atual-9");
  });
});
