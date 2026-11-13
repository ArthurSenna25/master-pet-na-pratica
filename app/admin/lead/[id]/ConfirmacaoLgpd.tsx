import { soData } from "../../../_lib/admin/formato";
import { anonimizarLeadAction, excluirLeadAction } from "../../lead-actions";
import { Icone } from "../../Icone";
import { NavLead } from "./NavLead";

const TEXTOS = {
  anonimizar: {
    titulo: "Anonimizar este lead?", passo: "Anonimizar", icone: "shield", cor: "ad-conf__ic--w", acao: anonimizarLeadAction, botao: "Sim, anonimizar",
    apagado: ["Nome e negócio", "WhatsApp", "Mensagem e observação", "IP (em hash) e navegador guardados no consentimento"],
    mantido: ["Cidade/UF, tempo de funcionamento, equipe, desafio e mentoria", "Status e datas", "Origem (endereço da página) do lead e do consentimento", "Prova do consentimento: versão e hash do texto aceito e a data", "O lead segue contando nos números"],
  },
  excluir: {
    titulo: "Excluir este lead?", passo: "Excluir", icone: "trash", cor: "ad-conf__ic--d", acao: excluirLeadAction, botao: "Sim, excluir para sempre",
    apagado: ["Todos os dados do lead e a observação", "O registro do consentimento", "O lead some das listas e dos números"],
    mantido: ["Só uma linha na auditoria (que houve uma exclusão), sem dado pessoal"],
  },
} as const;

/** Passo 2 de 2: formulário com confirmar=sim (a action só roda com ele). Sem JS é uma página/bloco comum. */
export function ConfirmacaoLgpd({ tipo, id, nome, criadoEm, base, modal }: { tipo: "anonimizar" | "excluir"; id: string; nome: string; criadoEm: Date; base: string; modal: boolean }) {
  const t = TEXTOS[tipo];
  const Titulo = modal ? "h2" : "h1";
  return (
    <section role="alertdialog" aria-labelledby="conf-t" aria-describedby="conf-d" className="ad-card ad-conf">
      <div className={`ad-conf__ic ${t.cor}`}><Icone nome={t.icone} /></div>
      <p className="ad-eyebrow">Passo 2 de 2 · {t.passo}</p>
      <Titulo id="conf-t">{t.titulo}</Titulo>
      <p className="ad-sub" id="conf-d">Lead de <b>{nome}</b>, recebido em {soData(criadoEm)}.</p>
      <div className="ad-two">
        <div><h3 className="ad-h3">Será apagado</h3><ul className="ad-ul ad-ul--x">{t.apagado.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><h3 className="ad-h3">Será mantido</h3><ul className="ad-ul ad-ul--ok">{t.mantido.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
      <p className="ad-warn"><Icone nome="alert" />Esta ação não pode ser desfeita.</p>
      <form className="ad-conf__f" action={t.acao}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="confirmar" value="sim" />
        <button type="submit" className="ad-btn ad-btn--danger">{t.botao}</button>
        <NavLead modal={modal} href={base} className="ad-btn ad-btn--secondary">Cancelar</NavLead>
      </form>
    </section>
  );
}
