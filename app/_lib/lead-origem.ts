// Origem do envio (F10). Funções puras, sem I/O.
const MAX_ORIGEM = 300;
export const ORIGEM_CAMPANHA_RE = /^[a-z0-9][a-z0-9_-]*$/;
export const ORIGEM_CAMPANHA_MAX = 40;

/** Referer -> só host + caminho (sem esquema, query nem fragmento): um ?origem= ou qualquer query de link de terceiros não vai para o banco. */
export function origemSegura(referer: string | null | undefined): string {
  if (!referer) return "(desconhecida)";
  try {
    const u = new URL(referer);
    return `${u.host}${u.pathname}`.slice(0, MAX_ORIGEM);
  } catch {
    return "(desconhecida)";
  }
}

/** ?origem= vindo do campo oculto: texto curto no padrão do CHECK; qualquer outra coisa vira null (nunca erro para quem preenche). */
export function origemCampanha(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  return v.length > 0 && v.length <= ORIGEM_CAMPANHA_MAX && ORIGEM_CAMPANHA_RE.test(v) ? v : null;
}
