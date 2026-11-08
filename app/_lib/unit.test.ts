import { describe, expect, it } from "vitest";
import { consentParts } from "./consent";
import { CONSENT_TEXT, LEGAL_TEXT_VERSION } from "./legal-version";
import { errosPorCampo, leadSchema } from "./lead-schema";
import { corteRetencao, inicioJanela, isLimited, JANELA_MS, MAX_ENVIOS, RETENCAO_MS } from "./rate-limit";
import { getClientIp, ipHmac, sha256Hex } from "./seguranca";

const valido = {
  nome: "  zz-teste-Maria  ",
  whatsapp: "(14) 99999-0000",
  cidade: "Lins/SP",
  negocio: "Pet Teste",
  tempo: "1 a 3 anos",
  equipe: "2 a 3",
  desafio: "Equipe",
  curso: "Não",
  consentimento: "on",
};

describe("leadSchema", () => {
  it("aceita entrada válida e normaliza", () => {
    const r = leadSchema.safeParse({ ...valido, mensagem: "   " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nome).toBe("zz-teste-Maria");
      expect(r.data.whatsapp).toBe("14999990000");
      expect(r.data.mensagem).toBeUndefined();
    }
  });

  it("aceita +55 e rejeita WhatsApp curto", () => {
    expect(leadSchema.parse({ ...valido, whatsapp: "+55 14 99999-0000" }).whatsapp).toBe("14999990000");
    expect(leadSchema.safeParse({ ...valido, whatsapp: "9999-0000" }).success).toBe(false);
  });

  it("devolve erro por campo, sem detalhe interno", () => {
    const r = leadSchema.safeParse({ ...valido, nome: "", tempo: "inventado", consentimento: undefined });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = errosPorCampo(r.error);
      expect(Object.keys(e).sort()).toEqual(["consentimento", "nome", "tempo"]);
      expect(e.tempo).toBe("Escolha uma opção.");
    }
  });

  it("rejeita consentimento diferente de 'on' e campos ausentes", () => {
    expect(leadSchema.safeParse({ ...valido, consentimento: "true" }).success).toBe(false);
    expect(leadSchema.safeParse({}).success).toBe(false);
  });
});

describe("ipHmac / getClientIp", () => {
  it("é determinístico, depende do segredo e não contém o IP", () => {
    const a = ipHmac("203.0.113.9", "segredo-a");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).toBe(ipHmac("203.0.113.9", "segredo-a"));
    expect(a).not.toBe(ipHmac("203.0.113.9", "segredo-b"));
    expect(a).not.toBe(ipHmac("203.0.113.10", "segredo-a"));
    expect(a).not.toContain("203");
  });

  it("falha sem segredo", () => {
    expect(() => ipHmac("1.1.1.1", "")).toThrow();
  });

  it("prefere x-vercel-forwarded-for e usa o 1º de x-forwarded-for", () => {
    const h = (o: Record<string, string>) => new Headers(o);
    expect(getClientIp(h({ "x-vercel-forwarded-for": "1.1.1.1", "x-forwarded-for": "2.2.2.2" }), "production")).toBe("1.1.1.1");
    expect(getClientIp(h({ "x-forwarded-for": "2.2.2.2, 3.3.3.3" }), "production")).toBe("2.2.2.2");
  });

  it("sem header: 127.0.0.1 fora de produção, null em produção", () => {
    expect(getClientIp(new Headers(), "development")).toBe("127.0.0.1");
    expect(getClientIp(new Headers(), "production")).toBeNull();
  });
});

describe("hash do texto de consentimento", () => {
  it("sha256 conhecido", () => {
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("muda se o texto muda; versão registrada tem o formato esperado", () => {
    expect(sha256Hex(CONSENT_TEXT)).not.toBe(sha256Hex(CONSENT_TEXT + "."));
    expect(LEGAL_TEXT_VERSION).toMatch(/^\d+\.\d+ de \d{4}-\d{2}-\d{2}$/);
  });
});

describe("consentParts", () => {
  it("o texto contínuo é idêntico a CONSENT_TEXT e só os 2 rótulos viram link", () => {
    const p = consentParts();
    expect(p.map((x) => x.text).join("")).toBe(CONSENT_TEXT);
    expect(p.filter((x) => x.href).map((x) => x.href)).toEqual(["/politica-de-privacidade", "/termos-de-uso"]);
  });
});

describe("limite de envio", () => {
  it("bloqueia a partir do 6º (5 já gravados)", () => {
    expect(MAX_ENVIOS).toBe(5);
    expect(isLimited(4)).toBe(false);
    expect(isLimited(5)).toBe(true);
    expect(isLimited(9)).toBe(true);
  });
  it("janela de 10 min e retenção de 24 h", () => {
    const t = Date.UTC(2026, 10, 7, 12, 0, 0);
    expect(t - inicioJanela(t).getTime()).toBe(JANELA_MS);
    expect(JANELA_MS).toBe(10 * 60 * 1000);
    expect(t - corteRetencao(t).getTime()).toBe(RETENCAO_MS);
    expect(RETENCAO_MS).toBe(24 * 60 * 60 * 1000);
  });
});
