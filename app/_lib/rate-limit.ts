export const JANELA_MS = 10 * 60 * 1000; // 10 min
export const MAX_ENVIOS = 5;
export const RETENCAO_MS = 24 * 60 * 60 * 1000; // linhas com mais de 24 h são apagadas a cada envio

export const isLimited = (envios: number): boolean => envios >= MAX_ENVIOS;
export const inicioJanela = (agora: number): Date => new Date(agora - JANELA_MS);
export const corteRetencao = (agora: number): Date => new Date(agora - RETENCAO_MS);

// Teto GLOBAL do formulário (todos os IPs). Aceito: durante um ataque distribuído também barra leads reais (ver SEGURANCA.md).
export const JANELA_GLOBAL_MS = 60 * 60 * 1000; // 1 h
export const MAX_ENVIOS_HORA = 60;
export const isTetoGlobal = (envios: number): boolean => envios >= MAX_ENVIOS_HORA;
export const inicioJanelaGlobal = (agora: number): Date => new Date(agora - JANELA_GLOBAL_MS);
