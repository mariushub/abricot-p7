type IconProps = {
  className?: string;
};

/** Icône « Fermer » (maquette Figma). Décorative : masquée aux lecteurs d'écran. */
export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        d="M14.1068 0.153227C14.3112 -0.05098 14.6424 -0.0510654 14.8467 0.153227C15.0509 0.357525 15.0509 0.688788 14.8467 0.89311L8.23988 7.49891L14.8467 14.1057C15.051 14.3101 15.051 14.6423 14.8467 14.8466C14.6424 15.051 14.3101 15.051 14.1058 14.8466L7.5 8.23982L0.894195 14.8466C0.689884 15.051 0.357631 15.0509 0.153291 14.8466C-0.051045 14.6423 -0.051045 14.3101 0.153291 14.1057L6.7591 7.49891L0.153291 0.89311C-0.0510123 0.688772 -0.0510336 0.357551 0.153291 0.153227C0.357617 -0.0510655 0.688847 -0.0510655 0.893173 0.153227L7.5 6.75903L14.1068 0.153227Z"
        fill="currentColor"
      />
    </svg>
  );
}
