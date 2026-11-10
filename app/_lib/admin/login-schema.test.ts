import { describe, expect, it } from "vitest";
import { loginSchema, EMAIL_MAX, SENHA_MAX } from "./login-schema";

const ok = { email: "camila@exemplo.com.br", password: "senha-bem-longa-1" };

describe("loginSchema", () => {
  it("aceita e normaliza e-mail (trim + minúsculas); senha intacta", () => {
    const r = loginSchema.parse({ email: "  Camila@Exemplo.COM.br ", password: "  Senha Longa 1  " });
    expect(r.email).toBe("camila@exemplo.com.br");
    expect(r.password).toBe("  Senha Longa 1  ");
  });
  it.each(["", "sem-arroba", "a@b", "a b@c.com", "@x.com"])("rejeita e-mail inválido %j", (email) => {
    expect(loginSchema.safeParse({ ...ok, email }).success).toBe(false);
  });
  it("rejeita e-mail acima de 254", () => {
    const longo = "a".repeat(EMAIL_MAX) + "@x.com";
    expect(loginSchema.safeParse({ ...ok, email: longo }).success).toBe(false);
  });
  it("limites da senha: vazia, curta e longa demais", () => {
    expect(loginSchema.safeParse({ ...ok, password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ ...ok, password: "1234567" }).success).toBe(false);
    expect(loginSchema.safeParse({ ...ok, password: "x".repeat(SENHA_MAX + 1) }).success).toBe(false);
    expect(loginSchema.safeParse({ ...ok, password: "x".repeat(SENHA_MAX) }).success).toBe(true);
  });
  it("rejeita tipos errados (FormData ausente)", () => {
    expect(loginSchema.safeParse({ email: null, password: null }).success).toBe(false);
  });
});
