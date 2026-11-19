/** Réponse des routes /api aux formulaires et suppressions (voir sendToApi). */
export type FormState = {
  /** Message de confirmation : la demande a réussi (la modale peut se fermer). */
  success?: string;
  /** Erreur générale, affichée en haut du formulaire. */
  message?: string;
  /** Erreurs par champ (nom du champ → message). */
  fieldErrors?: Record<string, string | undefined>;
};
