export const JANELA_MS = 10 * 60 * 1000; // 10 min
export const MAX_ENVIOS = 5;
export const RETENCAO_MS = 24 * 60 * 60 * 1000; // linhas com mais de 24 h são apagadas a cada envio

export const isLimited = (envios: number): boolean => envios >= MAX_ENVIOS;
export const inicioJanela = (agora: number): Date => new Date(agora - JANELA_MS);
export const corteRetencao = (agora: number): Date => new Date(agora - RETENCAO_MS);
