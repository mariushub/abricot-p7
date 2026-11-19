import type { ReactNode } from "react";

export type TagColor = "red" | "orange" | "green" | "blue" | "brand" | "grey";

/** Couleurs du composant « Tag » de la maquette (fond clair + texte foncé de la même teinte). */
const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  red: "bg-error-light text-error",
  orange: "bg-warning-light text-warning",
  green: "bg-success-light text-success",
  blue: "bg-info-light text-info",
  brand: "bg-brand-light text-brand-dark",
  grey: "bg-grey-200 text-grey-600",
};

type TagProps = {
  color: TagColor;
  children: ReactNode;
  className?: string;
};

/** Étiquette arrondie : statut d'une tâche, rôle, nom d'un membre… */
export function Tag({ color, children, className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-1 text-body-s whitespace-nowrap ${TAG_COLOR_CLASSES[color]} ${className}`}
    >
      {children}
    </span>
  );
}
