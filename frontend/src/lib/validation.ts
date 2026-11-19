/*
 * Formulaires reçus par les routes /api : lecture des champs, puis règles de
 * validation alignées sur celles du backend (backend/src/utils/validation.ts)
 * pour afficher l'erreur avant l'appel API.
 */

/** Valeur texte d'un champ, sans espaces superflus ("" si absent). */
export function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Valeurs d'un champ multiple (cases à cocher), sans doublons ni valeurs vides. */
export function readList(formData: FormData, name: string): string[] {
  const values = formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string" && value.trim() !== "");
  return [...new Set(values.map((value) => value.trim()))];
}

/** Date d'un <input type="date"> (« 2026-03-09 ») convertie au format ISO attendu par l'API. */
export function dateInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_RULES =
  "8 caractères minimum, avec une majuscule, une minuscule, un chiffre et un caractère spécial parmi @ $ ! % * ? &.";

/** Renvoie un message d'erreur, ou undefined si l'email est valide. */
export function validateEmail(email: string): string | undefined {
  if (!email) return "Veuillez saisir votre email.";
  if (!EMAIL_PATTERN.test(email))
    return "Le format de l'email est invalide (exemple : nom@domaine.fr).";
}

/** Renvoie un message d'erreur, ou undefined si le mot de passe respecte les règles. */
export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Veuillez saisir un mot de passe.";
  // Les règles sont déjà affichées sous le champ (PASSWORD_RULES) : on ne les répète pas.
  if (!PASSWORD_PATTERN.test(password)) return "Ce mot de passe ne respecte pas ces règles.";
}

/**
 * Champ texte obligatoire de longueur bornée (titre, description…).
 * `label` est utilisé dans le message : « Le titre doit contenir… ».
 */
export function validateRequiredText(
  value: string,
  { label, min = 1, max }: { label: string; min?: number; max: number },
): string | undefined {
  if (!value) return `Veuillez renseigner ${label}.`;
  if (value.length < min) return `${capitalize(label)} doit contenir au moins ${min} caractères.`;
  if (value.length > max) return `${capitalize(label)} ne doit pas dépasser ${max} caractères.`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Vrai si au moins un champ a une erreur. */
export function hasErrors(fieldErrors: Record<string, string | undefined>): boolean {
  return Object.values(fieldErrors).some(Boolean);
}
