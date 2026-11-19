import { readList, readText, validateRequiredText } from "@/lib/validation";

/**
 * Lit et valide le formulaire d'un projet (création et modification).
 * Règles du backend : nom de 2 à 100 caractères, description de 500 au maximum.
 */
export function readProjectForm(formData: FormData) {
  const name = readText(formData, "name");
  const description = readText(formData, "description");

  return {
    name,
    description,
    contributorEmails: readList(formData, "contributors"),
    fieldErrors: {
      name: validateRequiredText(name, { label: "le titre", min: 2, max: 100 }),
      description: validateRequiredText(description, { label: "la description", max: 500 }),
    },
  };
}
