// Junta {x}-proto.png + {x}-port.png em PAIR-{x}.png (protótipo à esquerda). Uso: node qa/pair.mjs 390
import { chromium } from "@playwright/test";
import fs from "node:fs";

const w = Number(process.argv[2] ?? 390);
const dir = `qa/shots/${w}`;
const b64 = (f) => `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: w * 2 + 8, height: 800 } });
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith("-proto.png"))) {
  const base = f.replace("-proto.png", "");
  if (!fs.existsSync(`${dir}/${base}-port.png`)) continue;
  await page.setContent(`<body style="margin:0;background:#888;display:flex;gap:8px;align-items:flex-start"><img src="${b64(`${dir}/${base}-proto.png`)}" style="width:${w}px"><img src="${b64(`${dir}/${base}-port.png`)}" style="width:${w}px"></body>`);
  await page.screenshot({ path: `${dir}/PAIR-${base}.png`, fullPage: true });
}
await browser.close();
