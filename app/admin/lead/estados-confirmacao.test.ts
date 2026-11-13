// O texto da confirmação cita o que o código apaga e mantém (provado em app/_lib/anonimizar.test.ts).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConfirmacaoLgpd } from "./[id]/ConfirmacaoLgpd";

const html = (tipo: "anonimizar" | "excluir") => renderToStaticMarkup(createElement(ConfirmacaoLgpd, { tipo, id: "00000000-0000-4000-8000-000000000000", nome: "Ana", criadoEm: new Date("2031-05-05T12:00:00Z"), base: "/admin/lead/x", modal: false }));

describe("ConfirmacaoLgpd", () => {
  it("anonimizar: apagado inclui IP e navegador; mantido inclui origem e versão/hash/data do consentimento", () => {
    const h = html("anonimizar");
    expect(h).toContain("IP (em hash) e navegador guardados no consentimento");
    expect(h).toContain("Origem (endereço da página)");
    expect(h).toContain("versão e hash do texto aceito e a data");
    expect(h).toContain('name="confirmar" value="sim"');
  });
  it("excluir: título esperado, botão de perigo e só a auditoria é mantida", () => {
    const h = html("excluir");
    expect(h).toContain("Excluir este lead?");
    expect(h).toContain("Só uma linha na auditoria");
  });
});
