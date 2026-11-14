import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import { inicioJanelaGlobal, isTetoGlobal, JANELA_GLOBAL_MS, MAX_ENVIOS_HORA } from "./rate-limit";

describe("teto global de envios", () => {
  it("é 60 por hora e barra no 60º registro", () => {
    expect(MAX_ENVIOS_HORA).toBe(60);
    expect(isTetoGlobal(59)).toBe(false);
    expect(isTetoGlobal(60)).toBe(true);
  });
  it("janela de 1 h", () => {
    expect(inicioJanelaGlobal(JANELA_GLOBAL_MS).getTime()).toBe(0);
  });
});

describe("limite de corpo", () => {
  it("Server Action limitada a 100kb", () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe("100kb");
  });
});

describe("TETO_GLOBAL_TESTE", () => {
  it("em produção a variável é ignorada", () => {
    const antes = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "production";
    process.env.TETO_GLOBAL_TESTE = "1";
    try { expect(isTetoGlobal(5)).toBe(false); } finally { (process.env as Record<string, string>).NODE_ENV = antes!; delete process.env.TETO_GLOBAL_TESTE; }
  });
});

describe("limite de corpo x formulários reais", () => {
  it("o pior caso de cada formulário (campos no máximo, 4 bytes/caractere) usa < 25% de 100kb; downloads são GET sem corpo", async () => {
    const { MENSAGEM_MAX, NEGOCIO_MAX, NOME_MAX } = await import("./lead-rules");
    const { OBSERVACAO_MAX } = await import("./admin/lead-edit");
    const { EMAIL_MAX, SENHA_MAX } = await import("./admin/login-schema");
    const pior = (campos: Record<string, number>) => {
      const fd = new FormData();
      for (const [k, n] of Object.entries(campos)) fd.set(k, "😀".repeat(n));
      return new Response(fd).arrayBuffer().then((b) => b.byteLength);
    };
    const limite = 100 * 1024 * 0.25;
    expect(await pior({ nome: NOME_MAX, negocio: NEGOCIO_MAX, mensagem: MENSAGEM_MAX, cidade: 100, whatsapp: 30, tempo: 40, equipe: 40, desafio: 80, curso: 5 })).toBeLessThan(limite);
    expect(await pior({ observacao: OBSERVACAO_MAX, id: 40, status: 20 })).toBeLessThan(limite);
    expect(await pior({ email: EMAIL_MAX, password: SENHA_MAX })).toBeLessThan(limite);
    expect(await pior({ atual: SENHA_MAX, nova: SENHA_MAX, confirmacao: SENHA_MAX })).toBeLessThan(limite);
  });
});
