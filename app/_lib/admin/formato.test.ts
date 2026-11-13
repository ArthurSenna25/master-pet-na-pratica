import { describe, expect, it } from "vitest";
import { dataHora, formatarWhatsapp, soData, soHora } from "./formato";

describe("formatarWhatsapp (só exibição)", () => {
  it("celular, fixo, com 55 e formato desconhecido", () => {
    expect(formatarWhatsapp("14999993211")).toBe("(14) 99999-3211");
    expect(formatarWhatsapp("1433334444")).toBe("(14) 3333-4444");
    expect(formatarWhatsapp("5514999993211")).toBe("(14) 99999-3211");
    expect(formatarWhatsapp("123")).toBe("123");
  });
});

describe("data e hora em São Paulo", () => {
  it("09:30Z é 06:30 em SP (UTC-3); virada de dia respeita o fuso", () => {
    const d = new Date("2026-11-09T09:30:00Z");
    expect(dataHora(d)).toBe("09/11/2026 às 06:30");
    expect(soHora(new Date("2026-11-10T02:59:00Z"))).toBe("23:59");
    expect(soData(new Date("2026-11-10T02:59:00Z"))).toBe("09/11/2026");
    expect(soData(new Date("2026-11-10T03:00:00Z"))).toBe("10/11/2026");
  });
});
