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
        Este texto descreve como os dados pessoais serão tratados quando o formulário do site estiver em funcionamento. Na versão de
        demonstração atual, o formulário ainda não coleta nem armazena nenhum dado. É um rascunho e não foi revisado por advogado.
      </p>

      <h2>1. Quem somos (controladora)</h2>
      <p>
        O site Master Pet na Prática apresenta a mentoria presencial e individual de Camila Becari para donos de banho e tosa. A
        controladora dos dados será: <Pendente>razão social, CNPJ e endereço da controladora</Pendente>. Enquadramento da controladora:{" "}
        <Pendente>confirmar se é ME/EPP e quais obrigações isso afeta</Pendente>.
      </p>

      <h2>2. Dados que serão coletados</h2>
      <p>Pelo formulário, quando ativo, a pessoa informará:</p>
      <ul>
        <li>nome e WhatsApp;</li>
        <li>cidade/UF e nome do negócio;</li>
        <li>tempo de funcionamento e número de pessoas na equipe;</li>
        <li>maior desafio e mensagem (opcional).</li>
      </ul>
      <p>No registro do consentimento, serão guardados:</p>
      <ul>
        <li>data e hora, em UTC;</li>
        <li>versão do texto aceito e o hash do texto;</li>
        <li>URL de origem e user agent do navegador;</li>
        <li>o IP, apenas em forma de hash HMAC, sem guardar o IP em texto puro.</li>
      </ul>

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
        Os dados não serão vendidos. Poderão ser tratados por operadores de hospedagem e de banco de dados:{" "}
        <Pendente>nome e localização (país) dos operadores, a definir na implantação do formulário</Pendente>. Se algum operador estiver
        fora do Brasil, haverá transferência internacional (LGPD, art. 33):{" "}
        <Pendente>confirmar se ocorre e qual a salvaguarda aplicável</Pendente>. O contato posterior é feito pelo WhatsApp, serviço de
        terceiros sujeito aos próprios termos.
      </p>

      <h2>6. Retenção</h2>
      <p>
        Os dados ficarão guardados pelo tempo necessário à finalidade acima: <Pendente>prazo de retenção</Pendente>. Ao fim desse prazo,
        serão eliminados ou anonimizados.
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
        Estão previstas medidas como conexão segura (HTTPS), validação dos dados no servidor, limite de envios por origem e acesso
        restrito, com login, às pessoas autorizadas. Nenhuma medida elimina todos os riscos. Este item será revisto antes de qualquer
        coleta real.
      </p>

      <h2>10. Cookies, analytics e pixels</h2>
      <p>
        A página pública do site não usa cookies não essenciais, ferramentas de analytics nem pixels de terceiros. As fontes são servidas
        pelo próprio site.
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
