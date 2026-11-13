import { Icone } from "./Icone";

/** Botão de ação principal (ouro) que abre o WhatsApp do lead. O link vem pronto do servidor (linkWhatsapp). */
export function BotaoWhatsapp({ href, nome }: { href: string; nome: string }) {
  return (
    <a className="ad-btn ad-btn--primary ad-btn--sm" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Chamar ${nome} no WhatsApp`}>
      <Icone nome="chat" />WhatsApp
    </a>
  );
}
