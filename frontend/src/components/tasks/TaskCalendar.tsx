"use client";

import { useState } from "react";

import { MonthNavigator } from "@/components/ui/MonthNavigator";
import { TASK_STATUS_LABELS } from "@/lib/tasks";
import { getCalendarDays, getDefaultMonth, isInMonth } from "@/lib/format";
import type { Task, TaskStatus } from "@/types/api";

const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const STATUS_DOT_CLASSES: Record<TaskStatus, string> = {
  TODO: "bg-error",
  IN_PROGRESS: "bg-warning",
  DONE: "bg-success",
  CANCELLED: "bg-grey-400",
};

const DAY_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

type TaskCalendarProps = {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
};

/**
 * Vue « Calendrier » des tâches d'un projet, placées sur leur jour d'échéance.
 * Grille mensuelle sur grand écran, liste des jours occupés sur mobile.
 */
export function TaskCalendar({ tasks, onSelectTask }: TaskCalendarProps) {
  const [month, setMonth] = useState(() => getDefaultMonth(tasks.map((task) => task.dueDate)));

  const tasksThisMonth = tasks.filter((task) => task.dueDate && isInMonth(task.dueDate, month));
  const tasksByDay = new Map<number, Task[]>();
  for (const task of tasksThisMonth) {
    const day = new Date(task.dueDate!).getUTCDate();
    tasksByDay.set(day, [...(tasksByDay.get(day) ?? []), task]);
  }
  const busyDays = getCalendarDays(month).filter(
    (day): day is Date => day !== null && tasksByDay.has(day.getUTCDate()),
  );

  function renderTask(task: Task) {
    return (
      <button
        type="button"
        onClick={() => onSelectTask(task)}
        className="flex w-full items-center gap-1.5 rounded-sm bg-grey-50 px-1.5 py-1 text-left text-body-xs text-grey-800 hover:bg-brand-light"
      >
        <span
          aria-hidden
          className={`size-2 shrink-0 rounded-full ${STATUS_DOT_CLASSES[task.status]}`}
        />
        <span className="truncate">{task.title}</span>
        <span className="sr-only">, {TASK_STATUS_LABELS[task.status]}. Modifier la tâche</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <MonthNavigator month={month} onChange={setMonth} />

      {tasksThisMonth.length === 0 && (
        <p className="text-body-s text-grey-600">
          Aucune tâche n&apos;arrive à échéance ce mois-ci.
        </p>
      )}

      {/* Grand écran : grille du mois */}
      <div className="hidden overflow-hidden rounded-[10px] border border-grey-200 md:block">
        <div className="grid grid-cols-7 bg-grey-50" aria-hidden>
          {WEEK_DAYS.map((weekDay) => (
            <p key={weekDay} className="px-2 py-2 text-center text-body-xs text-grey-600">
              {weekDay.slice(0, 3)}.
            </p>
          ))}
        </div>
        <ol className="grid grid-cols-7">
          {getCalendarDays(month).map((day, index) =>
            day === null ? (
              <li
                key={`blank-${index}`}
                aria-hidden
                className="min-h-24 border-t border-grey-200 bg-grey-50"
              />
            ) : (
              <li
                key={day.toISOString()}
                className="flex min-h-24 flex-col gap-1 border-t border-l border-grey-200 p-1.5 first:border-l-0"
              >
                <span className="text-body-xs text-grey-600">
                  <span aria-hidden>{day.getUTCDate()}</span>
                  <span className="sr-only">{DAY_FORMAT.format(day)}</span>
                </span>
                {tasksByDay.has(day.getUTCDate()) && (
                  <ul className="flex flex-col gap-1">
                    {tasksByDay.get(day.getUTCDate())!.map((task) => (
                      <li key={task.id}>{renderTask(task)}</li>
                    ))}
                  </ul>
                )}
              </li>
            ),
          )}
        </ol>
      </div>

      {/* Mobile : seulement les jours qui ont des tâches */}
      <ol className="flex flex-col gap-4 md:hidden">
        {busyDays.map((day) => (
          <li key={day.toISOString()} className="flex flex-col gap-2">
            <h3 className="font-sans text-body-s text-grey-800 first-letter:uppercase">
              {DAY_FORMAT.format(day)}
            </h3>
            <ul className="flex flex-col gap-1">
              {tasksByDay.get(day.getUTCDate())!.map((task) => (
                <li key={task.id}>{renderTask(task)}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
