type IconProps = {
  className?: string;
};

/** Flèche « Retour » (bouton retour de la maquette). Décorative : masquée aux lecteurs d'écran. */
export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        d="M15 6H1M1 6L6 1M1 6L6 11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
