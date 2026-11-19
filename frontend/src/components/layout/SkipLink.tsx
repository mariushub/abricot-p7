export const MAIN_CONTENT_ID = "main-content";

/**
 * Lien d'évitement (WCAG 2.4.1) : invisible tant qu'il n'a pas le focus, il
 * permet aux utilisateurs clavier de passer directement au contenu principal.
 */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[10px] focus:bg-grey-950 focus:px-4 focus:py-3 focus:text-body-m focus:text-white"
    >
      Aller au contenu principal
    </a>
  );
}
