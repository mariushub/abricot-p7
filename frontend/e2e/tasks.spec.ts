import { expect, test } from "@playwright/test";

import { apiAs, createProject, dateInDays, deleteProjects, login, uniqueName } from "./helpers";

test.describe("Tâches d'un projet", () => {
  const projectName = uniqueName("Projet tâches e2e");

  // Supprimer le projet supprime aussi ses tâches et leurs commentaires.
  test.afterEach(async () => {
    const alice = await apiAs("alice@example.com");
    await deleteProjects(alice, [projectName]);
    await alice.dispose();
  });

  test("créer une tâche, la modifier, la commenter puis la supprimer", async ({ page }) => {
    const alice = await apiAs("alice@example.com");
    const projectId = await createProject(alice, { name: projectName });
    await alice.dispose();
    const title = "Rédiger le cahier de recette";
    const newTitle = "Rédiger et relire le cahier de recette";
    const taskCard = (taskTitle: string) =>
      page.getByRole("article").filter({ has: page.getByRole("heading", { name: taskTitle }) });

    await login(page, "alice@example.com");
    await page.goto(`/projects/${projectId}`);
    await expect(page.getByRole("heading", { level: 1, name: projectName })).toBeVisible();

    await test.step("création « En cours », assignée à Alice", async () => {
      await page.getByRole("button", { name: "Créer une tâche" }).click();
      const modal = page.getByRole("dialog", { name: "Créer une tâche" });
      await modal.getByLabel("Titre").fill(title);
      await modal.getByLabel("Description").fill("Lister les cas à tester avant la livraison");
      await modal.getByLabel("Échéance").fill(dateInDays(7));
      await modal.getByRole("button", { name: /Assigné à/ }).click();
      await modal.getByRole("checkbox", { name: /Alice Martin/ }).check();
      // Le bouton radio est masqué derrière une pastille : on clique la pastille, comme un utilisateur.
      await modal.getByText("En cours", { exact: true }).click();
      await expect(modal.getByRole("radio", { name: "En cours" })).toBeChecked();
      await modal.getByRole("button", { name: "+ Ajouter une tâche" }).click();

      await expect(modal).toBeHidden();
      await expect(taskCard(title)).toBeVisible();
      await expect(taskCard(title).getByText("En cours")).toBeVisible();
      await expect(taskCard(title).getByText("Alice Martin")).toBeVisible();
    });

    await test.step("modification du titre", async () => {
      await page.getByRole("button", { name: `Actions pour la tâche ${title}` }).click();
      await page.getByRole("button", { name: "Modifier", exact: true }).click();
      const modal = page.getByRole("dialog", { name: "Modifier", exact: true });
      await modal.getByLabel("Titre").fill(newTitle);
      await modal.getByRole("button", { name: "Enregistrer" }).click();

      await expect(modal).toBeHidden();
      await expect(taskCard(newTitle)).toBeVisible();
    });

    await test.step("ajout d'un commentaire", async () => {
      const card = taskCard(newTitle);
      await card.getByRole("button", { name: "Commentaires (0)" }).click();
      await card.getByLabel("Ajouter un commentaire").fill("Je m'en occupe cette semaine.");
      await card.getByRole("button", { name: "Envoyer" }).click();

      await expect(card.getByText("Je m'en occupe cette semaine.")).toBeVisible();
      await expect(card.getByRole("button", { name: "Commentaires (1)" })).toBeVisible();
    });

    await test.step("suppression (après confirmation)", async () => {
      await page.getByRole("button", { name: `Actions pour la tâche ${newTitle}` }).click();
      page.once("dialog", (dialog) => dialog.accept()); // fenêtre window.confirm
      await page.getByRole("button", { name: "Supprimer", exact: true }).click();

      await expect(taskCard(newTitle)).toHaveCount(0);
    });
  });
});
