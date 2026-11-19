import { backendRequest } from "@/lib/backend";
import { createSession } from "@/lib/session";
import { hasErrors, readText } from "@/lib/validation";
import type { User } from "@/types/api";

/** POST /api/auth/login : connexion avec email et mot de passe. */
export async function POST(request: Request) {
  const formData = await request.formData();
  const email = readText(formData, "email");
  const password = String(formData.get("password") ?? "");

  const fieldErrors = {
    email: email ? undefined : "Veuillez saisir votre email.",
    password: password ? undefined : "Veuillez saisir votre mot de passe.",
  };
  if (hasErrors(fieldErrors)) return Response.json({ fieldErrors }, { status: 400 });

  const result = await backendRequest<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (!result.ok) {
    // Même message pour un compte inexistant et un mauvais mot de passe : le backend
    // ne révèle pas quels emails ont un compte, c'est volontaire.
    // Code 400 et non 401 : côté navigateur, un 401 signifie « session expirée ».
    if (result.status === 401) {
      return Response.json({ message: "Email ou mot de passe incorrect." }, { status: 400 });
    }
    return Response.json({ message: result.message }, { status: result.status });
  }

  await createSession(result.data.token);
  return Response.json({ success: "Connexion réussie." });
}
