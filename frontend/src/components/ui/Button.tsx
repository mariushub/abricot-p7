import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * primary : fond sombre (par défaut) ; outline : contour orange (action
   * secondaire) ; brand : fond orange (bouton « IA » de la maquette).
   */
  variant?: "primary" | "outline" | "brand";
};

const VARIANT_CLASSES = {
  primary: "bg-grey-800 text-white hover:bg-grey-950 disabled:bg-grey-200 disabled:text-grey-400",
  brand:
    "bg-brand-dark text-white hover:bg-brand-dark/90 disabled:bg-grey-200 disabled:text-grey-400",
  outline:
    "border border-brand-dark bg-white text-brand-dark hover:bg-brand-light disabled:border-grey-200 disabled:text-grey-400",
};

/**
 * Bouton (composant « Button » de la maquette), grisé lorsqu'il est désactivé.
 * `className` sert à positionner ou dimensionner le bouton, pas à changer son style.
 * Pour reprendre une largeur de la maquette, les marges passées dans `className`
 * prennent le modificateur `!` (ex. `sm:px-2.5!`) : sinon l'ordre des classes
 * générées par Tailwind peut leur faire perdre face à `px-6 sm:px-10`.
 */
export function Button({
  type = "button",
  variant = "primary",
  className = "",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-12.5 items-center justify-center gap-2 rounded-[10px] px-6 text-body-m whitespace-nowrap transition-colors disabled:cursor-not-allowed sm:px-10 ${VARIANT_CLASSES[variant]} ${className}`}
      {...buttonProps}
    />
  );
}
