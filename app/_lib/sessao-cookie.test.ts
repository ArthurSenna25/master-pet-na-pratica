// Atributos do cookie de sessão como serão em PRODUÇÃO (https). Em http://localhost o Better Auth omite o Secure por desenho.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const anterior = process.env.BETTER_AUTH_URL;
beforeAll(() => { process.env.BETTER_AUTH_URL = "https://exemplo.vercel.app"; });
afterAll(() => { if (anterior === undefined) delete process.env.BETTER_AUTH_URL; else process.env.BETTER_AUTH_URL = anterior; });

describe("cookie de sessão (produção)", () => {
  it("__Secure-, Secure, httpOnly, SameSite=Lax, path=/admin, validade 7 dias renovada a cada 24 h", async () => {
    const { auth } = await import("./auth");
    const ctx = await auth.$context;
    const c = ctx.authCookies.sessionToken;
    expect(c.name).toBe("__Secure-better-auth.session_token");
    expect(c.attributes).toMatchObject({ secure: true, httpOnly: true, sameSite: "lax", path: "/admin", maxAge: 7 * 24 * 3600 });
    expect(ctx.sessionConfig.expiresIn).toBe(7 * 24 * 3600);
    expect(ctx.sessionConfig.updateAge).toBe(24 * 3600);
    expect(c.attributes).not.toHaveProperty("domain"); // host-only
  });
});
