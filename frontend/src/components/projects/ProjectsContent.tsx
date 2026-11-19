"use client";

import { CreateProjectButton } from "@/components/projects/CreateProjectButton";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useApi } from "@/hooks/useApi";
import type { ProjectDetail } from "@/types/api";

/** Page « Mes projets » : cartes des projets de l'utilisateur et création d'un projet. */
export function ProjectsContent() {
  const { data, error } = useApi<{ projects: ProjectDetail[] }>("/api/projects");

  // Affiché par la page d'erreur (app/(app)/error.tsx).
  if (error) throw new Error(error.message);

  return (
    <div className="mx-auto flex w-full max-w-291.5 flex-col gap-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-h4 text-grey-800">Mes projets</h1>
          <p className="text-body-l text-black">Gérez vos projets</p>
        </div>
        <CreateProjectButton />
      </header>

      {!data ? (
        <p className="text-body-l text-grey-600">Chargement des projets…</p>
      ) : data.projects.length === 0 ? (
        <p className="text-body-l text-grey-600">
          Vous ne participez à aucun projet pour le moment. Créez-en un avec le bouton « Créer un
          projet ».
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.projects.map((project) => (
            <li key={project.id} className="grid">
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
