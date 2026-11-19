import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { Logo } from "@/components/ui/Logo";

type AuthScreenProps = {
  title: string;
  /** Photo affichée à droite sur grand écran (décorative). */
  image: StaticImageData;
  /** Lien vers l'autre page d'authentification, en bas du panneau. */
  footer: ReactNode;
  children: ReactNode;
};

/**
 * Mise en page commune aux pages Connexion et Inscription : panneau du
 * formulaire à gauche, photo à droite. Sous 1024px, la photo est masquée.
 */
export function AuthScreen({ title, image, footer, children }: AuthScreenProps) {
  return (
    <div className="flex flex-1">
      <div className="flex w-full flex-col items-center justify-between gap-16 bg-grey-50 px-6 py-14 lg:w-140.5 lg:shrink-0 lg:px-35">
        <Logo label="Abricot" className="h-auto w-63.25 max-w-full text-brand-dark" />

        <div className="flex w-full max-w-70.5 flex-col items-center gap-7.5">
          <h1 className="text-h1 text-brand-dark">{title}</h1>
          {children}
        </div>

        <p className="text-center text-body-s text-black">{footer}</p>
      </div>

      <div className="relative hidden flex-1 lg:block">
        <Image
          src={image}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="(min-width: 1024px) 61vw, 1px"
          // Cadrage identique à la maquette : on montre la partie droite de la photo.
          className="object-cover object-[93%_50%]"
        />
      </div>
    </div>
  );
}
