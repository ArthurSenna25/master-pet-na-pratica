// F10 c2: o texto exibido junto à caixa é IDÊNTICO ao texto cujo hash o servidor grava, nas DUAS campanhas.
// (O DOM real da mentoria entra no e2e quando a página existir, c5; aqui o componente que os dois formulários usam.)
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConsentLabel } from "../_components/ConsentLabel";
import { consentParts } from "./consent";
import { CONSENT_TEXT, CONSENTIMENTOS, LEGAL_TEXT_VERSION, LEGAL_VERSION } from "./legal-version";
import { origemCampanha, origemSegura } from "./lead-origem";
import { sha256Hex } from "./seguranca";

const CAMPANHAS = Object.keys(CONSENTIMENTOS) as (keyof typeof CONSENTIMENTOS)[];
const semTags = (html: string) => html.replace(/<[^>]+>/g, "");

describe("consentimento por campanha", () => {
  it("a versão dos textos legais é a 0.3", () => {
    expect(LEGAL_VERSION).toBe("0.3");
    expect(LEGAL_TEXT_VERSION).toMatch(/^0\.3 de \d{4}-\d{2}-\d{2}$/);
  });

  it("CONSENT_TEXT segue sendo o texto da campanha presencial", () => expect(CONSENT_TEXT).toBe(CONSENTIMENTOS.presencial));

  it("os textos (e portanto os hashes) das campanhas são diferentes", () => {
    expect(new Set(CAMPANHAS.map((c) => sha256Hex(CONSENTIMENTOS[c]))).size).toBe(CAMPANHAS.length);
  });

  it.each(CAMPANHAS)("%s: o texto renderizado é idêntico ao texto do hash e só os 2 rótulos viram link para as páginas legais", (c) => {
    const html = renderToStaticMarkup(createElement(ConsentLabel, { campanha: c }));
    expect(semTags(html).replace(/&#x27;/g, "'")).toBe(CONSENTIMENTOS[c]);
    expect(consentParts(CONSENTIMENTOS[c]).filter((p) => p.href).map((p) => p.href)).toEqual(["/politica-de-privacidade", "/termos-de-uso"]);
    const abre = html.split("<a ").slice(1).map((t) => t.slice(0, t.indexOf(">")));
    expect(abre.map((t) => t.split('href="')[1]?.split('"')[0])).toEqual(["/politica-de-privacidade", "/termos-de-uso"]);
    for (const t of abre) {
      expect(t).toContain('target="_blank"');
      expect(t).toContain('rel="noopener noreferrer"');
    }
  });

  it("a mentoria diz a finalidade (aviso da abertura da turma) e que o consentimento pode ser retirado", () => {
    expect(CONSENTIMENTOS.mentoria).toMatch(/abertura da turma/);
    expect(CONSENTIMENTOS.mentoria).toMatch(/retirar o consentimento/);
  });
});

describe("origem", () => {
  it.each([
    ["https://x.vercel.app/mentoria?origem=natal&a=1#f", "x.vercel.app/mentoria"],
    ["http://localhost:3000/", "localhost:3000/"],
    [null, "(desconhecida)"],
    ["isso não é url", "(desconhecida)"],
  ])("origemSegura(%j) = %j", (ref, esperado) => expect(origemSegura(ref)).toBe(esperado));

  it("origemSegura limita a 300 caracteres", () => expect(origemSegura(`https://x.com/${"a".repeat(500)}`).length).toBe(300));

  it.each([["natal", "natal"], [" Natal ", "natal"], ["a_b-c9", "a_b-c9"], ["-a", null], ["a b", null], ["a".repeat(41), null], [undefined, null], [42, null], ["", null]])(
    "origemCampanha(%j) = %j",
    (v, esperado) => expect(origemCampanha(v)).toBe(esperado),
  );
});
