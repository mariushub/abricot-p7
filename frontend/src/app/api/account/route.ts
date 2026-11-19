import { backendRequest } from "@/lib/backend";
import { hasErrors, readText, validateEmail, validateNewPassword } from "@/lib/validation";
import type { User } from "@/types/api";

/** GET /api/account : utilisateur connecté. */
export async function GET() {
  const result = await backendRequest<{ user: User }>("/auth/profile");
  if (!result.ok) return Response.json({ message: result.message }, { status: result.status });
  return Response.json({ user: result.data.user });
}

/**
 * PUT /api/account : met à jour le profil (nom complet + email), puis le mot de
 * passe s'il est renseigné. Le backend ne stocke qu'un champ « name » : prénom et
 * nom y sont réunis.
 */
export async function PUT(request: Request) {
  const formData = await request.formData();
  const lastName = readText(formData, "lastName");
  const firstName = readText(formData, "firstName");
  const email = readText(formData, "email");
  const newPassword = String(formData.get("newPassword") ?? "");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const name = [firstName, lastName].filter(Boolean).join(" ");

  const fieldErrors = {
    email: validateEmail(email),
    lastName: name && name.length < 2 ? "Le nom doit contenir au moins 2 caractères." : undefined,
    newPassword: newPassword ? validateNewPassword(newPassword) : undefined,
    currentPassword:
      newPassword && !currentPassword
        ? "Saisissez votre mot de passe actuel pour le modifier."
        : undefined,
  };
  if (hasErrors(fieldErrors)) return Response.json({ fieldErrors }, { status: 400 });

  const profileResult = await backendRequest("/auth/profile", {
    method: "PUT",
    // Le backend refuse un nom vide : sans nom saisi, on ne modifie que l'email.
    body: name ? { name, email } : { email },
  });
  if (!profileResult.ok) {
    if (profileResult.status === 409) {
      return Response.json(
        { fieldErrors: { email: "Cet email est déjà utilisé par un autre compte." } },
        { status: 409 },
      );
    }
    return Response.json({ message: profileResult.message }, { status: profileResult.status });
  }

  if (newPassword) {
    const passwordResult = await backendRequest("/auth/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
    });
    if (!passwordResult.ok) {
      // Le profil a été enregistré, seul le mot de passe a échoué. Ici, le 401 du
      // backend signifie « mot de passe actuel incorrect » : on renvoie un 400,
      // car côté navigateur un 401 signifie « session expirée ».
      return Response.json(
        {
          message: "Vos informations ont été enregistrées, mais pas le nouveau mot de passe.",
          fieldErrors:
            passwordResult.status === 401
              ? { currentPassword: "Le mot de passe actuel est incorrect." }
              : { newPassword: passwordResult.fieldErrors.newPassword ?? passwordResult.message },
        },
        { status: 400 },
      );
    }
  }

  return Response.json({
    success: newPassword
      ? "Vos informations et votre mot de passe ont été mis à jour."
      : "Vos informations ont été mises à jour.",
  });
}
