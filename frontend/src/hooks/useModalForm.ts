"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useEffectEvent,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { useFocusFirstInvalidField } from "@/hooks/useFocusFirstInvalidField";
import { notifyDataChanged, sendToApi } from "@/lib/api-client";
import type { FormState } from "@/types/forms";

type ModalFormOptions = {
  /** Route /api qui reçoit le formulaire. */
  url: string;
  method: "POST" | "PUT";
  onSuccess: () => void;
  /** Vrai si les champs obligatoires sont déjà remplis (modification). */
  initiallyComplete?: boolean;
};

/**
 * Logique commune aux formulaires des modales (projets, tâches, commentaires) :
 * - envoi du formulaire à une route /api, sans réinitialisation automatique des
 *   champs (React vide le formulaire après une action passée en `action=`, ce qui
 *   effacerait la saisie en cas d'erreur) ;
 * - en cas de réussite : notification, rechargement des données affichées et
 *   rappel `onSuccess` ;
 * - bouton actif seulement quand les champs obligatoires sont remplis ;
 * - focus sur le premier champ en erreur.
 */
export function useModalForm({
  url,
  method,
  onSuccess,
  initiallyComplete = false,
}: ModalFormOptions) {
  const [state, formAction, isPending] = useActionState(
    (_previousState: FormState, formData: FormData) => sendToApi(url, method, formData),
    {},
  );
  const [isComplete, setIsComplete] = useState(initiallyComplete);
  const formRef = useFocusFirstInvalidField(state);

  // useEffectEvent : utilise toujours la dernière version de onSuccess, sans
  // relancer l'effet quand le parent en crée une nouvelle à chaque rendu.
  const handleSuccess = useEffectEvent((message: string) => {
    toast.success(message);
    notifyDataChanged();
    onSuccess();
  });

  // Une seule fois par nouvelle réponse de la route /api.
  useEffect(() => {
    if (state.success) handleSuccess(state.success);
  }, [state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    setIsComplete(event.currentTarget.checkValidity());
  }

  return {
    state,
    isPending,
    canSubmit: isComplete && !isPending,
    formProps: { ref: formRef, onSubmit: handleSubmit, onChange: handleChange, noValidate: true },
  };
}
