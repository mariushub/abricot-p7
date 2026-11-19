import { redirect } from "next/navigation";

/**
 * La racine n'a pas de contenu propre : elle renvoie vers le tableau de bord.
 * La redirection vers la connexion (utilisateur non connecté) viendra avec
 * l'authentification.
 */
export default function HomePage() {
  redirect("/dashboard");
}
