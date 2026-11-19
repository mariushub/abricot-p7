"use client";

import { AccountForm } from "@/components/account/AccountForm";
import { Button } from "@/components/ui/Button";
import { useApi } from "@/hooks/useApi";
import { redirectToLogin, sendToApi } from "@/lib/api-client";
import { splitFullName } from "@/lib/user";
import type { User } from "@/types/api";

/** Déconnexion : suppression du cookie par POST /api/auth/logout, puis retour à la connexion. */
async function logout() {
  await sendToApi("/api/auth/logout", "POST");
  redirectToLogin();
}

/** Page « Mon compte » : informations de l'utilisateur et déconnexion. */
export function AccountContent() {
  const { data, error } = useApi<{ user: User }>("/api/account");

  // Affiché par la page d'erreur (app/(app)/error.tsx).
  if (error) throw new Error(error.message);

  const user = data?.user;
  const { firstName, lastName } = splitFullName(user?.name);

  return (
    <section className="flex flex-col gap-10 rounded-[10px] border border-grey-200 bg-white px-6 py-10 md:px-14.75">
      <div className="flex flex-col gap-2">
        <h1 className="text-h5 text-grey-800">Mon compte</h1>
        <p className="text-body-m text-grey-600">
          {user ? (user.name ?? user.email) : "Chargement…"}
        </p>
      </div>

      {user && (
        <>
          <AccountForm firstName={firstName} lastName={lastName} email={user.email} />
          <div className="border-t border-grey-200 pt-8">
            <Button variant="outline" onClick={logout}>
              Se déconnecter
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
