import { expect, test } from "@playwright/test";

import { apiAs, createProject, dateInDays, deleteProjects, login, uniqueName } from "./helpers";

test.describe("Tableau de bord", () => {
  const projectName = uniqueName("Projet tableau de bord e2e");
  const taskTitle = uniqueName("Tâche du tableau de bord");

  test.beforeEach(async () => {
    // Un projet avec une tâche assignée à Alice, due dans 2 jours : c'est l'échéance
    // la plus proche, le Kanban s'ouvre donc sur son mois.
    const alice = await apiAs("alice@example.com");
    const projectId = await createProject(alice, { name: projectName });
    const { user } = await (await alice.get("/api/account")).json();
    const form = new FormData();
    form.append("title", taskTitle);
    form.append("description", "Tâche créée par un test end-to-end");
    form.append("dueDate", dateInDays(2));
    form.append("status", "TODO");
    form.append("assigneeIds", user.id);
    expect((await alice.post(`/api/projects/${projectId}/tasks`, { multipart: form })).ok()).toBe(
      true,
    );
    await alice.dispose();
  });

  test.afterEach(async () => {
    const alice = await apiAs("alice@example.com");
    await deleteProjects(alice, [projectName]);
    await alice.dispose();
  });

  test("les trois vues et la recherche", async ({ page }) => {
    await login(page, "alice@example.com");
    const views = page.getByRole("group", { name: "Affichage du tableau de bord" });

    await test.step("vue Liste par défaut, avec recherche", async () => {
      await expect(views.getByRole("button", { name: "Liste" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(page.getByRole("heading", { name: taskTitle })).toBeVisible();

      const search = page.getByLabel("Rechercher une tâche");
      await search.fill("aucune tâche ne porte ce nom");
      await expect(page.getByText("Aucune tâche ne correspond à votre recherche.")).toBeVisible();
      await search.fill(taskTitle);
      await expect(page.getByRole("heading", { name: taskTitle })).toBeVisible();
    });

    await test.step("vue Kanban du mois", async () => {
      await views.getByRole("button", { name: "Kanban" }).click();
      const kanban = page.getByRole("region", { name: "Kanban des tâches du mois" });
      await expect(kanban.getByRole("heading", { name: /À faire/ })).toBeVisible();
      await expect(kanban.getByRole("heading", { name: /En cours/ })).toBeVisible();
      await expect(kanban.getByRole("heading", { name: /Terminée/ })).toBeVisible();
      await expect(kanban.getByRole("heading", { name: taskTitle })).toBeVisible();
    });

    await test.step("vue Mes projets", async () => {
      await views.getByRole("button", { name: "Mes projets" }).click();
      const projects = page.getByRole("region", { name: "Projets avec des tâches assignées" });
      await expect(projects.getByRole("heading", { name: projectName })).toBeVisible();
    });
  });
});
