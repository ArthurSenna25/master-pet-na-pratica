/** Formulário da campanha mentoria. Desativado POR PADRÃO em produção (Vercel: VERCEL_ENV=production); ligado em preview e local.
 *  MENTORIA_FORM_ATIVO=1 liga em qualquer ambiente; =0 desliga em qualquer ambiente. A página é estática: mudar a variável exige novo deploy
 *  para a tela; a action (servidor) lê a variável a cada envio e recusa sem gravar nada quando desligado. */
export function formMentoriaAtivo(env: Record<string, string | undefined> = process.env): boolean {
  const v = env.MENTORIA_FORM_ATIVO;
  if (v === "1") return true;
  if (v === "0") return false;
  return env.VERCEL_ENV !== "production";
}
