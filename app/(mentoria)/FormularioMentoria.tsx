import { formMentoriaAtivo } from "../_lib/mentoria-flag";
import { FormMentoria } from "./FormMentoria";

// Desativado (produção, por padrão): "Em breve" e NENHUM campo; a action também recusa sem gravar. Ativo (preview/local): formulário de 2 passos.
export function FormularioMentoria() {
  if (formMentoriaAtivo()) return <FormMentoria />;
  return (
    <div className="nm-form" id="nm-form" role="region" aria-labelledby="h-form" data-form-ativo="0">
      <div className="nm-form__head"><h3 id="h-form">Lista da turma</h3></div>
      <p className="nm-lead">Em breve.</p>
      <p className="nm-form__nota">A lista da turma ainda não abriu. Quando abrir, é por aqui.</p>
      <p className="nm-demo-warn">
        <svg className="nm-ico" aria-hidden="true" focusable="false"><use href="#nm-alert" /></svg>
        <span>demonstração: use dados fictícios</span>
      </p>
    </div>
  );
}
