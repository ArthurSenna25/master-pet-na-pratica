// Capturas por seção da /mentoria. Uso: node qa/mentoria-shots.mjs <browser> <largura> <sufixo> [url]  (saída: qa/shots/f10/)
import { chromium, webkit } from "@playwright/test";
const [nav = "webkit", w = "390", suf = "ref", url = "http://localhost:3000/mentoria"] = process.argv.slice(2);
const SEC = { depoimentos: "#depoimentos", faq: "#faq", formulario: "#lista", rodape: "footer.nm-footer", trilha: "#trilha" };
const only = process.env.SO?.split(",") ?? Object.keys(SEC);
const b = await (nav === "webkit" ? webkit : chromium).launch();
const p = await (await b.newContext({ viewport: { width: +w, height: +w < 900 ? 844 : 900 }, reducedMotion: process.env.RM === "reduce" ? "reduce" : "no-preference", hasTouch: +w < 900 })).newPage();
await p.goto(url, { waitUntil: "load" });
await p.waitForTimeout(1500);
for (const k of only) {
  const el = p.locator(SEC[k]).first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);
  await el.screenshot({ path: `qa/shots/f10/${nav}-${k}-${w}-${suf}.png` });
  console.log("ok", k);
}
await b.close();
