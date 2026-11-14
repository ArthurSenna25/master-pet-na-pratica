// Rotas protegidas: sem sessão => 401 sem tocar no banco; com sessão (simulada) => conteúdo correto e sem segredos.
import { count } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

let sessao: object | null = null;
vi.mock("../_lib/session", () => ({ getSessionOrNull: async () => sessao }));

import { getDb } from "../_lib/db";
import { adminEvents } from "../_lib/db/schema";
import { GET as auditoria } from "./auditoria.csv/route";
import { GET as documento } from "./decisoes-lgpd/route";
import { GET as leadsCsv } from "./leads.csv/route";

const db = getDb();
const eventos = async () => (await db.select({ n: count() }).from(adminEvents))[0].n;
const req = (h: Record<string, string> = {}) => new Request("http://localhost/admin/x", { headers: h });

beforeEach(() => { sessao = null; });

describe("sem sessão", () => {
  it("auditoria.csv responde 401 (sem redirect) e não grava nada", async () => {
    const antes = await eventos();
    const r = await auditoria(req());
    expect(r.status).toBe(401);
    expect(r.headers.get("location")).toBeNull();
    expect(await eventos()).toBe(antes);
  });
  it("decisoes-lgpd responde 401 e não entrega o documento", async () => {
    const r = await documento(req());
    expect(r.status).toBe(401);
    expect(await r.text()).not.toContain("DECISOES-LGPD");
  });
});

describe("leads.csv", () => {
  it("sem sessão: 401 sem redirect e sem gravar; cross-site com sessão: 403 e sem gravar", async () => {
    const antes = await eventos();
    const r = await leadsCsv(req());
    expect(r.status).toBe(401);
    expect(r.headers.get("location")).toBeNull();
    sessao = { user: {} };
    expect((await leadsCsv(req({ "sec-fetch-site": "cross-site" }))).status).toBe(403);
    expect(await eventos()).toBe(antes);
  });
  it("com sessão: 200, anexo CSV, no-store, e grava 1 admin_events", async () => {
    sessao = { user: {} };
    const antes = await eventos();
    const r = await leadsCsv(req());
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("text/csv");
    expect(r.headers.get("content-disposition")).toMatch(/attachment; filename="leads-\d{4}-\d{2}-\d{2}\.csv"/);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(await eventos()).toBe(antes + 1);
  });
});

describe("com sessão", () => {
  it("pedido cross-site é recusado (403) e não grava", async () => {
    sessao = { user: {} };
    const antes = await eventos();
    expect((await auditoria(req({ "sec-fetch-site": "cross-site" }))).status).toBe(403);
    expect(await eventos()).toBe(antes);
  });

  it("auditoria.csv: 200, anexo CSV, no-store, e grava 1 admin_events", async () => {
    sessao = { user: {} };
    const antes = await eventos();
    const r = await auditoria(req());
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("text/csv");
    expect(r.headers.get("content-disposition")).toMatch(/attachment; filename="auditoria-\d{4}-\d{2}-\d{2}\.csv"/);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(await eventos()).toBe(antes + 1);
  });

  it("decisoes-lgpd: serve o .md sem segredos nem credenciais (nem os valores reais do .env)", async () => {
    sessao = { user: {} };
    const r = await documento(req());
    expect(r.status).toBe(200);
    expect(r.headers.get("content-disposition")).toContain('filename="DECISOES-LGPD.md"');
    const md = await r.text();
    expect(md).toContain("# DECISOES-LGPD");
    expect(md).not.toMatch(/postgres(ql)?:\/\/|_SECRET=|_PASSWORD=|sk-[A-Za-z0-9]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY/);
    // os valores reais dos segredos (sem imprimir): nenhum pode aparecer no documento servido
    for (const k of ["DATABASE_URL", "BETTER_AUTH_SECRET", "IP_HMAC_SECRET", "ADMIN_PASSWORD"]) {
      const v = process.env[k];
      if (v && v.length >= 8) expect(md.includes(v), `documento contém o valor de ${k}`).toBe(false);
    }
  });
});

describe("as 3 rotas GET que gravam registro: origem", () => {
  const rotas = { "leads.csv": leadsCsv, "auditoria.csv": auditoria, "decisoes-lgpd": documento };
  const reqUrl = (h: Record<string, string>) => new Request("http://localhost:3000/admin/x", { headers: h });
  const negados: Record<string, Record<string, string>> = {
    "Sec-Fetch-Site cross-site": { "sec-fetch-site": "cross-site" },
    "Sec-Fetch-Site same-site (subdomínio)": { "sec-fetch-site": "same-site" },
    "Origin de outro site": { origin: "https://atacante.example" },
    "Origin com outra porta": { origin: "http://localhost:4000" },
    "Origin ilegível": { origin: "isto-nao-e-url" },
  };
  const aceitos: Record<string, Record<string, string>> = {
    "sem cabeçalhos (curl/navegador antigo)": {},
    "same-origin (clique no link)": { "sec-fetch-site": "same-origin" },
    "none (URL digitada)": { "sec-fetch-site": "none" },
    "Origin igual ao host": { origin: "http://localhost:3000", "sec-fetch-site": "same-origin" },
  };
  for (const [nome, rota] of Object.entries(rotas)) {
    it(`${nome}: recusa (403) as origens estranhas e não grava`, async () => {
      sessao = { user: {} };
      const antes = await eventos();
      for (const [caso, h] of Object.entries(negados)) expect((await rota(reqUrl(h))).status, caso).toBe(403);
      expect(await eventos()).toBe(antes);
    });
    it(`${nome}: aceita as origens legítimas`, async () => {
      sessao = { user: {} };
      for (const [caso, h] of Object.entries(aceitos)) expect((await rota(reqUrl(h))).status, caso).toBe(200);
    });
    it(`${nome}: sem sessão é 401 mesmo com origem estranha (sessão primeiro)`, async () => {
      expect((await rota(reqUrl({ "sec-fetch-site": "cross-site" }))).status).toBe(401);
    });
  }
});
