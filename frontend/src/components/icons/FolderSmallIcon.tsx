type IconProps = {
  className?: string;
};

/** Icône « Dossier (projet) » (maquette Figma). Décorative : masquée aux lecteurs d'écran. */
export function FolderSmallIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 18 14"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path
        d="M16.4973 5.6407C17.0333 5.6407 17.5167 5.9039 17.7903 6.34481C18.0452 6.75694 18.0692 7.26157 17.8538 7.69444L15.1252 13.1642C14.8827 13.6501 14.386 13.9572 13.843 13.9572H1.14162C0.60244 13.9571 0.149457 13.5952 0.0302738 13.1105L3.18852 6.49032C3.43012 5.97391 3.96794 5.64071 4.55963 5.6407H16.4973ZM5.37898 0C5.74552 0 6.08916 0.173056 6.29696 0.463873L7.46983 2.10452C7.4723 2.10631 7.47975 2.1094 7.48936 2.1094H14.0441C14.6584 2.10959 15.1582 2.59118 15.1584 3.18364V4.62213H3.91705C3.32515 4.62213 2.78625 4.95539 2.54496 5.47175L0 10.8087V1.07423C0.000182159 0.481815 0.499774 0.000251782 1.11427 0H5.37898Z"
        fill="currentColor"
      />
    </svg>
  );
}
