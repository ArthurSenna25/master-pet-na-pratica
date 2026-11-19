import { Playfair_Display, Source_Sans_3 } from "next/font/google";

// Fontes PRÓPRIAS da campanha mentoria (variáveis --nm-*): não compartilham variável global com a LP presencial nem com o painel.
export const nmDisplay = Playfair_Display({ subsets: ["latin"], weight: "600", display: "swap", variable: "--nm-font-display" });
export const nmBody = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600"], display: "swap", variable: "--nm-font-body" });
