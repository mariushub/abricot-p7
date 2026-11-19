import Link from "next/link";

import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { TaskStatusTag } from "@/components/tasks/TaskStatusTag";
import { formatDueDate, pluralize } from "@/lib/format";
import { compareTasksByUrgency } from "@/lib/tasks";
import type { ProjectWithAssignedTasks } from "@/types/api";

/**
 * Vue « Mes projets » du tableau de bord : projets dans lesquels l'utilisateur
 * a des tâches assignées, le plus urgent d'abord (selon sa tâche la plus urgente).
 */
export function AssignedProjectsList({ projects }: { projects: ProjectWithAssignedTasks[] }) {
  const sortedProjects = projects
    .filter((project) => project.tasks.length > 0)
    .map((project) => ({ ...project, tasks: [...project.tasks].sort(compareTasksByUrgency) }))
    .sort((a, b) => compareTasksByUrgency(a.tasks[0], b.tasks[0]));

  if (sortedProjects.length === 0) {
    return (
      <p className="text-body-m text-grey-600">Aucune tâche ne vous est assignée pour le moment.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {sortedProjects.map((project) => {
        const mostUrgentTask = project.tasks[0];
        const openTasks = project.tasks.filter(
          (task) => task.status !== "DONE" && task.status !== "CANCELLED",
        );
        return (
          <li key={project.id}>
            <article className="flex flex-col gap-6 rounded-[10px] border border-grey-200 bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.75">
                  <h3 className="text-h5 text-black">{project.name}</h3>
                  {project.description && (
                    <p className="text-body-s text-grey-600">{project.description}</p>
                  )}
                </div>
                <p className="text-body-xs text-grey-600">
                  {pluralize(project.tasks.length, "tâche assignée", "tâches assignées")} ·{" "}
                  {pluralize(openTasks.length, "en cours ou à faire", "en cours ou à faire")}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-body-xs text-grey-800">
                  <span className="text-grey-600">Plus urgente :</span>
                  {mostUrgentTask.title}
                  <TaskStatusTag status={mostUrgentTask.status} />
                  {mostUrgentTask.dueDate && (
                    <span className="flex items-center gap-1 text-grey-600">
                      <CalendarIcon className="h-4 w-3.5" />
                      <time dateTime={mostUrgentTask.dueDate}>
                        {formatDueDate(mostUrgentTask.dueDate)}
                      </time>
                    </span>
                  )}
                </p>
              </div>
              <Link
                href={`/projects/${project.id}`}
                className="inline-flex h-12.5 w-30.25 shrink-0 items-center justify-center rounded-[10px] bg-grey-800 text-body-m text-white transition-colors hover:bg-grey-950"
              >
                Voir<span className="sr-only"> le projet {project.name}</span>
              </Link>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
