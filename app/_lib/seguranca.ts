import { createHash, createHmac } from "node:crypto";

export function sha256Hex(texto: string): string {
  return createHash("sha256").update(texto, "utf8").digest("hex");
}

/** HMAC-SHA256 do IP. O IP puro nunca é gravado nem logado. */
export function ipHmac(ip: string, secret = process.env.IP_HMAC_SECRET): string {
  if (!secret) throw new Error("IP_HMAC_SECRET não configurada");
  return createHmac("sha256", secret).update(ip).digest("hex");
}

/**
 * x-vercel-forwarded-for, depois o 1º valor de x-forwarded-for.
 * Sem header: 127.0.0.1 fora de produção; em produção, null (o envio é recusado; nunca agrupar todos num IP).
 */
export function getClientIp(h: Pick<Headers, "get">, nodeEnv = process.env.NODE_ENV): string | null {
  const v = h.get("x-vercel-forwarded-for") ?? h.get("x-forwarded-for");
  const ip = v?.split(",")[0]?.trim();
  if (ip) return ip;
  return nodeEnv !== "production" ? "127.0.0.1" : null;
}
