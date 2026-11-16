import { Playfair_Display, Source_Sans_3 } from "next/font/google";

// Fontes da marca Master Pet na Prática (LP presencial, páginas legais e painel). A campanha mentoria escolhe as suas (F10 c4).
export const display = Playfair_Display({ subsets: ["latin"], weight: "600", display: "swap", variable: "--font-display" });
export const body = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600"], display: "swap", variable: "--font-body" });
