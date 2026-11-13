import Link from "next/link";
import { Icone } from "../Icone";

/** Lista sem linhas: banco vazio (0 leads) ou filtro sem resultado (aponta para "Limpar filtros", que já está na barra). */
export function EstadoVazio({ totalGeral }: { totalGeral: number }) {
  return (
    <div className="ad-empty">
      <Icone nome={totalGeral === 0 ? "chat" : "search"} className="ad-empty__i" />
      {totalGeral === 0 ? (
        <>
          <h2>Ainda não chegou nenhum lead</h2>
          <p>Quando alguém enviar o formulário da página, o contato aparece aqui.</p>
          <Link className="ad-link" href="/admin" prefetch={false}>Voltar para a visão geral</Link>
        </>
      ) : (
        <>
          <h2>Nenhum lead para este filtro</h2>
          <p>Tente buscar por outra palavra, remova um filtro ou use “Limpar filtros” acima.</p>
        </>
      )}
    </div>
  );
}
