// Montado SEMPRE no servidor (Server Components). Usa só o número do lead; nenhuma env de destino entra aqui.
const TEXTO_INICIAL = "Olá! Aqui é a Camila, da Master Pet na Prática. Recebi o seu contato e queria conversar com você.";

/**
 * Número do lead (só dígitos, DDD + número = 10 ou 11) -> E.164 do Brasil (55 + DDD + número).
 * 10/11 dígitos: sempre prefixa 55 (55 também é DDD do RS, então "55 9xxxx-xxxx" com 11 dígitos é DDD 55).
 * 12/13 dígitos começando com 55: já vem com o país, não duplica. Qualquer outra coisa: null.
 */
export function normalizarWhatsapp(digitos: string): string | null {
  const d = digitos.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) return d;
  return null;
}

/** Link wa.me com texto neutro (sem nome nem dado do negócio). null se não há número válido. */
export function linkWhatsapp(digitos: string): string | null {
  const n = normalizarWhatsapp(digitos);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(TEXTO_INICIAL)}` : null;
}
