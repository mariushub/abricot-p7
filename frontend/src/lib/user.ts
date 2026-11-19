import type { User } from "@/types/api";

/**
 * Initiales affichées dans la pastille du compte : « Alice Martin » → « AM ».
 * Sans nom, on utilise les deux premières lettres de l'email.
 */
export function getUserInitials({ name, email }: Pick<User, "name" | "email">): string {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

/** Nom affiché : le nom complet, ou l'email si l'utilisateur n'a pas renseigné de nom. */
export function getDisplayName({ name, email }: Pick<User, "name" | "email">): string {
  return name?.trim() || email;
}

/**
 * Le backend ne stocke qu'un nom complet : le premier mot est considéré comme
 * le prénom, le reste comme le nom (« Alice Martin » → Alice / Martin).
 */
export function splitFullName(name: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const [firstName = "", ...rest] = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return { firstName, lastName: rest.join(" ") };
}
