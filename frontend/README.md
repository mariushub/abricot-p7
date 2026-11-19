# Abricot – Front-end

Interface de l'application de gestion de projet Abricot, développée avec **Next.js 16 (App Router)**, **React 19**, **TypeScript** et **Tailwind CSS 4**.

## Prérequis

- Node.js 20.9 ou plus récent
- Le [backend](../backend) démarré sur `http://localhost:8000`

## Installation et démarrage

```bash
cp .env.example .env
npm install
npm run dev
```

L'application est disponible sur [http://localhost:8001](http://localhost:8001).

> Le port **8001** est imposé par la configuration CORS du backend, qui n'accepte que les origines `localhost:8000` et `localhost:8001`.

Comptes de test (créés par le seed du backend) : `alice@example.com`, `bob@example.com`… mot de passe `P@ssword123`.

### Variable d'environnement

| Variable  | Valeur dans `.env.example` | Rôle                                        |
| --------- | -------------------------- | ------------------------------------------- |
| `API_URL` | `http://localhost:8000`    | URL du backend, lue uniquement côté serveur |

Next.js charge automatiquement le fichier `.env`. Il n'est pas versionné : seul le modèle `.env.example` l'est.

## Architecture : routes `/api` du front

```
Navigateur ──fetch──▶ Routes /api du front (src/app/api) ──JWT──▶ Backend (port 8000)
             cookie httpOnly                 lit le cookie, valide,
             envoyé automatiquement          appelle le backend
```

- Les pages et formulaires sont des **composants client** qui appellent les **routes `/api` du front** (_Route Handlers_ Next.js, fichiers `route.ts`). Toute la logique métier y est regroupée : validation des formulaires, enchaînement des appels au backend, messages d'erreur.
- **Lecture** : le hook [`useApi`](src/hooks/useApi.ts) (`fetch` + `useEffect`) charge les données d'une route `GET`.
- **Écriture** : [`sendToApi`](src/lib/api-client.ts) envoie le formulaire (`FormData`) à une route `POST`, `PUT` ou `DELETE`. Après une modification réussie, `notifyDataChanged()` demande aux données affichées de se recharger.
- Chaque `page.tsx` reste un composant serveur pour définir le titre de l'onglet (`metadata`), puis affiche le composant client de la page.

| Route                                      | Méthodes         | Rôle                                                               |
| ------------------------------------------ | ---------------- | ------------------------------------------------------------------ |
| `/api/auth/login`, `/api/auth/register`    | POST             | Connexion, inscription (pose le cookie)                            |
| `/api/auth/logout`                         | POST             | Déconnexion (supprime le cookie)                                   |
| `/api/account`                             | GET, PUT         | Utilisateur connecté ; modification du profil et mot de passe      |
| `/api/dashboard`                           | GET              | Tâches assignées et projets correspondants                         |
| `/api/projects`                            | GET, POST        | Projets (avec leurs tâches pour la progression) ; création         |
| `/api/projects/:id`                        | GET, PUT, DELETE | Projet et ses tâches ; modification et contributeurs ; suppression |
| `/api/projects/:id/tasks`                  | POST             | Création d'une tâche                                               |
| `/api/projects/:id/tasks/generate`         | POST             | Propositions de tâches par l'IA (Gemini), sans enregistrement      |
| `/api/projects/:id/tasks/:taskId`          | PUT, DELETE      | Modification, suppression d'une tâche                              |
| `/api/projects/:id/tasks/:taskId/comments` | POST             | Ajout d'un commentaire                                             |
| `/api/users/search?query=`                 | GET              | Recherche d'utilisateurs (choix des contributeurs)                 |

## Authentification

- Le JWT renvoyé par le backend est stocké dans un **cookie `httpOnly`**, `SameSite=Lax` et `Secure` en production : il est inaccessible au JavaScript du navigateur (pas de `localStorage`), donc protégé d'un vol par XSS. `SameSite=Lax` empêche aussi un autre site d'envoyer le cookie avec une requête `POST`, `PUT` ou `DELETE` vers les routes `/api` (CSRF). Le cookie expire en même temps que le token.
- Les **routes `/api`** lisent le cookie et transmettent le token au backend ([`src/lib/backend.ts`](src/lib/backend.ts)), qui vérifie sa signature à chaque appel. Sans session valide, une route répond `401` et le navigateur renvoie vers `/login`.
- Le **proxy** ([`src/proxy.ts`](src/proxy.ts)) redirige vers `/login` toute page protégée demandée sans token valide, et renvoie vers `/dashboard` un utilisateur connecté qui ouvre `/login` ou `/register`. Il ne s'applique pas aux routes `/api`.
- Erreurs gérées : champs vides ou invalides, identifiants incorrects (même message pour un compte inexistant, pour ne pas révéler quels emails sont inscrits), email déjà utilisé, backend injoignable.

## Scripts

| Commande               | Rôle                                            |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Serveur de développement (port 8001)            |
| `npm run build`        | Build de production                             |
| `npm run start`        | Lance le build de production (port 8001)        |
| `npm run lint`         | Analyse le code avec ESLint                     |
| `npm run lint:fix`     | Corrige automatiquement les erreurs ESLint      |
| `npm run format`       | Formate tout le code avec Prettier              |
| `npm run format:check` | Vérifie le formatage sans modifier les fichiers |
| `npm run test:e2e`     | Lance les tests end-to-end (Playwright)         |

## Tests end-to-end

Les tests du dossier [`e2e/`](e2e) utilisent **Playwright** : un vrai navigateur parcourt l'application comme un utilisateur (pages, routes `/api`, cookie, backend, base de données). Chaque scénario est joué sur **ordinateur** et sur **mobile** (Pixel 7).

| Fichier               | Scénarios                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `auth.spec.ts`        | Page protégée sans session, champs vides, mauvais mot de passe, email déjà utilisé, inscription, déconnexion |
| `projects.spec.ts`    | Création d'un projet avec un contributeur, modification, suppression                                         |
| `tasks.spec.ts`       | Création d'une tâche (statut, assignée), modification, commentaire, suppression                              |
| `dashboard.spec.ts`   | Vues Liste, Kanban et Mes projets, recherche                                                                 |
| `permissions.spec.ts` | Administratrice, contributeur (sans bouton « Modifier »), personne extérieure (page introuvable)             |

**Lancer les tests** : démarrer le backend (port 8000) et le front (port 8001), puis :

```bash
npx playwright install chromium   # une seule fois : télécharge le navigateur de test
npm run test:e2e                  # tous les tests
npx playwright test --ui          # mode interactif : on voit le navigateur, étape par étape
npx playwright show-report        # rapport détaillé du dernier lancement
```

- **Données** : les comptes viennent du seed du backend. Chaque test crée ses propres projets avec un nom unique et les supprime à la fin, ce qui permet de lancer les tests en parallèle. Seul le test d'inscription laisse un compte `e2e-…@example.com`, car le backend ne permet pas de supprimer un utilisateur ; un nouveau seed le supprime.
- **Sélecteurs** : les éléments sont trouvés par leur rôle et leur libellé (`getByRole`, `getByLabel`), comme le ferait un lecteur d'écran. Un champ sans libellé ou un bouton sans nom fait donc échouer les tests.
- **Production** : la documentation Next.js recommande de tester le build de production (`npm run build` puis `npm run start`). Ne pas lancer le build pendant que le serveur de développement tourne : ils partagent le dossier `.next`.

## Fonctionnalités

| Page                         | Contenu                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Tableau de bord `/dashboard` | 3 vues : tâches assignées (les plus urgentes d'abord, avec recherche), Kanban des tâches du mois par statut, projets où l'on a des tâches |
| Mes projets `/projects`      | Projets dont on est propriétaire ou membre : progression et équipe ; création d'un projet avec ses contributeurs                          |
| Projet `/projects/:id`       | Contributeurs, tâches en liste ou calendrier, filtre par statut, recherche ; création, modification, suppression de tâches ; commentaires |
| Mon compte `/account`        | Modification du nom, de l'email et du mot de passe ; déconnexion                                                                          |

Droits appliqués dans l'interface (et vérifiés par le backend) : le propriétaire et les administrateurs d'un projet peuvent le modifier et gérer ses contributeurs ; seul le propriétaire peut le supprimer ; tous les membres gèrent les tâches.

### Génération de tâches par IA

Le bouton « IA » de la page projet ouvre une modale : l'utilisateur décrit son besoin, l'IA propose jusqu'à 6 tâches (titre, description, échéance), puis il coche celles à ajouter.

- **Fournisseur** : Gemini (`gemini-3.1-flash-lite` par défaut, modifiable avec `GEMINI_MODEL`), appelé avec `fetch` : aucune dépendance ajoutée. Clé gratuite sur [Google AI Studio](https://aistudio.google.com), à mettre dans `GEMINI_API_KEY`.
- **Sécurité** : la clé reste sur le serveur ; le navigateur n'appelle que la route `/api/projects/:id/tasks/generate`, qui vérifie aussi que l'utilisateur est membre du projet.
- **Fiabilité** : la réponse est demandée au format JSON (schéma imposé), puis revérifiée par la route (titres, longueur, dates valides et futures). Délai maximal de 30 secondes et messages clairs en cas de quota atteint ou de service surchargé.
- **Contrôle** : rien n'est enregistré sans validation de l'utilisateur ; les tâches retenues passent par la route de création habituelle, avec les mêmes validations.

### Choix d'implémentation

- **Tris faits côté client** (« les plus urgentes d'abord » : tâches non terminées, puis priorité, puis échéance) : le backend trie la priorité par ordre alphabétique.
- **Kanban et calendrier** : affichent par défaut le mois de l'échéance la plus proche d'aujourd'hui, avec navigation mois par mois.
- **Modales** : élément natif `<dialog>` (piège du focus, touche Échap, arrière-plan inerte gérés par le navigateur).
- **Accessibilité** : lien d'évitement, titres hiérarchisés, libellés et erreurs reliés aux champs, focus sur le premier champ en erreur, annonces `aria-live` (résultats de recherche, mois affiché), notifications annoncées.

## Structure du projet

Le routing utilise l'**App Router** de Next.js : chaque dossier de `src/app` est un segment d'URL. Les dossiers entre parenthèses sont des _route groups_ : ils partagent un layout sans apparaître dans l'URL.

```
src/
├── proxy.ts                  # Contrôle d'accès avant chaque requête (ex-middleware)
├── app/
│   ├── layout.tsx            # Layout racine : <html>, polices, métadonnées
│   ├── page.tsx              # « / » → redirige vers /dashboard
│   ├── not-found.tsx         # Page 404
│   ├── globals.css           # Tailwind + design tokens
│   ├── api/                  # Routes /api (route.ts) : logique métier, appels au backend
│   │   ├── auth/             # login, register, logout
│   │   ├── account/
│   │   ├── dashboard/
│   │   ├── projects/         # projets, puis [id]/tasks/[taskId]/comments
│   │   └── users/search/
│   ├── (auth)/               # Pages sans navigation
│   │   ├── layout.tsx
│   │   ├── login/            # /login
│   │   └── register/         # /register
│   └── (app)/                # Pages connectées : en-tête + pied de page
│       ├── layout.tsx
│       ├── error.tsx         # Erreur de chargement (backend injoignable…)
│       ├── dashboard/        # /dashboard
│       ├── projects/         # /projects
│       │   └── [id]/         # /projects/:id
│       └── account/          # /account
├── assets/images/            # Images importées par les composants
├── components/
│   ├── account/              # Formulaire « Mon compte »
│   ├── auth/                 # Écran et formulaires d'authentification
│   ├── dashboard/            # Vues du tableau de bord (liste, Kanban, projets)
│   ├── icons/                # Icônes SVG de la maquette
│   ├── layout/               # Header, navigation, footer, lien d'évitement
│   ├── projects/             # Carte projet, formulaire, contributeurs
│   ├── tasks/                # Tâches d'un projet, formulaire, commentaires, calendrier
│   └── ui/                   # Composants réutilisables (Button, Modal, Tag, MultiSelect…)
├── hooks/                    # Hooks React (chargement via /api, formulaires des modales, focus sur erreur)
├── lib/                      # Appels au backend et aux routes /api, session, validation, formatage, règles d'affichage
└── types/                    # Types partagés (réponses de l'API, formulaires)
```

## Design system

Les couleurs et la typographie de la maquette Figma sont déclarées comme tokens Tailwind dans [`src/app/globals.css`](src/app/globals.css) :

- **Couleurs** : `brand`, `brand-dark`, `brand-light`, `grey-50` à `grey-950`, `success`, `error`, `warning`, `info` (et leurs variantes `-light`). La palette par défaut de Tailwind est désactivée.
- **Typographie** : `text-h1` à `text-h5` (Manrope), `text-body-l` à `text-body-2xs` et `text-caption-l` à `text-caption-s` (Inter).

Exemple : `<h2 className="text-h2 text-grey-950">`.

## Dépendances

| Paquet                                  | Justification                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `next`, `react`, `react-dom`            | Framework imposé par les spécifications techniques                                                                 |
| `sonner`                                | Notifications (toasts) accessibles : région `aria-live`, empilement, fermeture automatique, sans configuration     |
| `typescript`, `@types/*`                | Typage statique, détection des erreurs avant l'exécution                                                           |
| `tailwindcss`, `@tailwindcss/turbopack` | Librairie CSS utilitaire ; tokens du design system centralisés dans le thème                                       |
| `eslint`, `eslint-config-next`          | Règles de qualité Next.js, React, accessibilité (jsx-a11y) et TypeScript                                           |
| `prettier`                              | Formatage automatique et uniforme du code                                                                          |
| `eslint-config-prettier`                | Désactive les règles ESLint qui entreraient en conflit avec Prettier                                               |
| `prettier-plugin-tailwindcss`           | Trie les classes Tailwind dans un ordre constant pour faciliter la relecture                                       |
| `@playwright/test`                      | Tests end-to-end des parcours principaux, sur ordinateur et mobile ; outil recommandé par la documentation Next.js |
