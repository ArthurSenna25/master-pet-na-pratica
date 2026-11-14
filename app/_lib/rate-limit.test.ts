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
