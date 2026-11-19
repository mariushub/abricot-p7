import { NextResponse, type NextRequest } from "next/server";

import { TOKEN_COOKIE_NAME, isTokenExpired } from "@/lib/session";

/** Pages accessibles sans être connecté. Toutes les autres sont protégées. */
const AUTH_PAGES = ["/login", "/register"];

/**
 * Contrôle d'accès exécuté avant chaque requête de page.
 * - Sans token valide, une page protégée redirige vers /login.
 * - Un utilisateur déjà connecté qui ouvre /login ou /register est renvoyé
 *   vers le tableau de bord.
 * Le proxy ne vérifie que la présence et la date d'expiration du token : sa
 * signature est vérifiée par le backend, à chaque appel d'une route /api.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const hasUsableToken = token !== undefined && !isTokenExpired(token);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!isAuthPage) {
    if (hasUsableToken) return NextResponse.next();
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token) response.cookies.delete(TOKEN_COOKIE_NAME); // token expiré : on le supprime
    return response;
  }

  if (!hasUsableToken) return NextResponse.next();

  // Page de connexion avec un token non expiré : on demande au backend s'il est
  // toujours accepté (il peut avoir été invalidé, par exemple si l'utilisateur
  // a été supprimé). Sinon, on supprime le cookie et on affiche la page :
  // cela évite une boucle /login ↔ /dashboard.
  if (await isTokenAcceptedByBackend(token)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  const response = NextResponse.next();
  response.cookies.delete(TOKEN_COOKIE_NAME);
  return response;
}

async function isTokenAcceptedByBackend(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export const config = {
  // Le proxy ne s'exécute que sur les pages : ni sur les routes /api (elles
  // répondent 401 elles-mêmes sans session), ni sur les fichiers statiques.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
