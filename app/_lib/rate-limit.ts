export const JANELA_MS = 10 * 60 * 1000; // 10 min
export const MAX_ENVIOS = 5;
export const RETENCAO_MS = 24 * 60 * 60 * 1000; // linhas com mais de 24 h são apagadas a cada envio

export const isLimited = (envios: number): boolean => envios >= MAX_ENVIOS;
export const inicioJanela = (agora: number): Date => new Date(agora - JANELA_MS);
export const corteRetencao = (agora: number): Date => new Date(agora - RETENCAO_MS);

// Teto GLOBAL do formulário (todos os IPs). Aceito: durante um ataque distribuído também barra leads reais (ver SEGURANCA.md).
export const JANELA_GLOBAL_MS = 60 * 60 * 1000; // 1 h
export const MAX_ENVIOS_HORA = 60;
// TETO_GLOBAL_TESTE só vale com NODE_ENV=test (vitest): em produção a variável é ignorada.
const tetoVigente = (): number => (process.env.NODE_ENV === "test" && Number(process.env.TETO_GLOBAL_TESTE) > 0 ? Number(process.env.TETO_GLOBAL_TESTE) : MAX_ENVIOS_HORA);
export const isTetoGlobal = (envios: number): boolean => envios >= tetoVigente();
export const inicioJanelaGlobal = (agora: number): Date => new Date(agora - JANELA_GLOBAL_MS);
