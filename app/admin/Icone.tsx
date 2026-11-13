/** Ícone do sprite do painel (public/admin-icons.svg). Decorativo: sempre aria-hidden. */
export function Icone({ nome, className }: { nome: string; className?: string }) {
  return (
    <svg className={className ? `i ${className}` : "i"} aria-hidden="true">
      <use href={`/admin-icons.svg#i-${nome}`} />
    </svg>
  );
}
