// Regras de validação dos campos de texto do lead. FONTE ÚNICA: o Zod do servidor (lead-schema.ts) e o formulário no navegador
// (lead-form-check.ts) usam estas funções. Sem dependências e sem a lista de municípios (essa fica só no servidor: municipios.ts).
// Sem libphonenumber: a regra do telefone é curta e fixa (DDD + 8/9 dígitos); a lib traria ~100 kB só para isso.

/** "invalido": erro que digitar mais não conserta (mostrar na hora). "incompleto": pode estar só em andamento (mostrar no blur e depois, com debounce). */
export type TipoErro = "invalido" | "incompleto";
export type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string; tipo: TipoErro };

const ok = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = (erro: string, tipo: TipoErro): Resultado<never> => ({ ok: false, erro, tipo });

/** NFC, apóstrofos tipográficos -> ', espaços colapsados, trim. */
export function normalizar(raw: string): string {
  return raw.normalize("NFC").replace(/[‘’´`]/g, "'").replace(/\s+/g, " ").trim();
}

/** Caracteres de controle (C0/C1). `\n` pode ser liberado (mensagem). */
function temControle(v: string, permiteQuebra = false): boolean {
  return [...v].some((ch) => {
    const c = ch.codePointAt(0) ?? 0;
    return (c < 32 && !(permiteQuebra && c === 10)) || (c >= 127 && c <= 159);
  });
}
const letras = (s: string) => (s.match(/\p{L}/gu) ?? []).length;

// ---------- nome ----------
export const NOME_MAX = 80;
export function checarNome(raw: string): Resultado<string> {
  const v = normalizar(raw);
  if (!v) return falha("Informe seu nome.", "incompleto");
  if (/[^\p{L}\p{M} '.\-]/u.test(v)) return falha("Use apenas letras, espaço, apóstrofo, hífen ou ponto.", "invalido");
  if (!/^\p{L}/u.test(v)) return falha("O nome deve começar com uma letra.", "invalido");
  if (v.length > NOME_MAX) return falha(`Use no máximo ${NOME_MAX} caracteres.`, "invalido");
  if (letras(v) < 2) return falha("Informe ao menos 2 letras.", "incompleto");
  return ok(v);
}

// ---------- WhatsApp ----------
/** 67 DDDs em uso no Brasil (Anatel). */
export const DDDS = new Set(
  "11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(" "),
);

/** Só os dígitos (tira +55 quando sobra). Não valida. */
export function soDigitosTelefone(raw: string): string {
  const s = raw.trim();
  let d = s.replace(/\D/g, "");
  if ((s.startsWith("+55") || d.length > 11) && d.startsWith("55")) d = d.slice(2); // 55 também é DDD do RS: só tira se sobra número
  return d;
}

/** Celular: DDD + 9 + 8 dígitos (11). Fixo: DDD + [2-5] + 7 dígitos (10). */
export function checarWhatsapp(raw: string): Resultado<string> {
  const s = normalizar(raw);
  if (!s) return falha("Informe o WhatsApp com DDD.", "incompleto");
  if (/[^\d\s()+\-.]/.test(s)) return falha("Use apenas números.", "invalido");
  const d = soDigitosTelefone(s);
  if (d.length > 11) return falha("Número longo demais. Use DDD + número.", "invalido");
  if (d.length >= 2 && !DDDS.has(d.slice(0, 2))) return falha("DDD inválido.", "invalido");
  if (d.length >= 3) {
    const t = d[2];
    if (t !== "9" && !"2345".includes(t)) return falha("Celular começa com 9 e fixo com 2 a 5.", "invalido");
    if (t !== "9" && d.length === 11) return falha("Telefone fixo tem 8 dígitos, sem o 9.", "invalido");
  }
  if (d.length < 10 || (d[2] === "9" && d.length < 11)) {
    return falha(d[2] === "9" && d.length === 10 ? "Celular tem 9 dígitos depois do DDD." : "Informe o WhatsApp completo, com DDD.", "incompleto");
  }
  if (/^(\d)\1+$/.test(d.slice(2))) return falha("Número inválido.", "invalido"); // 00000000, 999999999...
  return ok(d);
}

/** Máscara ao digitar: (14) 99999-0000 / (14) 3333-0000. */
export function formatarTelefone(raw: string): string {
  const d = soDigitosTelefone(raw).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const corte = d.length > 10 ? 7 : 6;
  const resto = d.slice(2);
  return `(${d.slice(0, 2)}) ${resto.slice(0, corte - 2)}${resto.length > corte - 2 ? "-" + resto.slice(corte - 2) : ""}`;
}

// ---------- Cidade/UF ----------
export const UFS = new Set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));
export interface CidadeUf { cidade: string; uf: string }

/** Formato "Cidade/UF" com UF entre as 27. A existência da cidade na UF é checada só no servidor (municipios.ts). */
export function checarCidadeUf(raw: string): Resultado<CidadeUf> {
  const v = normalizar(raw);
  if (!v) return falha("Informe a cidade/UF.", "incompleto");
  if (/[^\p{L}\p{M} '\-/]/u.test(v)) return falha("Use apenas letras na cidade, no formato Cidade/UF.", "invalido");
  if ((v.match(/\//g) ?? []).length > 1) return falha("Use o formato Cidade/UF, ex.: Lins/SP.", "invalido");
  const [c = "", u = ""] = v.split("/").map((x) => x.trim());
  if (!v.includes("/")) return falha("Informe como Cidade/UF, ex.: Lins/SP.", "incompleto");
  if (!/^\p{L}/u.test(c) || letras(c) < 2) return falha("Informe o nome da cidade.", "incompleto");
  if (c.length > 60) return falha("Nome de cidade longo demais.", "invalido");
  const uf = u.toUpperCase();
  if (uf.length < 2) return falha("Informe a UF com 2 letras, ex.: Lins/SP.", "incompleto");
  if (!UFS.has(uf)) return falha("UF inválida.", "invalido");
  return ok({ cidade: c, uf });
}

// ---------- negócio ----------
export const NEGOCIO_MAX = 80;
export function checarNegocio(raw: string): Resultado<string> {
  const v = normalizar(raw);
  if (!v) return falha("Informe o nome do negócio.", "incompleto");
  if (temControle(v) || /[^\p{L}\p{M}\p{N} .,'&+!?@#()/:;"%\-]/u.test(v)) return falha("Há um caractere não permitido no nome do negócio.", "invalido");
  if (v.length > NEGOCIO_MAX) return falha(`Use no máximo ${NEGOCIO_MAX} caracteres.`, "invalido");
  if (letras(v) < 1 || v.length < 2) return falha("Informe o nome do negócio.", "incompleto");
  return ok(v);
}

// ---------- mensagem (opcional) ----------
export const MENSAGEM_MAX = 1000;
export function checarMensagem(raw: string): Resultado<string | undefined> {
  const v = raw.normalize("NFC").replace(/\r\n?/g, "\n").trim();
  if (!v) return ok(undefined);
  if (temControle(v, true)) return falha("A mensagem tem caracteres não permitidos.", "invalido");
  if (v.length > MENSAGEM_MAX) return falha(`Use no máximo ${MENSAGEM_MAX} caracteres.`, "invalido");
  return ok(v);
}
