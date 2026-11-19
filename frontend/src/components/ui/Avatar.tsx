type AvatarProps = {
  initials: string;
  /** Pastille orange pour l'utilisateur connecté ou le propriétaire, grise sinon. */
  highlighted?: boolean;
  className?: string;
};

/**
 * Pastille ronde avec les initiales d'un utilisateur (composant « User icon »).
 * Décorative : le nom complet est toujours affiché ou annoncé à côté.
 */
export function Avatar({ initials, highlighted = false, className = "" }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex size-6.75 shrink-0 items-center justify-center rounded-full border border-white text-body-2xs text-grey-950 ${
        highlighted ? "bg-brand-light" : "bg-grey-200"
      } ${className}`}
    >
      {initials}
    </span>
  );
}
