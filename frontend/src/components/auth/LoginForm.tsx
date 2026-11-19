"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstInvalidField } from "@/hooks/useFocusFirstInvalidField";
import { sendToApi } from "@/lib/api-client";
import type { FormState } from "@/types/forms";

/** État du formulaire : réponse de la route /api, plus l'email saisi à réafficher. */
type LoginFormState = FormState & { email?: string };

const INITIAL_STATE: LoginFormState = {};

export function LoginForm() {
  const router = useRouter();

  /** Envoie le formulaire à POST /api/auth/login ; en cas de réussite, ouvre le tableau de bord. */
  async function login(_previousState: LoginFormState, formData: FormData) {
    const result = await sendToApi("/api/auth/login", "POST", formData);
    if (result.success) router.push("/dashboard");
    return { ...result, email: String(formData.get("email") ?? "") };
  }

  const [state, formAction, isPending] = useActionState(login, INITIAL_STATE);
  const formRef = useFocusFirstInvalidField(state);

  return (
    // noValidate : la validation est faite par la route /api, avec des messages accessibles.
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="flex w-full flex-col items-center gap-7.25"
    >
      <FormError message={state.message} />

      <div className="flex w-full flex-col gap-7.25">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          error={state.fieldErrors?.email}
        />
        <TextField
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-62.25">
        {isPending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
