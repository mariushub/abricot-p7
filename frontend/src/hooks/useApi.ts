"use client";

import { useEffect, useState } from "react";

import { onDataChanged, redirectToLogin } from "@/lib/api-client";

type ApiError = { status: number; message: string };

/**
 * Charge les données d'une route /api (GET), puis les recharge après chaque
 * modification réussie (notifyDataChanged).
 * `data` vaut null pendant le premier chargement ; `error` contient le code HTTP
 * et le message si la route a répondu une erreur.
 */
export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    // Passe à false quand l'URL change ou que le composant disparaît :
    // une réponse arrivée trop tard est alors ignorée.
    let isCurrent = true;

    async function load() {
      try {
        const response = await fetch(url);
        if (response.status === 401) {
          redirectToLogin();
          return;
        }
        const body = await response.json();
        if (!isCurrent) return;
        if (response.ok) {
          setData(body);
          setError(null);
        } else {
          setError({ status: response.status, message: body.message });
        }
      } catch {
        if (isCurrent) setError({ status: 503, message: "Le serveur est injoignable." });
      }
    }

    load();
    const unsubscribe = onDataChanged(load);
    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [url]);

  return { data, error };
}
