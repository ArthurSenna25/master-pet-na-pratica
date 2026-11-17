import { describe, expect, it } from "vitest";
import { NOPIN, PIN } from "./util";

// Avalia uma media query simples (lista separada por vírgula; termos (min|max)-(width|height):Npx ligados por "and").
const casa = (mq: string, w: number, h: number): boolean =>
  mq.split(",").some((parte) =>
    parte.split(" and ").every((t) => {
      const m = /\((min|max)-(width|height):(\d+)px\)/.exec(t.trim());
      if (!m) throw new Error(`termo inesperado: ${t}`);
      const v = m[2] === "width" ? w : h;
      return m[1] === "min" ? v >= Number(m[3]) : v <= Number(m[3]);
    }),
  );

describe("critério do pin (util.ts)", () => {
  it("NOPIN é o complemento exato de PIN em toda a grade (inclusive nas bordas)", () => {
    for (let w = 300; w <= 2000; w += 1) for (let h = 300; h <= 1300; h += 7) expect(casa(PIN, w, h)).toBe(!casa(NOPIN, w, h));
    for (const w of [899, 900, 1090, 1091]) for (const h of [589, 590, 639, 640]) expect(casa(PIN, w, h)).toBe(!casa(NOPIN, w, h));
  });

  it("notebooks comuns ligam o pin; celular e tablet em pé não", () => {
    for (const [w, h] of [[1280, 600], [1366, 657], [1366, 768], [1440, 700], [1536, 730], [1920, 1080], [1024, 768], [1093, 614], [1152, 624]]) expect(casa(PIN, w, h)).toBe(true);
    for (const [w, h] of [[390, 844], [820, 1180], [899, 1000], [1000, 600], [1366, 560], [1090, 600], [1229, 584]]) expect(casa(PIN, w, h)).toBe(false);
  });

  it("o CSS não repete o limite (só reage a .is-pinned)", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync("app/(mentoria)/mentoria.css", "utf8");
    expect(css).not.toMatch(/min-height:\s*(5[89]\d|6[0-9]\d|7[0-2]\d)px/);
  });
});
