// F10: com o formulário desativado (MENTORIA_FORM_ATIVO / produção) nenhum texto da página afirma que a pré-inscrição está aberta.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import Page from "./mentoria/page";
import { textos } from "./textos";

const antes = { ...process.env };
afterEach(() => { process.env = { ...antes }; });
const texto = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const render = () => texto(renderToStaticMarkup(createElement(Page)));

describe("página /mentoria x MENTORIA_FORM_ATIVO", () => {
  it("DESLIGADO (produção): selo e CTAs dizem 'em breve'; nada afirma que a pré-inscrição está aberta", () => {
    process.env.VERCEL_ENV = "production";
    delete process.env.MENTORIA_FORM_ATIVO;
    const t = render();
    expect(t).toContain("Pré-inscrição em breve");
    expect(t).not.toMatch(/inscrição aberta|\baberta\b/i);
    expect(t).not.toMatch(/Entr(ar|e) na lista da turma/);
    expect(t).not.toMatch(/Entre na lista agora/);
    expect(t).not.toMatch(/Pronto, você está na lista/);
    expect(t).toContain("Em breve"); // CTA e formulário
    expect(t).toContain("demonstração: use dados fictícios");
  });

  it("LIGADO (preview/local): textos do handoff", () => {
    process.env.VERCEL_ENV = "preview";
    const t = render();
    expect(t).toContain("Pré-inscrição aberta");
    expect(t).toContain("Entrar na lista da turma");
  });

  it("textos(): descrição e microcopy também mudam; ligado = literalmente os do handoff", () => {
    expect(textos(false).descricao).not.toMatch(/Entre na lista/);
    expect(textos(false).micro).not.toMatch(/aviso da abertura/);
    expect(textos(true).leadFim).toBe("Entre na lista da turma e receba o aviso da abertura em primeira mão.");
  });
});
