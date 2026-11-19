import type { ComponentProps } from "react";

type IconButtonProps = ComponentProps<"button"> & {
  /** Nom accessible obligatoire : le bouton ne contient qu'une icône. */
  "aria-label": string;
};

/** Bouton carré ne contenant qu'une icône (composant « Icon button » : retour, « … »). */
export function IconButton({ type = "button", className = "", ...buttonProps }: IconButtonProps) {
  return (
    <button
      type={type}
      className={`flex size-14.25 shrink-0 items-center justify-center rounded-[10px] border border-grey-200 bg-white text-grey-600 transition-colors hover:border-brand-dark aria-expanded:border-brand-dark ${className}`}
      {...buttonProps}
    />
  );
}
