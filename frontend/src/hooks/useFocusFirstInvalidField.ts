"use client";

import { useEffect, useRef } from "react";

/**
 * Après une soumission refusée, place le focus sur le premier champ en erreur :
 * l'utilisateur clavier n'a pas à le chercher, et le lecteur d'écran lit le
 * libellé du champ avec son message d'erreur.
 * `submissionResult` est l'état du formulaire, mis à jour à chaque réponse de la route /api.
 */
export function useFocusFirstInvalidField(submissionResult: unknown) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submissionResult]);

  return formRef;
}
