import { formMentoriaAtivo } from "../_lib/mentoria-flag";

/** Textos que dependem de a pré-inscrição estar aberta (MENTORIA_FORM_ATIVO). Desligado: NENHUM texto afirma que está aberta.
 *  Ligado: os textos do handoff (CONTEUDO.md). Sem fato novo: só "em breve" no lugar de "agora". */
export function textos(ativo: boolean = formMentoriaAtivo()) {
  return ativo
    ? {
        ativo,
        selo: "Pré-inscrição aberta",
        cta: "Entrar na lista da turma",
        leadAbertura: "Mentoria online e individual com a Camila Becari. A turma abre no ano que vem. Entre na lista agora e receba o aviso em primeira mão, sem pagar nada.",
        micro: "Gratuito. Você só recebe o aviso da abertura.",
        leadFim: "Entre na lista da turma e receba o aviso da abertura em primeira mão.",
        descricao: "Mentoria online e individual com a Camila Becari. Entre na lista da turma e receba o aviso em primeira mão.",
      }
    : {
        ativo,
        selo: "Pré-inscrição em breve",
        cta: "Em breve",
        leadAbertura: "Mentoria online e individual com a Camila Becari. A turma abre no ano que vem. Em breve você poderá entrar na lista e receber o aviso em primeira mão, sem pagar nada.",
        micro: "Gratuito. A lista da turma abre em breve.",
        leadFim: "Em breve você poderá entrar na lista da turma e receber o aviso da abertura em primeira mão.",
        descricao: "Mentoria online e individual com a Camila Becari. A pré-inscrição abre em breve.",
      };
}
