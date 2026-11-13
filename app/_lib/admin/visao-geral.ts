// Funções puras da Visão geral (sem banco). Fuso de São Paulo para "hoje" e semanas; relógio do servidor para 48 h e 7 dias.
export const FUSO = "America/Sao_Paulo";
export const MIN_DECIDIDOS = 5;
export const AMOSTRA_MIN = 10;
export const SEMANAS = 12;
const DIA_MS = 86_400_000;

const fmtDia = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" });
const fmtHora = new Intl.DateTimeFormat("en-GB", { timeZone: FUSO, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Dia civil em São Paulo ("AAAA-MM-DD") de um instante. */
export function diaSP(d: Date): string {
  return fmtDia.format(d);
}

const civil = (dia: string) => { const [y, m, d] = dia.split("-").map(Number); return Date.UTC(y, m - 1, d); };
const diaDeUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const somarDias = (dia: string, n: number): string => diaDeUtc(civil(dia) + n * DIA_MS);

/** Segunda-feira ("AAAA-MM-DD") da semana, em São Paulo, a que o instante pertence. */
export function segundaDaSemanaSP(d: Date): string {
  const dia = diaSP(d);
  const dow = new Date(civil(dia)).getUTCDay(); // 0 = domingo
  return somarDias(dia, -((dow + 6) % 7));
}

/** Instante da meia-noite de São Paulo no dia civil dado. ponytail: offset medido no próprio dia; sem tabela de horário de verão. */
export function meiaNoiteSP(dia: string): Date {
  const palpite = new Date(civil(dia));
  const p = Object.fromEntries(fmtHora.formatToParts(palpite).map((x) => [x.type, x.value]));
  const local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return new Date(palpite.getTime() - (local - palpite.getTime()));
}

/** As n segundas-feiras mais recentes (a da semana atual por último). */
export function semanasRecentes(agora: Date, n = SEMANAS): string[] {
  const atual = segundaDaSemanaSP(agora);
  return Array.from({ length: n }, (_, i) => somarDias(atual, -7 * (n - 1 - i)));
}

export interface Semana { semana: string; n: number }
/** Semanas sem lead entram com 0; contagens fora da janela são ignoradas. */
export function preencherSemanas(semanas: string[], contagens: Semana[]): Semana[] {
  const por = new Map(contagens.map((c) => [c.semana, c.n]));
  return semanas.map((semana) => ({ semana, n: por.get(semana) ?? 0 }));
}

export interface Taxa { decididos: number; pct: number | null }
export function taxaConversao(convertidos: number, naoConvertidos: number): Taxa {
  const decididos = convertidos + naoConvertidos;
  return { decididos, pct: decididos >= MIN_DECIDIDOS ? Math.round((convertidos / decididos) * 100) : null };
}

export const amostraPequena = (totalLeads: number) => totalLeads > 0 && totalLeads < AMOSTRA_MIN;

/** "há 3 dias", "há 1 hora", "há 12 minutos"; menos de 1 minuto = "agora há pouco". */
export function haQuanto(de: Date, agora: Date): string {
  const min = Math.floor(Math.max(0, agora.getTime() - de.getTime()) / 60_000);
  const un = (n: number, s: string, p: string) => `há ${n} ${n === 1 ? s : p}`;
  if (min < 1) return "agora há pouco";
  if (min < 60) return un(min, "minuto", "minutos");
  if (min < 1440) return un(Math.floor(min / 60), "hora", "horas");
  return un(Math.floor(min / 1440), "dia", "dias");
}

/** "AAAA-MM-DD" -> "dd/mm". */
export const rotuloDia = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

export const SEMANAS_MIN = 4;
export const SEMANAS_MAX = 8;
/** Handoff: o gráfico mostra de 4 a 8 semanas, a partir da primeira semana com lead (até a atual). Lead só fora da janela = 8; sem lead = 4. */
export function janelaGrafico(semanas: Semana[], total: number): Semana[] {
  const i = semanas.findIndex((s) => s.n > 0);
  const desde = i >= 0 ? semanas.length - i : total > 0 ? SEMANAS_MAX : SEMANAS_MIN;
  return semanas.slice(-Math.min(SEMANAS_MAX, Math.max(SEMANAS_MIN, desde)));
}

/** Topo do eixo: máx(4, maior valor), par (o meio do eixo cai em número inteiro). */
export const topoEixo = (maior: number) => { const t = Math.max(4, maior); return t + (t % 2); };

/** "Esta semana × semana passada" a partir das mesmas contagens do gráfico (a última é a semana em andamento). */
export function esteVsPassada(semanas: Semana[]): { atual: number; passada: number; delta: number } {
  const atual = semanas.at(-1)?.n ?? 0;
  const passada = semanas.at(-2)?.n ?? 0;
  return { atual, passada, delta: atual - passada };
}

/** "AAAA-MM-DD" -> "dd/mm/aaaa". */
export const rotuloDiaCompleto = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}`;
