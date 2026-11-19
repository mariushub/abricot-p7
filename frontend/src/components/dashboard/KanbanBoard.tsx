"use client";

import { useState } from "react";

import { TaskSummaryCard } from "@/components/dashboard/TaskSummaryCard";
import { MonthNavigator } from "@/components/ui/MonthNavigator";
import { getDefaultMonth, isInMonth } from "@/lib/format";
import { compareTasksByUrgency } from "@/lib/tasks";
import type { AssignedTask, TaskStatus } from "@/types/api";

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: "TODO", title: "À faire" },
  { status: "IN_PROGRESS", title: "En cours" },
  { status: "DONE", title: "Terminées" },
];

/**
 * Vue Kanban du tableau de bord : tâches assignées dont l'échéance tombe dans
 * le mois choisi, rangées par statut.
 */
export function KanbanBoard({ tasks }: { tasks: AssignedTask[] }) {
  const [month, setMonth] = useState(() => getDefaultMonth(tasks.map((task) => task.dueDate)));
  const tasksOfMonth = tasks.filter((task) => task.dueDate && isInMonth(task.dueDate, month));

  return (
    <div className="flex flex-col gap-6">
      <MonthNavigator month={month} onChange={setMonth} />
      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map(({ status, title }) => {
          const columnTasks = tasksOfMonth
            .filter((task) => task.status === status)
            .sort(compareTasksByUrgency);
          const titleId = `kanban-${status}`;
          return (
            <section
              key={status}
              aria-labelledby={titleId}
              className="flex flex-col gap-6 rounded-[10px] border border-grey-200 bg-white px-4 py-7"
            >
              <h3 id={titleId} className="flex items-center gap-2 font-sans text-body-l text-black">
                {title}
                <span className="rounded-full bg-grey-200 px-3 text-body-s text-grey-600">
                  {columnTasks.length}
                  <span className="sr-only"> tâche{columnTasks.length > 1 ? "s" : ""}</span>
                </span>
              </h3>
              {columnTasks.length === 0 ? (
                <p className="text-body-s text-grey-600">Aucune tâche.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {columnTasks.map((task) => (
                    <li key={task.id}>
                      <TaskSummaryCard task={task} layout="column" />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
