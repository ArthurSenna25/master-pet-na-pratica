import { describe, expect, it } from "vitest";
import { formMentoriaAtivo } from "./mentoria-flag";

describe("formMentoriaAtivo", () => {
  it.each([
    [{ VERCEL_ENV: "production" }, false], // produção: desligado por padrão
    [{ VERCEL_ENV: "preview" }, true],
    [{ VERCEL_ENV: "development" }, true],
    [{}, true], // local (sem VERCEL_ENV)
    [{ VERCEL_ENV: "production", MENTORIA_FORM_ATIVO: "1" }, true], // dono liga em produção
    [{ VERCEL_ENV: "preview", MENTORIA_FORM_ATIVO: "0" }, false],
    [{ VERCEL_ENV: "production", MENTORIA_FORM_ATIVO: "true" }, false], // só "1" liga
    [{ VERCEL_ENV: "production", MENTORIA_FORM_ATIVO: "" }, false],
  ])("%j -> %s", (env, esperado) => expect(formMentoriaAtivo(env)).toBe(esperado));
});
