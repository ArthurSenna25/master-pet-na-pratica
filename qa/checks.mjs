// Critérios de pronto da F2 (chromium). Uso: PORT=http://localhost:3100 node qa/checks.mjs
import { chromium } from "@playwright/test";

const URL = process.env.PORT ?? "http://localhost:3100";
const browser = await chromium.launch();
const out = {};
for (const w of [390, 1440]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 }, reducedMotion: "reduce" })).newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  out[w] = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const body = document.querySelector(".lp-sub");
    return {
      scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth,
      h1Count: document.querySelectorAll("h1").length,
      h1Font: getComputedStyle(h1).fontFamily.slice(0, 40) + " / " + getComputedStyle(h1).fontWeight,
      bodyFont: getComputedStyle(body).fontFamily.slice(0, 40) + " / " + getComputedStyle(body).fontWeight,
      fontsLoaded: [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.weight}`),
      check600: [document.fonts.check("600 20px 'Source Sans 3'"), document.fonts.check("600 20px 'Playfair Display'")],
      provBadges: [...document.querySelectorAll(".lp-prov")].map((e) => { const s = getComputedStyle(e); return `${e.textContent.slice(0, 22)}|bg=${s.backgroundColor}|bd=${s.borderTopColor}|fs=${s.fontStyle}`; }),
    };
  });
  // âncora #conversar abaixo do header fixo
  await page.click('a[href="#conversar"] >> nth=0', { force: true }).catch(() => {});
  await page.evaluate(() => (location.hash = "#conversar"));
  await page.waitForTimeout(1500);
  out[w].anchor = await page.evaluate(() => ({ formTop: Math.round(document.querySelector("#lp-form").getBoundingClientRect().top), sectionTop: Math.round(document.querySelector("#conversar").getBoundingClientRect().top), headerBottom: Math.round(document.querySelector(".lp-header").getBoundingClientRect().bottom) }));
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
