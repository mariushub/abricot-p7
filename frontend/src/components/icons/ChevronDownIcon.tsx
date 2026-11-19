type IconProps = {
  className?: string;
};

/** Icône « Chevron vers le bas » (maquette Figma). Décorative : masquée aux lecteurs d'écran. */
export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 17 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        d="M16.6403 0.359746L8.5 8.50003L0.359715 0.359746"
        strokeWidth="1.01754"
        stroke="currentColor"
      />
    </svg>
  );
}
