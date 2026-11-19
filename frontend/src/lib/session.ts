import "server-only";

import { cookies } from "next/headers";

/*
 * Session : le JWT renvoyé par le backend, stocké dans un cookie httpOnly.
 * Le proxy (src/proxy.ts) utilise aussi ce fichier pour lire le cookie.
 */

export const TOKEN_COOKIE_NAME = "abricot_token";

/**
 * Date d'expiration inscrite dans le JWT (champ `exp`). La signature n'est pas
 * vérifiée ici : seul le backend, qui détient la clé secrète, peut le faire.
 */
function getTokenExpiry(token: string): Date | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.exp === "number" ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
}

/** Un token illisible est considéré comme expiré. */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  return expiry === null || expiry.getTime() <= Date.now();
}

/**
 * Enregistre le JWT dans un cookie que seul le serveur peut lire.
 * Appelée par la route /api/auth/login : un cookie ne peut être modifié que côté serveur.
 */
export async function createSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true, // inaccessible au JavaScript du navigateur : protège le token d'un vol par XSS
    secure: process.env.NODE_ENV === "production", // envoyé uniquement en HTTPS en production
    sameSite: "lax", // non envoyé par les requêtes provenant d'autres sites (CSRF)
    path: "/",
    expires: getTokenExpiry(token) ?? undefined, // même durée de vie que le JWT
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE_NAME)?.value;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}
