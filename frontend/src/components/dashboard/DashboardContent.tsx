"use client";

import { DashboardViews } from "@/components/dashboard/DashboardViews";
import { CreateProjectButton } from "@/components/projects/CreateProjectButton";
import { useApi } from "@/hooks/useApi";
import { getDisplayName } from "@/lib/user";
import type { AssignedTask, ProjectWithAssignedTasks, User } from "@/types/api";

type DashboardData = { tasks: AssignedTask[]; projects: ProjectWithAssignedTasks[] };

/** Tableau de bord : salutation, création de projet et les trois vues des tâches assignées. */
export function DashboardContent() {
  const account = useApi<{ user: User }>("/api/account");
  const dashboard = useApi<DashboardData>("/api/dashboard");

  // Affiché par la page d'erreur (app/(app)/error.tsx).
  if (dashboard.error) throw new Error(dashboard.error.message);

  const name = account.data ? getDisplayName(account.data.user) : null;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-h4 text-grey-800">Tableau de bord</h1>
          <p className="text-body-l text-black">
            Bonjour{name ? ` ${name}` : ""}, voici un aperçu de vos projets et tâches
          </p>
        </div>
        <CreateProjectButton />
      </header>

      {dashboard.data ? (
        <DashboardViews tasks={dashboard.data.tasks} projects={dashboard.data.projects} />
      ) : (
        <p className="text-body-l text-grey-600">Chargement de vos tâches…</p>
      )}
    </div>
  );
}
