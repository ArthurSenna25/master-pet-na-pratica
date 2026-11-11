// changePasswordAction com tudo isolado: erros por campo e o destino após a troca (sessão viva x morta).
import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ changePassword: vi.fn(), getSession: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers(), cookies: async () => ({ toString: () => "better-auth.session_token=novo" }) }));
vi.mock("next/navigation", () => ({ redirect: (u: string) => { throw new Error(`REDIRECT:${u}`); } }));
vi.mock("../_lib/session", () => ({ requireSession: async () => ({ user: { id: "u1", email: "a@b.c" } }) }));
vi.mock("../_lib/auth", () => ({ auth: { api: { changePassword: m.changePassword, getSession: m.getSession, signInEmail: vi.fn() } } }));
vi.mock("../_lib/admin/tentativas", () => ({ bloqueado: async () => false, registrarFalha: vi.fn(), zerar: vi.fn(), chaveLogin: vi.fn(), chaveTrocaSenha: () => "k", LOGIN: {}, TROCA_SENHA: {} }));
vi.mock("../_lib/admin/events", () => ({ registrarAdminEvento: vi.fn() }));
vi.mock("../_lib/seguranca", () => ({ getClientIp: vi.fn(), ipHmac: vi.fn() }));

import { changePasswordAction } from "./actions";

const form = (atual: string, nova: string, confirmacao: string) => {
  const f = new FormData();
  f.set("atual", atual); f.set("nova", nova); f.set("confirmacao", confirmacao);
  return f;
};

beforeEach(() => { m.changePassword.mockReset(); m.getSession.mockReset(); });

describe("changePasswordAction", () => {
  it("erros ficam no campo certo", async () => {
    expect((await changePasswordAction({}, form("x", "curta", "curta"))).errors).toEqual({ nova: expect.stringContaining("de 12 a 200") });
    expect((await changePasswordAction({}, form("x", "nova-senha-segura-1", "outra-senha-segura"))).errors).toEqual({ confirmacao: expect.stringContaining("confirmação") });
    expect((await changePasswordAction({}, form("x", "x", "x"))).errors?.nova).toBeDefined();
    expect(m.changePassword).not.toHaveBeenCalled();
  });

  it("falha do Better Auth vira erro no campo 'atual'", async () => {
    m.changePassword.mockRejectedValue(new Error("x"));
    expect(await changePasswordAction({}, form("errada", "nova-senha-segura-1", "nova-senha-segura-1"))).toEqual({ errors: { atual: "Senha atual incorreta." } });
  });

  it("sessão nova válida: volta ao painel com o aviso", async () => {
    m.changePassword.mockResolvedValue({});
    m.getSession.mockResolvedValue({ user: {} });
    await expect(changePasswordAction({}, form("a", "nova-senha-segura-1", "nova-senha-segura-1"))).rejects.toThrow("REDIRECT:/admin?ok=senha");
  });

  it("sem sessão após a troca: vai ao login com o aviso (não promete o que não acontece)", async () => {
    m.changePassword.mockResolvedValue({});
    m.getSession.mockResolvedValue(null);
    await expect(changePasswordAction({}, form("a", "nova-senha-segura-1", "nova-senha-segura-1"))).rejects.toThrow("REDIRECT:/admin/login?ok=senha");
  });
});
