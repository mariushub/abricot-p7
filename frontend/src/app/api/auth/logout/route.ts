import { deleteSession } from "@/lib/session";

/** POST /api/auth/logout : déconnexion (suppression du cookie de session). */
export async function POST() {
  await deleteSession();
  return Response.json({ success: "Vous êtes déconnecté." });
}
