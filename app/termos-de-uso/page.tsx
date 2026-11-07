import type { Metadata } from "next";
import { LegalPage, Pendente } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Termos de Uso (rascunho) — Master Pet na Prática",
  description: "Rascunho, sem revisão jurídica, dos termos de uso do site Master Pet na Prática.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <LegalPage titulo="Termos de Uso">
      <p>Rascunho, sem revisão jurídica. Estes termos podem mudar bastante antes da publicação definitiva.</p>

      <h2>1. Objeto do site</h2>
      <p>
        O site apresenta a mentoria presencial e individual de Camila Becari para donos de banho e tosa e permite pedir um contato para
        conversar. Quem responde pelo site: <Pendente>razão social e CNPJ da responsável</Pendente>.
      </p>

      <h2>2. Natureza informativa e ausência de promessa de resultado</h2>
      <p>
        O conteúdo é informativo. Não há promessa de resultado financeiro, de faturamento ou de qualquer outro resultado específico. O
        que a mentoria entrega depende do negócio de cada pessoa e é tratado na conversa.
      </p>

      <h2>3. Conteúdo provisório</h2>
      <p>
        Partes do site ainda são provisórias e aparecem marcadas (por exemplo, &ldquo;provisório&rdquo;, &ldquo;opções
        provisórias&rdquo; e textos de exemplo). Elas não representam a oferta final nem valores, prazos ou condições.
      </p>

      <h2>4. Propriedade intelectual</h2>
      <p>
        A marca, as imagens, os textos e o desenho do site são protegidos. Titular da marca e das imagens:{" "}
        <Pendente>confirmar titular e eventuais licenças</Pendente>. Não é permitido copiar ou reutilizar sem autorização.
      </p>

      <h2>5. Uso adequado</h2>
      <p>
        O formulário deve ser usado com informações verdadeiras e só pela própria pessoa ou com autorização dela. Não é permitido tentar
        burlar a segurança do site nem enviar conteúdo ilegal, ofensivo ou automatizado em massa.
      </p>

      <h2>6. Limitação de responsabilidade</h2>
      <p>
        O site é oferecido como está. Na medida permitida em lei, a responsável não responde por indisponibilidades, erros de conteúdo
        provisório ou decisões tomadas apenas com base no site. <Pendente>advogado deve revisar esta cláusula</Pendente>.
      </p>

      <h2>7. Links externos</h2>
      <p>
        O contato é retornado pelo WhatsApp, serviço de terceiros com termos e política próprios, sobre os quais a responsável não tem
        controle.
      </p>

      <h2>8. Lei aplicável e foro</h2>
      <p>
        Lei brasileira. Foro: <Pendente>foro de eleição</Pendente>.
      </p>

      <h2>9. Alterações</h2>
      <p>Estes termos podem mudar. Cada versão tem número e data, exibidos no topo da página.</p>

      <h2>10. Contato</h2>
      <p>
        Dúvidas sobre estes termos: <Pendente>e-mail de contato</Pendente>.
      </p>
    </LegalPage>
  );
}
