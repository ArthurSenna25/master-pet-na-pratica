"use server";
import "server-only";
import { processarEnvio, type LeadState } from "./lead-envio";

export type { LeadState };

// Duas actions finas: a campanha é FIXA aqui, no servidor. Campo extra ou oculto no POST (ex.: `campanha`) é ignorado pelos schemas.
export async function enviarLeadPresencial(_prev: LeadState, form: FormData): Promise<LeadState> {
  return processarEnvio("presencial", form);
}

export async function enviarLeadMentoria(_prev: LeadState, form: FormData): Promise<LeadState> {
  return processarEnvio("mentoria", form);
}
