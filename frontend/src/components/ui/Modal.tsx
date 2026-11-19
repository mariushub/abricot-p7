"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { CloseIcon } from "@/components/icons/CloseIcon";

type ModalProps = {
  title: string;
  /** Icône décorative affichée avant le titre (ex. étoile des modales IA). */
  icon?: ReactNode;
  /** wide : marges intérieures réduites (52 px au lieu de 73), comme les modales IA de la maquette. */
  size?: "default" | "wide";
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Fenêtre modale basée sur l'élément natif <dialog> : le navigateur gère le
 * piège du focus, la touche Échap, l'arrière-plan inerte et le retour du focus
 * sur le bouton d'ouverture, sans librairie.
 * Le contenu n'est monté que lorsque la modale est ouverte : un formulaire
 * repart donc de zéro à chaque ouverture.
 */
export function Modal({ title, icon, size = "default", isOpen, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      // Focus sur le premier champ plutôt que sur le bouton de fermeture.
      dialog.querySelector<HTMLElement>("input, textarea, select")?.focus();
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // Un clic sur l'arrière-plan (hors du contenu) ferme la modale.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-149.5 rounded-[10px] bg-white p-0 backdrop:bg-grey-950/40"
    >
      {isOpen && (
        <div
          className={`relative flex flex-col gap-10 px-6 pt-14 pb-10 sm:pt-20 sm:pb-15 ${
            size === "wide" ? "sm:px-13" : "sm:px-18.25"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-6 right-6 flex size-10 items-center justify-center rounded-[10px] text-grey-600 transition-colors hover:bg-grey-100"
          >
            <CloseIcon className="size-3.75" />
          </button>
          <h2 id={titleId} className="flex items-center gap-2 text-h4 text-grey-800">
            {icon}
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
