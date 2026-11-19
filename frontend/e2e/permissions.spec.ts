import { expect, test } from "@playwright/test";

import { apiAs, createProject, deleteProjects, login, uniqueName } from "./helpers";

test.describe("Droits d'accès à un projet", () => {
  const projectName = uniqueName("Projet droits e2e");
  let projectId: string;

  // Projet d'Alice (administratrice) avec Bob comme contributeur ; Jacques n'en fait pas partie.
  test.beforeEach(async () => {
    const alice = await apiAs("alice@example.com");
    projectId = await createProject(alice, {
      name: projectName,
      contributors: ["bob@example.com"],
    });
    await alice.dispose();
  });

  test.afterEach(async () => {
    const alice = await apiAs("alice@example.com");
    await deleteProjects(alice, [projectName]);
    await alice.dispose();
  });

  test("l'administratrice peut modifier le projet", async ({ page }) => {
    await login(page, "alice@example.com");
    await page.goto(`/projects/${projectId}`);

    await expect(page.getByRole("heading", { level: 1, name: projectName })).toBeVisible();
    await expect(page.getByRole("button", { name: "Modifier le projet" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Créer une tâche" })).toBeVisible();
  });

  test("un contributeur voit le projet et crée des tâches, sans pouvoir le modifier", async ({
    page,
  }) => {
    await login(page, "bob@example.com");
    await page.goto(`/projects/${projectId}`);

    await expect(page.getByRole("heading", { level: 1, name: projectName })).toBeVisible();
    await expect(page.getByRole("button", { name: "Créer une tâche" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Modifier le projet" })).toHaveCount(0);
  });

  test("une personne extérieure au projet obtient la page introuvable", async ({ page }) => {
    await login(page, "jacques@example.com");
    await page.goto(`/projects/${projectId}`);

    await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
    await expect(page.getByText(projectName)).toHaveCount(0);
  });
});
