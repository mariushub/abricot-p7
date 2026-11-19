import type { NextRequest } from "next/server";

import { backendRequest } from "@/lib/backend";
import type { User } from "@/types/api";

/**
 * GET /api/users/search?query=… : recherche d'utilisateurs par nom ou email, pour
 * choisir des contributeurs. Le backend exige au moins 2 caractères, renvoie 10
 * résultats au maximum et inclut l'utilisateur connecté : on le retire (il ne
 * s'ajoute pas lui-même).
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  if (query.length < 2) return Response.json({ users: [] });

  const [searchResult, profileResult] = await Promise.all([
    backendRequest<{ users: User[] }>(`/users/search?query=${encodeURIComponent(query)}`),
    backendRequest<{ user: User }>("/auth/profile"),
  ]);
  if (!searchResult.ok) {
    return Response.json({ message: searchResult.message }, { status: searchResult.status });
  }

  const currentUserId = profileResult.ok ? profileResult.data.user.id : null;
  return Response.json({
    users: searchResult.data.users.filter((user) => user.id !== currentUserId),
  });
}
