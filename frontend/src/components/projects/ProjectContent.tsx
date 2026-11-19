"use client";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { ContributorsBar } from "@/components/projects/ContributorsBar";
import { EditProjectButton } from "@/components/projects/EditProjectButton";
import { CreateTaskButton } from "@/components/tasks/CreateTaskButton";
import { GenerateTasksButton } from "@/components/tasks/GenerateTasksButton";
import { ProjectTasks } from "@/components/tasks/ProjectTasks";
import { useApi } from "@/hooks/useApi";
import { canManageProject, getProjectPeople, isProjectOwner } from "@/lib/projects";
import type { ProjectDetail, Task, User } from "@/types/api";

/** Page d'un projet : en-tête, contributeurs et tâches. */
export function ProjectContent({ projectId }: { projectId: string }) {
  const projectData = useApi<{ project: ProjectDetail; tasks: Task[] }>(
    `/api/projects/${projectId}`,
  );
  const account = useApi<{ user: User }>("/api/account");

  // Projet inexistant ou inaccessible : page 404.
  if (projectData.error?.status === 404) notFound();
  // Autre erreur : affichée par la page d'erreur (app/(app)/error.tsx).
  if (projectData.error) throw new Error(projectData.error.message);

  if (!projectData.data || !account.data) {
    return <p className="text-body-l text-grey-600">Chargement du projet…</p>;
  }

  const { project, tasks } = projectData.data;
  const currentUser = account.data.user;
  const people = getProjectPeople(project);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/projects"
            aria-label="Retour à mes projets"
            className="flex size-14.25 shrink-0 items-center justify-center rounded-[10px] border border-grey-200 bg-white text-grey-950 transition-colors hover:border-brand-dark"
          >
            <ArrowLeftIcon className="w-4" />
          </Link>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-h4 text-grey-800">{project.name}</h1>
              {canManageProject(project) && (
                <EditProjectButton
                  project={project}
                  canDelete={isProjectOwner(project, currentUser.id)}
                />
              )}
            </div>
            {project.description && (
              <p className="text-body-l text-grey-600">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <CreateTaskButton projectId={project.id} people={people} />
          <GenerateTasksButton projectId={project.id} />
        </div>
      </header>

      <ContributorsBar people={people} />

      <ProjectTasks
        projectId={project.id}
        tasks={tasks}
        people={people}
        currentUser={currentUser}
      />
    </div>
  );
}
