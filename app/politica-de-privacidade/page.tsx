import type { Metadata } from "next";
import { LegalPage, Pendente } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Política de Privacidade (rascunho) — Master Pet na Prática",
  description: "Rascunho, sem revisão jurídica, da política de privacidade do site Master Pet na Prática.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <LegalPage titulo="Política de Privacidade">
      <p>
        Este texto descreve como os dados pessoais são tratados pelo formulário do site. A versão atual é uma demonstração: o
        formulário grava os dados enviados, por isso deve receber apenas dados fictícios. É um rascunho e não foi revisado por advogado.
      </p>

      <h2>1. Quem somos (controladora)</h2>
      <p>
        O site Master Pet na Prática apresenta a mentoria presencial e individual de Camila Becari para donos de banho e tosa. A
        controladora dos dados será: <Pendente>razão social, CNPJ e endereço da controladora</Pendente>. Enquadramento da controladora:{" "}
        <Pendente>confirmar se é ME/EPP e quais obrigações isso afeta</Pendente>.
      </p>

      <h2>2. Dados tratados pelo formulário</h2>
      <p>Ao enviar o formulário, a pessoa informa:</p>
      <ul>
        <li>nome e WhatsApp;</li>
        <li>cidade/UF e nome do negócio;</li>
        <li>tempo de funcionamento e número de pessoas na equipe;</li>
        <li>maior desafio, se já fez mentoria ou curso, e mensagem (opcional).</li>
      </ul>
      <p>No registro do consentimento (tabela <code>consent_events</code>), são guardados:</p>
      <ul>
        <li>data e hora, em UTC;</li>
        <li>versão do texto aceito e o hash (SHA-256) do texto;</li>
        <li>URL de origem e user agent do navegador;</li>
        <li>o IP do formulário, apenas em forma de hash HMAC, sem guardar o IP em texto puro.</li>
      </ul>
      <p>
        Para limitar envios em excesso, o hash HMAC do IP e a hora de cada envio ficam em uma tabela de controle por até 24 horas e
        depois são apagados.
      </p>
      <p>
        Painel de acesso restrito: o endereço IP de quem acessa o painel (apenas a pessoa administradora, não os titulares que preenchem
        o formulário) pode constar em texto puro na tabela de sessão e no controle de tentativas de login.{" "}
        <Pendente>prazo de retenção desses registros e eventual troca por hash (item em aberto)</Pendente>.
      </p>

      <h2>3. Finalidade</h2>
      <p>
        Os dados serão usados para retornar o contato da pessoa pelo WhatsApp e entender o momento do negócio dela. Não há outra
        finalidade prevista.
      </p>

      <h2>4. Base legal</h2>
      <p>
        Consentimento do titular (Lei nº 13.709/2018, LGPD, art. 7º, I), dado ao marcar a caixa de consentimento do formulário.
      </p>

      <h2>5. Compartilhamento e operadores</h2>
      <p>
        Os dados não são vendidos. São tratados por operadores de hospedagem e de banco de dados. Banco de dados: Neon, em servidor da
        AWS na região América do Sul (São Paulo, <code>sa-east-1</code>). Hospedagem: <Pendente>provedor (Vercel, a confirmar) e região
        de execução das funções</Pendente>. Transferência internacional (LGPD, art. 33):{" "}
        <Pendente>confirmar se ocorre e qual a salvaguarda aplicável</Pendente>. O contato posterior é feito pelo WhatsApp, serviço de
        terceiros sujeito aos próprios termos.
      </p>

      <h2>6. Retenção</h2>
      <p>
        Os dados ficam guardados pelo tempo necessário à finalidade acima: <Pendente>prazo de retenção</Pendente>. Ao fim desse prazo,
        são eliminados ou anonimizados. O controle de limite de envios é apagado em até 24 horas.
      </p>

      <h2>7. Direitos do titular (LGPD, art. 18)</h2>
      <p>A pessoa pode solicitar, a qualquer momento:</p>
      <ul>
        <li>confirmação de que há tratamento e acesso aos dados;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
        <li>portabilidade, nos termos da regulamentação;</li>
        <li>eliminação dos dados tratados com base no consentimento;</li>
        <li>informação sobre com quem os dados são compartilhados;</li>
        <li>informação sobre a possibilidade de não consentir e suas consequências;</li>
        <li>revogação do consentimento.</li>
      </ul>
      <p>
        Como exercer: pelo e-mail <Pendente>e-mail do canal do titular</Pendente>. Encarregado pelo tratamento de dados:{" "}
        <Pendente>nome e contato do encarregado, ou confirmação de dispensa conforme o enquadramento</Pendente>.
      </p>

      <h2>8. Revogação do consentimento</h2>
      <p>
        O consentimento pode ser revogado a qualquer momento, pelo mesmo canal do item 7. A revogação não afeta o tratamento já feito com
        base no consentimento anterior. Ela será registrada como novo evento, sem apagar o histórico do consentimento original.
      </p>

      <h2>9. Segurança</h2>
      <p>
        Adotamos medidas como conexão segura (HTTPS), validação dos dados no servidor, campo oculto contra robôs, limite de envios por
        origem (pelo hash do IP), registros do servidor sem dados pessoais e acesso restrito, com login, às pessoas autorizadas. Nenhuma
        medida elimina todos os riscos. Este item será revisto antes de qualquer coleta de dados reais.
      </p>

      <h2>10. Cookies, analytics e pixels</h2>
      <p>
        A página pública e o formulário não definem cookies, não usam ferramentas de analytics nem pixels de terceiros. As fontes são
        servidas pelo próprio site. O painel administrativo (<code>/admin</code>), de uso exclusivo da equipe, usa um único cookie de
        sessão, essencial, <code>httpOnly</code> e válido apenas no caminho <code>/admin</code>.
      </p>

      <h2>11. Incidentes de segurança</h2>
      <p>
        Em caso de incidente que possa acarretar risco ou dano relevante aos titulares, a controladora comunicará a ANPD e os titulares
        afetados, nos termos do art. 48 da LGPD.
      </p>

      <h2>12. Alterações desta política</h2>
      <p>
        Esta política pode mudar. Cada versão tem número e data, exibidos no topo da página, e o consentimento registra a versão que a
        pessoa realmente leu.
      </p>

      <h2>13. Contato</h2>
      <p>
        Dúvidas sobre esta política: <Pendente>e-mail do canal do titular</Pendente>.
      </p>
    </LegalPage>
  );
}
