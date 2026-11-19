import "server-only";

import { getSessionToken } from "@/lib/session";
import type { ApiResponse } from "@/types/api";

type BackendRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

/** Résultat d'un appel : les données en cas de succès, un message exploitable sinon. */
export type BackendResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      message: string;
      /** Erreurs de validation renvoyées par le backend, indexées par nom de champ. */
      fieldErrors: Record<string, string>;
    };

/**
 * Appelle le backend (URL définie par API_URL dans le .env) au nom de l'utilisateur
 * connecté : le JWT lu dans le cookie est envoyé dans l'en-tête Authorization.
 * Utilisé uniquement par les routes /api du front (src/app/api).
 * Ne lève jamais d'exception : une erreur réseau devient un résultat `ok: false`
 * avec un message lisible.
 */
export async function backendRequest<T>(
  path: string,
  { method = "GET", body }: BackendRequestOptions = {},
): Promise<BackendResult<T>> {
  const token = await getSessionToken();
  let response: Response;
  try {
    response = await fetch(`${process.env.API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Le serveur est injoignable. Réessayez dans quelques instants.",
      fieldErrors: {},
    };
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    return {
      ok: false,
      status: response.status,
      message: payload?.message ?? "Une erreur inattendue est survenue.",
      fieldErrors: extractFieldErrors(payload),
    };
  }

  return { ok: true, data: payload.data as T };
}

/** Le backend renvoie les erreurs de validation sous la forme data.errors = [{ field, message }]. */
function extractFieldErrors(payload: ApiResponse<unknown> | null): Record<string, string> {
  const errors = (payload?.data as { errors?: unknown } | undefined)?.errors;
  if (!Array.isArray(errors)) return {};

  return Object.fromEntries(
    errors
      .filter(
        (error): error is { field: string; message: string } => typeof error?.field === "string",
      )
      .map(({ field, message }) => [field, message]),
  );
}
