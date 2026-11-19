import type { TagColor } from "@/components/ui/Tag";
import type { TaskPriority, TaskStatus } from "@/types/api";

/** Statuts proposés dans l'interface (la spécification : À faire, En cours, Terminée). */
export const EDITABLE_TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

/** Couleur du tag de statut, comme dans la maquette. */
export const TASK_STATUS_COLORS: Record<TaskStatus, TagColor> = {
  TODO: "red",
  IN_PROGRESS: "orange",
  DONE: "green",
  CANCELLED: "grey",
};

const PRIORITY_WEIGHT: Record<TaskPriority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const STATUS_WEIGHT: Record<TaskStatus, number> = {
  IN_PROGRESS: 0,
  TODO: 1,
  DONE: 2,
  CANCELLED: 3,
};

type SortableTask = { status: TaskStatus; priority: TaskPriority; dueDate: string | null };

/**
 * Tri « les plus urgentes d'abord » : les tâches non terminées passent avant,
 * puis la priorité la plus haute, puis l'échéance la plus proche
 * (une tâche sans échéance passe après celles qui en ont une).
 */
export function compareTasksByUrgency(a: SortableTask, b: SortableTask): number {
  const isClosed = (task: SortableTask) => task.status === "DONE" || task.status === "CANCELLED";
  if (isClosed(a) !== isClosed(b)) return isClosed(a) ? 1 : -1;
  if (a.priority !== b.priority) return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  if (a.dueDate !== b.dueDate) {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  }
  return STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
}

/** Recherche insensible à la casse dans le titre et la description d'une tâche. */
export function matchesTaskSearch(
  task: { title: string; description?: string | null },
  query: string,
): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return `${task.title} ${task.description ?? ""}`.toLowerCase().includes(normalizedQuery);
}
