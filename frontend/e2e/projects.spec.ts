import { expect, test } from "@playwright/test";

import { apiAs, deleteProjects, login, uniqueName } from "./helpers";

test.describe("Projets", () => {
  const name = uniqueName("Projet e2e");
  const renamed = `${name} (modifié)`;

  // Nettoyage même si le test échoue en cours de route.
  test.afterEach(async () => {
    const alice = await apiAs("alice@example.com");
    await deleteProjects(alice, [name, renamed]);
    await alice.dispose();
  });

  test("créer un projet avec un contributeur, le modifier puis le supprimer", async ({ page }) => {
    await login(page, "alice@example.com");
    await page.getByRole("link", { name: "Projets" }).click();
    // Attendre la page : le tableau de bord a aussi un bouton « + Créer un projet ».
    await expect(page.getByRole("heading", { level: 1, name: "Mes projets" })).toBeVisible();

    await test.step("création avec Bob comme contributeur", async () => {
      await page.getByRole("button", { name: "+ Créer un projet" }).click();
      const modal = page.getByRole("dialog", { name: "Créer un projet" });
      await modal.getByLabel("Titre").fill(name);
      await modal.getByLabel("Description").fill("Projet créé par un test end-to-end");
      await modal.getByRole("button", { name: /Contributeurs/ }).click();
      await modal.getByLabel("Rechercher un utilisateur").fill("bob");
      await modal.getByRole("checkbox", { name: /Bob Dupont/ }).check();
      await modal.getByRole("button", { name: "Ajouter un projet" }).click();

      // La modale se ferme et la liste se met à jour sans recharger la page.
      await expect(modal).toBeHidden();
      await expect(page.getByRole("link", { name })).toBeVisible();
    });

    await test.step("page du projet : titre et contributeur", async () => {
      await page.getByRole("link", { name }).click();
      await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
      const contributors = page.getByRole("region", { name: /Contributeurs/ });
      await expect(contributors.getByText("Bob Dupont")).toBeVisible();
    });

    await test.step("modification du titre", async () => {
      await page.getByRole("button", { name: "Modifier le projet" }).click();
      const modal = page.getByRole("dialog", { name: "Modifier un projet" });
      await modal.getByLabel("Titre").fill(renamed);
      await modal.getByRole("button", { name: "Enregistrer" }).click();

      await expect(modal).toBeHidden();
      await expect(page.getByRole("heading", { level: 1, name: renamed })).toBeVisible();
    });

    await test.step("suppression (après confirmation)", async () => {
      await page.getByRole("button", { name: "Modifier le projet" }).click();
      page.once("dialog", (dialog) => dialog.accept()); // fenêtre window.confirm
      await page.getByRole("button", { name: "Supprimer le projet" }).click();

      await expect(page).toHaveURL(/\/projects$/);
      await expect(page.getByRole("link", { name: renamed })).toHaveCount(0);
    });
  });
});
