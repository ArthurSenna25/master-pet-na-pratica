// Formatação só para EXIBIÇÃO no painel (o banco guarda o WhatsApp só com dígitos).
const FUSO = "America/Sao_Paulo";

/** "14999993211" -> "(14) 99999-3211"; 10 dígitos -> "(14) 9999-3211"; com 55 na frente (12/13) tira o país. Outro formato: devolve como veio. */
export function formatarWhatsapp(digitos: string): string {
  let d = digitos.replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digitos;
}

/** "12/11/2026 11:30" (curta, para listas). */
export const dataCurta = (d: Date) => d.toLocaleString("pt-BR", { timeZone: FUSO, dateStyle: "short", timeStyle: "short" });

const dia = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", year: "numeric" });
const hora = (d: Date) => d.toLocaleTimeString("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** "09/11/2026 às 06:30" */
export const dataHora = (d: Date) => `${dia(d)} às ${hora(d)}`;
/** "09/11/2026" */
export const soData = dia;
/** "14:32" */
export const soHora = hora;
