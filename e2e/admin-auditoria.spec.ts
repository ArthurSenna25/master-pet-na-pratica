import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { entrar } from "./admin-helpers";

test("sem sessão: auditoria.csv e documento respondem 401 (sem redirect)", async ({ request }) => {
  for (const rota of ["/admin/auditoria.csv", "/admin/decisoes-lgpd"]) {
    const r = await request.get(rota, { maxRedirects: 0 });
    expect(r.status(), rota).toBe(401);
  }
});

test("com sessão: baixa o CSV de auditoria (sem PII, com o próprio export) e o documento", async ({ page }) => {
  await entrar(page);

  const [csvDl] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Baixar auditoria (CSV)" }).click()]);
  expect(csvDl.suggestedFilename()).toMatch(/^auditoria-\d{4}-\d{2}-\d{2}\.csv$/);
  const csv = await readFile((await csvDl.path())!, "utf8");
  expect(csv.replace(/^\uFEFF/, "").split("\r\n")[0]).toBe("fonte,id,evento,lead_id,texto_versao,texto_hash,data_utc");
  expect(csv).toContain("admin_events,");
  expect(csv).toMatch(/admin_events,[^,]+,login,/); // o login deste teste
  expect(csv).toMatch(/admin_events,[^,]+,export_auditoria,/); // o próprio export
  expect(csv).not.toMatch(/ip_hmac|user_agent|IPHMAC/i);

  const [docDl] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Baixar documento LGPD" }).click()]);
  expect(docDl.suggestedFilename()).toBe("DECISOES-LGPD.md");
  const md = await readFile((await docDl.path())!, "utf8");
  expect(md).toContain("# DECISOES-LGPD");
  expect(md).not.toMatch(/postgres(ql)?:\/\/|_SECRET=|_PASSWORD=/);
});
