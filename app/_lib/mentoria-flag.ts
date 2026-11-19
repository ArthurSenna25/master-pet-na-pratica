/** Formulário da campanha mentoria. Desativado POR PADRÃO em produção (Vercel: VERCEL_ENV=production ou desconhecido; NODE_ENV=production fora da Vercel); ligado em preview e em `next dev`.
 *  MENTORIA_FORM_ATIVO=1 liga em qualquer ambiente; =0 desliga em qualquer ambiente. A página /mentoria é DINÂMICA (force-dynamic): tela e action leem o mesmo
 *  valor em tempo de execução (promote/rollback de build não deixa tela e servidor divergirem). Desligado, a action recusa sem gravar nada. */
export function formMentoriaAtivo(env: Record<string, string | undefined> = process.env): boolean {
  const v = env.MENTORIA_FORM_ATIVO;
  if (v === "1") return true;
  if (v === "0") return false;
  // FALHA FECHADA: ligado por padrão só em preview/development da Vercel ou fora da Vercel sem NODE_ENV=production (next dev).
  // `next start`/Docker/VPS com NODE_ENV=production, VERCEL_ENV ausente ou desconhecido: DESLIGADO (precisa de MENTORIA_FORM_ATIVO=1).
  if (env.VERCEL_ENV) return env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development";
  return env.NODE_ENV !== "production";
}
