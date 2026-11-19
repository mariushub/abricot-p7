import { expect, test } from "@playwright/test";

import { login, PASSWORD } from "./helpers";

test.describe("Authentification", () => {
  test("une page protégée sans session renvoie vers la connexion", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("champs vides : erreurs sous les champs et focus sur le premier", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByText("Veuillez saisir votre email.")).toBeVisible();
    await expect(page.getByText("Veuillez saisir votre mot de passe.")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeFocused();
  });

  test("mauvais mot de passe : message d'erreur, email conservé", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("mauvais");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByText("Email ou mot de passe incorrect.")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("alice@example.com");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("inscription avec un email déjà utilisé", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill(PASSWORD);
    await page.getByRole("button", { name: "S'inscrire" }).click();

    await expect(page.getByText("Un compte existe déjà avec cet email.")).toBeVisible();
  });

  test("inscription d'un nouveau compte", async ({ page }) => {
    // Le backend ne permet pas de supprimer un compte : celui-ci reste en base
    // (un nouveau seed du backend le supprime).
    const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(PASSWORD);
    await page.getByRole("button", { name: "S'inscrire" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    // Sans nom renseigné, le tableau de bord salue l'utilisateur par son email.
    await expect(page.getByText(`Bonjour ${email}`)).toBeVisible();
  });

  test("connexion puis déconnexion", async ({ page }) => {
    await login(page, "alice@example.com");
    await expect(page.getByText("Bonjour Alice Martin")).toBeVisible();

    await page.getByRole("link", { name: "Mon compte" }).click();
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/login$/);

    // La session est bien terminée : les pages protégées sont de nouveau inaccessibles.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
