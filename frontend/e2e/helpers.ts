import { expect, request, type APIRequestContext, type Page } from "@playwright/test";

/*
 * Outils communs aux tests end-to-end.
 * Les comptes viennent du seed du backend (alice, bob, jacques…), tous avec le même mot de passe.
 * Chaque test crée ses propres données avec un nom unique et les supprime à la fin :
 * les tests peuvent tourner en parallèle sans se gêner, et la base reste propre.
 */

export const PASSWORD = "P@ssword123";

/** Nom unique : « Projet e2e 1763540000000-42 ». */
export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/** Date au format d'un <input type="date"> (« 2026-11-22 »), `days` jours après aujourd'hui. */
export function dateInDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Connexion par le formulaire, comme un utilisateur. */
export async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

/**
 * Client HTTP connecté aux routes /api du front, sans navigateur : sert à
 * préparer les données d'un test et à les supprimer ensuite.
 */
export async function apiAs(email: string): Promise<APIRequestContext> {
  const api = await request.newContext({
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8001",
  });
  const response = await api.post("/api/auth/login", { multipart: { email, password: PASSWORD } });
  expect(response.ok(), `connexion de ${email}`).toBeTruthy();
  return api;
}

/** Crée un projet par la route /api et renvoie son identifiant. */
export async function createProject(
  api: APIRequestContext,
  { name, contributors = [] }: { name: string; contributors?: string[] },
) {
  const form = new FormData();
  form.append("name", name);
  form.append("description", "Projet créé par un test end-to-end");
  for (const email of contributors) form.append("contributors", email);
  expect((await api.post("/api/projects", { multipart: form })).ok()).toBeTruthy();

  const { projects } = await (await api.get("/api/projects")).json();
  return projects.find((project: { name: string }) => project.name === name).id as string;
}

/** Supprime les projets portant ces noms (nettoyage) ; ignore ceux qui n'existent plus. */
export async function deleteProjects(api: APIRequestContext, names: string[]) {
  const { projects } = await (await api.get("/api/projects")).json();
  for (const project of projects as { id: string; name: string }[]) {
    if (names.includes(project.name)) await api.delete(`/api/projects/${project.id}`);
  }
}
