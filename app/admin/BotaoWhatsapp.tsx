import { Icone } from "./Icone";

/** Botão de ação principal (ouro) que abre o WhatsApp do lead. O link vem pronto do servidor (linkWhatsapp). Mesmo componente na lista, na Visão geral e no detalhe. */
export function BotaoWhatsapp({ href, nome, grande = false }: { href: string; nome: string; grande?: boolean }) {
  return (
    <a className={`ad-btn ad-btn--wa ${grande ? "ad-btn--lg" : "ad-btn--sm"}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Chamar ${nome} no WhatsApp`}>
      <Icone nome="chat" />{grande ? "Chamar no WhatsApp" : <span>WhatsApp</span>}
    </a>
  );
}
