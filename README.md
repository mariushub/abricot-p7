# Abricot – Gestion de projet collaboratif (OpenClassrooms P7)

Application SaaS de gestion de projet pour freelances : projets, tâches, commentaires et tableaux de bord.

| Dossier                  | Contenu                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| [`backend/`](backend)    | API REST fournie (Express, Prisma, SQLite) – port 8000                  |
| [`frontend/`](frontend)  | Interface développée pour le projet (Next.js 16, React 19, TypeScript, Tailwind CSS 4) – port 8001 |

Le document de spécifications fonctionnelles est à la racine (PDF).

## Démarrage rapide

**Récupérer le projet** (dépôt privé : connexion GitHub requise) :

```bash
gh repo clone mariushub/abricot-p7 P7
cd P7
```

**Backend** (voir [backend/README.md](backend/README.md)) :

```bash
cd backend
cp .env.example .env        # puis remplacer JWT_SECRET par une valeur aléatoire
npm install
npx prisma generate
npx prisma migrate deploy
npx ts-node -r dotenv/config scripts/seed.ts   # données de test
npm run dev                 # http://localhost:8000 (Swagger : /api-docs)
```

> `npm run seed` ne charge pas le fichier `.env` : utiliser la commande ci-dessus.

**Frontend** (voir [frontend/README.md](frontend/README.md)) :

```bash
cd frontend
cp .env.example .env        # URL du backend (API_URL)
npm install
npm run dev                 # http://localhost:8001
```

Comptes de test : `alice@example.com`, `bob@example.com`… mot de passe `P@ssword123`.
