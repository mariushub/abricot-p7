"use client";

import { useState } from "react";

import { AssignedProjectsList } from "@/components/dashboard/AssignedProjectsList";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { TaskSummaryCard } from "@/components/dashboard/TaskSummaryCard";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { FolderSmallIcon } from "@/components/icons/FolderSmallIcon";
import { TaskListIcon } from "@/components/icons/TaskListIcon";
import { SearchField } from "@/components/ui/SearchField";
import { ViewSwitcher, type ViewOption } from "@/components/ui/ViewSwitcher";
import { pluralize } from "@/lib/format";
import { compareTasksByUrgency, matchesTaskSearch } from "@/lib/tasks";
import type { AssignedTask, ProjectWithAssignedTasks } from "@/types/api";

type View = "tasks" | "kanban" | "projects";

const VIEW_OPTIONS: ViewOption<View>[] = [
  { value: "tasks", label: "Liste", Icon: TaskListIcon },
  { value: "kanban", label: "Kanban", Icon: CalendarIcon },
  { value: "projects", label: "Mes projets", Icon: FolderSmallIcon },
];

type DashboardViewsProps = {
  tasks: AssignedTask[];
  projects: ProjectWithAssignedTasks[];
};

/** Les trois vues du tableau de bord : tâches assignées, Kanban du mois, projets concernés. */
export function DashboardViews({ tasks, projects }: DashboardViewsProps) {
  const [view, setView] = useState<View>("tasks");
  const [query, setQuery] = useState("");

  const visibleTasks = tasks
    .filter((task) => matchesTaskSearch(task, query))
    .sort(compareTasksByUrgency);

  return (
    <div className="flex flex-col gap-10">
      <ViewSwitcher
        label="Affichage du tableau de bord"
        options={VIEW_OPTIONS}
        value={view}
        onChange={setView}
      />

      {view === "tasks" && (
        <section
          aria-labelledby="assigned-tasks-title"
          className="flex flex-col gap-10 rounded-[10px] border border-grey-200 bg-white px-4 py-8 md:px-14"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <h2 id="assigned-tasks-title" className="text-h5 text-grey-800">
                Mes tâches assignées
              </h2>
              <p className="text-body-m text-grey-600">Par ordre de priorité</p>
            </div>
            <SearchField
              label="Rechercher une tâche"
              value={query}
              onChange={setQuery}
              className="sm:w-89.25"
            />
          </div>
          <p aria-live="polite" className="sr-only">
            {pluralize(visibleTasks.length, "tâche affichée", "tâches affichées")}
          </p>
          {visibleTasks.length === 0 ? (
            <p className="text-body-m text-grey-600">
              {tasks.length === 0
                ? "Aucune tâche ne vous est assignée pour le moment."
                : "Aucune tâche ne correspond à votre recherche."}
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {visibleTasks.map((task) => (
                <li key={task.id}>
                  <TaskSummaryCard task={task} layout="row" />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {view === "kanban" && (
        <section aria-label="Kanban des tâches du mois">
          <KanbanBoard tasks={tasks} />
        </section>
      )}

      {view === "projects" && (
        <section aria-label="Projets avec des tâches assignées">
          <AssignedProjectsList projects={projects} />
        </section>
      )}
    </div>
  );
}
