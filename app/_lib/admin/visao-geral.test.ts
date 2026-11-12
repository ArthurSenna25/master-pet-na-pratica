import { describe, expect, it } from "vitest";
import { amostraPequena, diaSP, haQuanto, meiaNoiteSP, preencherSemanas, rotuloDia, segundaDaSemanaSP, semanasRecentes, taxaConversao } from "./visao-geral";

describe("fuso de São Paulo (UTC-3)", () => {
  it("virada domingo -> segunda: 02:59:59Z de segunda ainda é domingo; 03:00:00Z já é a nova semana", () => {
    // 2026-11-09 é segunda-feira.
    expect(segundaDaSemanaSP(new Date("2026-11-09T02:59:59Z"))).toBe("2026-11-02");
    expect(segundaDaSemanaSP(new Date("2026-11-09T03:00:00Z"))).toBe("2026-11-09");
    expect(diaSP(new Date("2026-11-09T02:59:59Z"))).toBe("2026-11-08");
    expect(diaSP(new Date("2026-11-09T03:00:00Z"))).toBe("2026-11-09");
  });
  it("sábado, domingo e quarta caem na segunda certa", () => {
    expect(segundaDaSemanaSP(new Date("2026-11-14T15:00:00Z"))).toBe("2026-11-09");
    expect(segundaDaSemanaSP(new Date("2026-11-15T15:00:00Z"))).toBe("2026-11-09");
    expect(segundaDaSemanaSP(new Date("2026-11-11T15:00:00Z"))).toBe("2026-11-09");
  });
  it("virada de mês e de ano", () => {
    expect(segundaDaSemanaSP(new Date("2027-01-01T12:00:00Z"))).toBe("2026-12-28");
  });
  it("meia-noite de SP = 03:00Z", () => {
    expect(meiaNoiteSP("2026-11-09").toISOString()).toBe("2026-11-09T03:00:00.000Z");
  });
});

describe("semanas", () => {
  it("12 segundas, da mais antiga à atual", () => {
    const s = semanasRecentes(new Date("2026-11-11T15:00:00Z"));
    expect(s).toHaveLength(12);
    expect(s[11]).toBe("2026-11-09");
    expect(s[0]).toBe("2026-08-24");
  });
  it("semanas vazias entram com 0 e fora da janela é ignorado", () => {
    const s = semanasRecentes(new Date("2026-11-11T15:00:00Z"), 3);
    expect(preencherSemanas(s, [{ semana: "2026-11-09", n: 4 }, { semana: "2020-01-06", n: 9 }])).toEqual([
      { semana: "2026-10-26", n: 0 }, { semana: "2026-11-02", n: 0 }, { semana: "2026-11-09", n: 4 },
    ]);
  });
});

describe("taxa de conversão", () => {
  it("com menos de 5 decididos não exibe porcentagem", () => {
    expect(taxaConversao(2, 2)).toEqual({ decididos: 4, pct: null });
    expect(taxaConversao(0, 0)).toEqual({ decididos: 0, pct: null });
  });
  it("com 5 ou mais calcula convertidos / decididos", () => {
    expect(taxaConversao(1, 4)).toEqual({ decididos: 5, pct: 20 });
    expect(taxaConversao(3, 3).pct).toBe(50);
  });
});

describe("há quanto tempo e amostra", () => {
  const agora = new Date("2026-11-11T12:00:00Z");
  const antes = (ms: number) => new Date(agora.getTime() - ms);
  it("minutos, horas e dias com singular", () => {
    expect(haQuanto(antes(10_000), agora)).toBe("agora há pouco");
    expect(haQuanto(antes(60_000), agora)).toBe("há 1 minuto");
    expect(haQuanto(antes(12 * 60_000), agora)).toBe("há 12 minutos");
    expect(haQuanto(antes(3_600_000), agora)).toBe("há 1 hora");
    expect(haQuanto(antes(5 * 3_600_000), agora)).toBe("há 5 horas");
    expect(haQuanto(antes(24 * 3_600_000), agora)).toBe("há 1 dia");
    expect(haQuanto(antes(3 * 86_400_000 + 3_600_000), agora)).toBe("há 3 dias");
    expect(haQuanto(new Date(agora.getTime() + 5000), agora)).toBe("agora há pouco");
  });
  it("amostra pequena só entre 1 e 9 leads; rótulo dd/mm", () => {
    expect([0, 1, 9, 10].map(amostraPequena)).toEqual([false, true, true, false]);
    expect(rotuloDia("2026-11-09")).toBe("09/11");
  });
});
