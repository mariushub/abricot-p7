"use client";

import { useId, useState } from "react";

import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { TaskActionsMenu } from "@/components/tasks/TaskActionsMenu";
import { TaskComments } from "@/components/tasks/TaskComments";
import { TaskStatusTag } from "@/components/tasks/TaskStatusTag";
import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Tag";
import { formatDueDate } from "@/lib/format";
import { getDisplayName, getUserInitials } from "@/lib/user";
import type { Task, User } from "@/types/api";

type ProjectTaskItemProps = {
  task: Task;
  currentUser: User;
  onEdit: () => void;
  onDelete: () => void;
};

/** Tâche dans la page d'un projet (composant « Tâche liste / projet »), avec ses commentaires. */
export function ProjectTaskItem({ task, currentUser, onEdit, onDelete }: ProjectTaskItemProps) {
  const [areCommentsOpen, setAreCommentsOpen] = useState(false);
  const commentsId = useId();

  return (
    <article className="flex flex-col gap-6 rounded-[10px] border border-grey-200 bg-white px-6 py-6 md:px-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-h5 text-black">{task.title}</h3>
            <TaskStatusTag status={task.status} />
          </div>
          {task.description && <p className="text-body-s text-grey-600">{task.description}</p>}
        </div>
        <TaskActionsMenu taskTitle={task.title} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <dl className="flex flex-col gap-4 text-body-xs">
        <div className="flex items-center gap-1">
          <dt className="text-grey-600">Échéance :</dt>
          <dd className="flex items-center gap-2 text-grey-800">
            <CalendarIcon className="h-4 w-3.5" />
            {task.dueDate ? (
              <time dateTime={task.dueDate}>{formatDueDate(task.dueDate)}</time>
            ) : (
              "Non définie"
            )}
          </dd>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <dt className="text-grey-600">Assigné à :</dt>
          <dd>
            {task.assignees.length === 0 ? (
              <span className="text-grey-800">Personne</span>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {task.assignees.map(({ user }) => (
                  <li key={user.id} className="flex items-center gap-1">
                    <Avatar
                      initials={getUserInitials(user)}
                      highlighted={user.id === currentUser.id}
                    />
                    <Tag color="grey">{getDisplayName(user)}</Tag>
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-6 border-t border-grey-200 pt-4">
        <button
          type="button"
          aria-expanded={areCommentsOpen}
          aria-controls={commentsId}
          onClick={() => setAreCommentsOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-sm text-body-s text-grey-800"
        >
          Commentaires ({task.comments.length})
          <ChevronDownIcon
            className={`w-4 transition-transform ${areCommentsOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div id={commentsId} hidden={!areCommentsOpen}>
          {areCommentsOpen && (
            <TaskComments
              projectId={task.projectId}
              taskId={task.id}
              comments={task.comments}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>
    </article>
  );
}
