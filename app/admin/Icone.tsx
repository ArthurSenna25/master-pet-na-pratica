/** Ícone do sprite do painel (public/admin-icons.svg). Decorativo: sempre aria-hidden. */
export function Icone({ nome }: { nome: string }) {
  return (
    <svg className="i" aria-hidden="true">
      <use href={`/admin-icons.svg#i-${nome}`} />
    </svg>
  );
}
