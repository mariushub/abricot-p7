import { backendRequest } from "@/lib/backend";
import { createSession } from "@/lib/session";
import { hasErrors, readText, validateEmail, validateNewPassword } from "@/lib/validation";
import type { User } from "@/types/api";

/** POST /api/auth/register : création d'un compte, puis connexion automatique. */
export async function POST(request: Request) {
  const formData = await request.formData();
  const email = readText(formData, "email");
  const password = String(formData.get("password") ?? "");

  const fieldErrors = {
    email: validateEmail(email),
    password: validateNewPassword(password),
  };
  if (hasErrors(fieldErrors)) return Response.json({ fieldErrors }, { status: 400 });

  const result = await backendRequest<{ user: User; token: string }>("/auth/register", {
    method: "POST",
    body: { email, password },
  });

  if (!result.ok) {
    if (result.status === 409) {
      return Response.json(
        { fieldErrors: { email: "Un compte existe déjà avec cet email." } },
        { status: 409 },
      );
    }
    return Response.json(
      {
        message: result.message,
        fieldErrors: { email: result.fieldErrors.email, password: result.fieldErrors.password },
      },
      { status: result.status },
    );
  }

  await createSession(result.data.token);
  return Response.json({ success: "Compte créé." });
}
