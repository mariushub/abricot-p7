"use client";

import { useId, useState } from "react";
import { toast } from "sonner";

import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { TaskListIcon } from "@/components/icons/TaskListIcon";
import { ProjectTaskItem } from "@/components/tasks/ProjectTaskItem";
import { TaskCalendar } from "@/components/tasks/TaskCalendar";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Modal } from "@/components/ui/Modal";
import { SearchField } from "@/components/ui/SearchField";
import { ViewSwitcher, type ViewOption } from "@/components/ui/ViewSwitcher";
import { notifyDataChanged, sendToApi } from "@/lib/api-client";
import { pluralize } from "@/lib/format";
import type { ProjectPerson } from "@/lib/projects";
import { compareTasksByUrgency, matchesTaskSearch, TASK_STATUS_LABELS } from "@/lib/tasks";
import type { Task, TaskStatus, User } from "@/types/api";

type View = "list" | "calendar";

const VIEW_OPTIONS: ViewOption<View>[] = [
  { value: "list", label: "Liste", Icon: TaskListIcon },
  { value: "calendar", label: "Calendrier", Icon: CalendarIcon },
];

const STATUS_FILTERS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];

type ProjectTasksProps = {
  projectId: string;
  tasks: Task[];
  people: ProjectPerson[];
  currentUser: User;
};

/**
 * Section « Tâches » d'un projet : filtre par statut, recherche, vues liste et
 * calendrier, modification et suppression des tâches.
 */
export function ProjectTasks({ projectId, tasks, people, currentUser }: ProjectTasksProps) {
  const [view, setView] = useState<View>("list");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const statusSelectId = useId();

  const visibleTasks = tasks
    .filter((task) => statusFilter === "ALL" || task.status === statusFilter)
    .filter((task) => matchesTaskSearch(task, query))
    .sort(compareTasksByUrgency);

  async function handleDelete(task: Task) {
    if (!window.confirm(`Supprimer la tâche « ${task.title} » et ses commentaires ?`)) return;
    const result = await sendToApi(`/api/projects/${projectId}/tasks/${task.id}`, "DELETE");
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.success);
    notifyDataChanged();
  }

  return (
    <section
      aria-labelledby="tasks-title"
      className="flex flex-col gap-10 rounded-[10px] border border-grey-200 bg-white px-4 py-8 md:px-14"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h2 id="tasks-title" className="text-h5 text-grey-800">
            Tâches
          </h2>
          <p className="text-body-m text-grey-600">Par ordre de priorité</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <ViewSwitcher
            label="Affichage des tâches"
            options={VIEW_OPTIONS}
            value={view}
            onChange={setView}
          />
          <div className="relative">
            <label htmlFor={statusSelectId} className="sr-only">
              Filtrer par statut
            </label>
            <select
              id={statusSelectId}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as TaskStatus | "ALL")}
              className="h-15.75 w-full appearance-none rounded-[10px] border border-grey-200 bg-white pr-12 pl-5 text-body-s text-grey-800 sm:w-38"
            >
              <option value="ALL">Statut</option>
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-5 w-4 -translate-y-1/2 text-grey-950" />
          </div>
          <SearchField
            label="Rechercher une tâche"
            value={query}
            onChange={setQuery}
            className="sm:w-71"
          />
        </div>
      </div>

      {/* Nombre de résultats annoncé quand les filtres changent. */}
      <p aria-live="polite" className="sr-only">
        {pluralize(visibleTasks.length, "tâche affichée", "tâches affichées")}
      </p>

      {tasks.length === 0 ? (
        <p className="text-body-m text-grey-600">
          Aucune tâche pour le moment. Créez la première avec le bouton « Créer une tâche ».
        </p>
      ) : visibleTasks.length === 0 ? (
        <p className="text-body-m text-grey-600">Aucune tâche ne correspond à votre recherche.</p>
      ) : view === "list" ? (
        <ul className="flex flex-col gap-4">
          {visibleTasks.map((task) => (
            <li key={task.id}>
              <ProjectTaskItem
                task={task}
                currentUser={currentUser}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDelete(task)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <TaskCalendar tasks={visibleTasks} onSelectTask={setEditingTask} />
      )}

      <Modal title="Modifier" isOpen={editingTask !== null} onClose={() => setEditingTask(null)}>
        {editingTask && (
          <TaskForm
            projectId={projectId}
            people={people}
            task={editingTask}
            onSuccess={() => setEditingTask(null)}
          />
        )}
      </Modal>
    </section>
  );
}
