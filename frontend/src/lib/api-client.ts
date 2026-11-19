import type { FormState } from "@/types/forms";

/*
 * Appels aux routes /api du front depuis le navigateur.
 * Le cookie de session est envoyé automatiquement par le navigateur.
 */

const DATA_CHANGED_EVENT = "abricot:data-changed";

/** À appeler après une modification réussie : les données affichées se rechargent (voir useApi). */
export function notifyDataChanged() {
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
}

/** Abonnement au signal précédent. Renvoie la fonction de désabonnement. */
export function onDataChanged(listener: () => void) {
  window.addEventListener(DATA_CHANGED_EVENT, listener);
  return () => window.removeEventListener(DATA_CHANGED_EVENT, listener);
}

/**
 * Session absente ou expirée, ou déconnexion : retour à la page de connexion.
 * Rechargement complet volontaire (et non router.push) : il efface de la mémoire
 * du navigateur les données de l'utilisateur précédent (état React, cache du routeur).
 */
export function redirectToLogin() {
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- voir ci-dessus
  window.location.assign("/login");
}

/**
 * Envoie un formulaire (ou une suppression) à une route /api.
 * Renvoie la réponse JSON : { success } en cas de réussite, { message, fieldErrors } sinon.
 */
export async function sendToApi(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  formData?: FormData,
): Promise<FormState> {
  try {
    const response = await fetch(url, { method, body: formData });
    if (response.status === 401) {
      redirectToLogin();
      return {};
    }
    return await response.json();
  } catch {
    return { message: "Le serveur est injoignable. Réessayez dans quelques instants." };
  }
}
