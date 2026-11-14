import { expect, test } from "@playwright/test";

const ROTAS = ["/", "/admin/login", "/politica-de-privacidade"];
const ESPERADOS: Record<string, RegExp> = {
  "x-content-type-options": /^nosniff$/,
  "referrer-policy": /^strict-origin-when-cross-origin$/,
  "x-frame-options": /^DENY$/,
  "strict-transport-security": /max-age=\d{8,}/,
  "cross-origin-opener-policy": /^same-origin$/,
  "permissions-policy": /camera=\(\).*microphone=\(\).*geolocation=\(\).*payment=\(\)/,
};

for (const rota of ROTAS) {
  test(`cabeçalhos de segurança presentes em ${rota}`, async ({ request }) => {
    const r = await request.get(rota);
    for (const [nome, re] of Object.entries(ESPERADOS)) expect(r.headers()[nome], nome).toMatch(re);
  });
}
