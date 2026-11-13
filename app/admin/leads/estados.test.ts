// Estados vazio e erro da lista de leads, sem banco.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AdminError from "../error";
import { EstadoVazio } from "./EstadoVazio";

const html = (el: React.ReactElement) => renderToStaticMarkup(el);

describe("estados da lista de leads", () => {
  it("0 leads: mensagem própria e volta para a visão geral", () => {
    const h = html(createElement(EstadoVazio, { totalGeral: 0 }));
    expect(h).toContain("Ainda não chegou nenhum lead");
    expect(h).toContain('href="/admin"');
  });

  it("filtro sem resultado: aponta para 'Limpar filtros' (que está na barra) e não duplica o link", () => {
    const h = html(createElement(EstadoVazio, { totalGeral: 7 }));
    expect(h).toContain("Nenhum lead para este filtro");
    expect(h).not.toContain("<a ");
  });

  it("erro: texto fixo em role=alert, sem mensagem do erro", () => {
    const erro = Object.assign(new Error("detalhe-secreto com nome de lead"), { digest: "abc123" });
    const h = html(createElement(AdminError, { error: erro, reset: () => {} }));
    expect(h).toContain('role="alert"');
    expect(h).toContain("Algo deu errado. Tente novamente.");
    expect(h).not.toContain("detalhe-secreto");
    expect(h).not.toContain("abc123");
  });
});
