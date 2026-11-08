// SÓ SERVIDOR: a lista (84 kB) nunca vai ao navegador. Importar apenas de lead-schema.ts / código de servidor.
// Fonte: IBGE, API de localidades (servicodados.ibge.gov.br/api/v1/localidades/municipios), baixada em 2026-11-08, 5 571 municípios em 27 UFs.
import dados from "./data/municipios.json";

const mapa = dados as Record<string, string[]>;

/** Sem acento, sem diferença de caixa, apóstrofos tipográficos iguais, espaços colapsados. */
export function chaveMunicipio(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").replace(/[‘’´`]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
}

const indice = new Map<string, Map<string, string>>();
for (const [uf, nomes] of Object.entries(mapa)) indice.set(uf, new Map(nomes.map((n) => [chaveMunicipio(n), n])));

/** Nome oficial do município na UF (com acentos), ou null se não existir. */
export function buscarMunicipio(cidade: string, uf: string): string | null {
  return indice.get(uf)?.get(chaveMunicipio(cidade)) ?? null;
}
