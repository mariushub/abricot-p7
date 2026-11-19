"use client";

import { Button } from "@/components/ui/Button";

/**
 * Affiché si une page connectée échoue (backend injoignable, erreur serveur…).
 * L'en-tête et le pied de page restent visibles ; « Réessayer » relance le rendu.
 */
export default function AppError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-6">
      <h1 className="text-h4 text-grey-800">Une erreur est survenue</h1>
      <p className="text-body-l text-grey-600">
        Impossible de charger cette page pour le moment. Vérifiez votre connexion puis réessayez.
      </p>
      <Button onClick={() => retry()}>Réessayer</Button>
    </div>
  );
}
