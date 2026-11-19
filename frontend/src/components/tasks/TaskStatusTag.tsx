import { Tag } from "@/components/ui/Tag";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "@/lib/tasks";
import type { TaskStatus } from "@/types/api";

/** Tag coloré du statut d'une tâche : À faire (rouge), En cours (orange), Terminée (vert). */
export function TaskStatusTag({ status }: { status: TaskStatus }) {
  return (
    <Tag color={TASK_STATUS_COLORS[status]}>
      <span className="sr-only">Statut : </span>
      {TASK_STATUS_LABELS[status]}
    </Tag>
  );
}
