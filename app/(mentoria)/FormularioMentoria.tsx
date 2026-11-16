import { formMentoriaAtivo } from "../_lib/mentoria-flag";

// Commit 4: só o estado "Em breve". O formulário de 2 passos (nome/WhatsApp; cidade, negócio, tempo, equipe, desafio, consentimento) entra no c5.
// Desativado (produção): "Em breve" e a action não grava nada. Ativo (preview/local): mesma tela, com a marca de prévia.
export function FormularioMentoria() {
  const ativo = formMentoriaAtivo();
  return (
    <div className="nm-form" id="nm-form" role="region" aria-labelledby="h-form" data-form-ativo={ativo ? "1" : "0"}>
      <div className="nm-form__head"><h3 id="h-form">Entrar na lista da turma</h3></div>
      <p className="nm-lead">Em breve.</p>
      <p className="nm-muted">A lista da turma ainda não abriu. Quando abrir, é por aqui.</p>
      {ativo && <p className="nm-muted" data-previa>Prévia: o formulário entra na próxima etapa desta implementação.</p>}
      <p className="nm-demo-warn">
        <svg className="nm-ico" aria-hidden="true" focusable="false"><use href="#nm-alert" /></svg>
        <span>demonstração: use dados fictícios</span>
      </p>
    </div>
  );
}
