import { describe, expect, it } from "vitest";
import { confirmaSchema, editSchema, idSchema, OBSERVACAO_MAX } from "./lead-edit";

const ID = "3f2b8a52-6c1e-4f0a-9d57-1a2b3c4d5e6f";

describe("editSchema", () => {
  it("aceita observação de exatamente 2000 e rejeita 2001", () => {
    expect(editSchema.safeParse({ id: ID, status: "novo", observacao: "a".repeat(OBSERVACAO_MAX) }).success).toBe(true);
    expect(editSchema.safeParse({ id: ID, status: "novo", observacao: "a".repeat(OBSERVACAO_MAX + 1) }).success).toBe(false);
  });
  it("conta \\r\\n como 1 caractere (igual ao que a pessoa vê)", () => {
    const obs = "a\r\n".repeat(OBSERVACAO_MAX / 2); // 2000 chars lógicos, 3000 brutos
    expect(editSchema.safeParse({ id: ID, status: "novo", observacao: obs }).success).toBe(true);
  });
  it("observação vazia ou só espaços vira null", () => {
    expect(editSchema.parse({ id: ID, status: "novo", observacao: "  \r\n " }).observacao).toBeNull();
  });
  it("só os 4 status; id precisa ser UUID", () => {
    for (const s of ["novo", "em_contato", "convertido", "nao_convertido"]) {
      expect(editSchema.safeParse({ id: ID, status: s, observacao: "" }).success).toBe(true);
    }
    expect(editSchema.safeParse({ id: ID, status: "ganho", observacao: "" }).success).toBe(false);
    expect(editSchema.safeParse({ id: "1; drop table lead", status: "novo", observacao: "" }).success).toBe(false);
  });
});

describe("confirmaSchema / idSchema", () => {
  it("exige confirmar=sim", () => {
    expect(confirmaSchema.safeParse({ id: ID, confirmar: "sim" }).success).toBe(true);
    expect(confirmaSchema.safeParse({ id: ID }).success).toBe(false);
    expect(confirmaSchema.safeParse({ id: ID, confirmar: "nao" }).success).toBe(false);
  });
  it("rejeita id que não é UUID", () => {
    expect(idSchema.safeParse({ id: "abc" }).success).toBe(false);
    expect(idSchema.safeParse({ id: null }).success).toBe(false);
  });
});
