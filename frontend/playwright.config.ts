import { defineConfig, devices } from "@playwright/test";

/**
 * Tests end-to-end (dossier e2e/) : Playwright pilote un vrai navigateur sur
 * l'application. Le backend (port 8000) et le front (port 8001) doivent être
 * lancés avant `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  // Le serveur de développement compile chaque page à sa première visite : on laisse du temps.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8001",
    locale: "fr-FR",
    // En cas d'échec : capture d'écran et trace (à ouvrir avec `npx playwright show-trace`).
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  // Chaque scénario est joué sur ordinateur et sur mobile (design responsive).
  projects: [
    { name: "ordinateur", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
