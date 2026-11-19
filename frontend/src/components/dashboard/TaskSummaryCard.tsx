import Link from "next/link";

import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { CommentIcon } from "@/components/icons/CommentIcon";
import { FolderSmallIcon } from "@/components/icons/FolderSmallIcon";
import { TaskStatusTag } from "@/components/tasks/TaskStatusTag";
import { formatDueDate } from "@/lib/format";
import type { AssignedTask } from "@/types/api";

type TaskSummaryCardProps = {
  task: AssignedTask;
  /** row : liste « Mes tâches » ; column : carte du Kanban. */
  layout: "row" | "column";
};

/** Tâche assignée, vue du tableau de bord (composant « Tâche liste / thumbnail »). */
export function TaskSummaryCard({ task, layout }: TaskSummaryCardProps) {
  const commentCount = task.comments.length;

  return (
    <article
      className={`flex gap-8 rounded-[10px] border border-grey-200 bg-white px-6 py-6 ${
        layout === "row"
          ? "flex-col sm:flex-row sm:items-center sm:justify-between md:px-10"
          : "flex-col"
      }`}
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.75">
            <h3 className="text-h5 text-black">{task.title}</h3>
            {task.description && <p className="text-body-s text-grey-600">{task.description}</p>}
          </div>
          {layout === "column" && <TaskStatusTag status={task.status} />}
        </div>

        <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body-xs text-grey-600">
          <li className="flex min-w-0 items-center gap-2">
            <FolderSmallIcon className="h-3.5 w-4.5 shrink-0 text-grey-400" />
            <span className="sr-only">Projet :</span>
            {/* Dans le Kanban (colonnes étroites), un nom long est tronqué visuellement. */}
            <span className={layout === "column" ? "max-w-32 truncate" : undefined}>
              {task.project.name}
            </span>
          </li>
          <li aria-hidden className="h-2.75 w-px bg-grey-400" />
          <li className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-3.5" />
            <span className="sr-only">Échéance :</span>
            {task.dueDate ? (
              <time dateTime={task.dueDate}>{formatDueDate(task.dueDate)}</time>
            ) : (
              "Sans échéance"
            )}
          </li>
          <li aria-hidden className="h-2.75 w-px bg-grey-400" />
          <li className="flex items-center gap-2">
            <CommentIcon className="size-3.75" />
            {commentCount}
            <span className="sr-only">commentaire{commentCount > 1 ? "s" : ""}</span>
          </li>
        </ul>
      </div>

      <div className={`flex shrink-0 gap-9 ${layout === "row" ? "items-end sm:flex-col" : ""}`}>
        {layout === "row" && <TaskStatusTag status={task.status} />}
        <Link
          href={`/projects/${task.project.id}`}
          className="inline-flex h-12.5 w-30.25 items-center justify-center rounded-[10px] bg-grey-800 text-body-m text-white transition-colors hover:bg-grey-950"
        >
          Voir<span className="sr-only"> la tâche « {task.title} » dans son projet</span>
        </Link>
      </div>
    </article>
  );
}
