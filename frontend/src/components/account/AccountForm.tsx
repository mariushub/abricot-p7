"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstInvalidField } from "@/hooks/useFocusFirstInvalidField";
import { notifyDataChanged, sendToApi } from "@/lib/api-client";
import { PASSWORD_RULES } from "@/lib/validation";
import type { FormState } from "@/types/forms";

type AccountFormProps = {
  firstName: string;
  lastName: string;
  email: string;
};

/** État du formulaire : réponse de la route /api, plus les valeurs saisies à réafficher. */
type AccountFormState = FormState & { values?: AccountFormProps };

const INITIAL_STATE: AccountFormState = {};

/** Envoie le formulaire à PUT /api/account. */
async function updateAccount(
  _previousState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const result = await sendToApi("/api/account", "PUT", formData);
  // Le nom a pu être enregistré même si le mot de passe a échoué : on recharge
  // l'utilisateur affiché (initiales de l'en-tête, titre de la page).
  notifyDataChanged();
  return {
    ...result,
    values: {
      lastName: String(formData.get("lastName") ?? ""),
      firstName: String(formData.get("firstName") ?? ""),
      email: String(formData.get("email") ?? ""),
    },
  };
}

/** Formulaire « Mon compte » : nom, prénom, email et changement de mot de passe. */
export function AccountForm({ firstName, lastName, email }: AccountFormProps) {
  const [state, formAction, isPending] = useActionState(updateAccount, INITIAL_STATE);
  const formRef = useFocusFirstInvalidField(state);

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state]);

  const values = state.values ?? { firstName, lastName, email };

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-10">
      <FormError message={state.message} />

      <div className="flex flex-col gap-6">
        <TextField
          label="Nom"
          name="lastName"
          autoComplete="family-name"
          defaultValue={values.lastName}
          error={state.fieldErrors?.lastName}
        />
        <TextField
          label="Prénom"
          name="firstName"
          autoComplete="given-name"
          defaultValue={values.firstName}
          error={state.fieldErrors?.firstName}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={values.email}
          error={state.fieldErrors?.email}
        />
        <TextField
          label="Mot de passe"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          hint={`Laissez vide pour le conserver. ${PASSWORD_RULES}`}
          error={state.fieldErrors?.newPassword}
        />
        <TextField
          label="Mot de passe actuel"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          hint="Requis uniquement pour changer de mot de passe."
          error={state.fieldErrors?.currentPassword}
        />
      </div>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Enregistrement…" : "Modifier les informations"}
      </Button>
    </form>
  );
}
