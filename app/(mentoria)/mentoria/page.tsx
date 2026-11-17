import { MentoriaFx } from "../_fx/MentoriaFx";
import { Sprite1 } from "../_secoes/Sprite1";
import { PularParaForm } from "../_secoes/PularParaForm";
import { Cabecalho } from "../_secoes/Cabecalho";
import { Abertura } from "../_secoes/Abertura";
import { Dia } from "../_secoes/Dia";
import { Trilha } from "../_secoes/Trilha";
import { Processo } from "../_secoes/Processo";
import { Camila } from "../_secoes/Camila";
import { ParaQuem } from "../_secoes/ParaQuem";
import { Como } from "../_secoes/Como";
import { Bonus } from "../_secoes/Bonus";
import { Depoimentos } from "../_secoes/Depoimentos";
import { Faq } from "../_secoes/Faq";
import { Lista } from "../_secoes/Lista";
import { Fab } from "../_secoes/Fab";
import { Rodape } from "../_secoes/Rodape";

// Campanha mentoria (F10 c4): seções estáticas do handoff mentoria-natal-v4, SEM JavaScript de movimento (tudo visível; as classes de estado
// .nm-js/.is-* do protótipo não são ligadas). Interações (diagnóstico, trilha, faixa, FAQ ativa) e o formulário de 2 passos vêm depois.
// Dinâmica: o flag MENTORIA_FORM_ATIVO é lido a cada pedido, igual à action (sem divergência tela x servidor).
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="nm" id="nm">
      <Sprite1 />
      <PularParaForm />
      <Cabecalho />
      <main id="conteudo">
        <Abertura />
        <Dia />
        <Trilha />
        <Processo />
        <Camila />
        <ParaQuem />
        <Como />
        <Bonus />
        <Depoimentos />
        <Faq />
        <Lista />
      </main>
      <Fab />
      <MentoriaFx />
      <Rodape />
    </div>
  );
}
