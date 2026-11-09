const BOM = "﻿"; // Excel abre UTF-8 corretamente
const GATILHO_FORMULA = /^[=+\-@\t\r]/;

/** Célula segura: neutraliza fórmula (prefixa ') e escapa para CSV (aspas, vírgula, quebra de linha). */
export function celulaCsv(valor: string | number | boolean | Date | null | undefined): string {
  if (valor === null || valor === undefined) return "";
  let t = valor instanceof Date ? valor.toISOString() : String(valor);
  if (GATILHO_FORMULA.test(t)) t = `'${t}`;
  return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

export function montarCsv(cabecalho: readonly string[], linhas: readonly (readonly (string | number | boolean | Date | null | undefined)[])[]): string {
  const todas = [cabecalho, ...linhas];
  return BOM + todas.map((l) => l.map(celulaCsv).join(",")).join("\r\n") + "\r\n";
}
