import { EDITABLE_TASK_STATUSES, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "@/lib/tasks";
import type { TaskStatus } from "@/types/api";

const CHIP_CLASSES = {
  red: "bg-error-light text-error has-checked:ring-error",
  orange: "bg-warning-light text-warning has-checked:ring-warning",
  green: "bg-success-light text-success has-checked:ring-success",
  grey: "bg-grey-200 text-grey-600 has-checked:ring-grey-600",
} as const;

type StatusPickerProps = {
  defaultValue?: TaskStatus;
};

/**
 * Choix du statut d'une tâche, présenté comme les tags de la maquette.
 * Ce sont de vrais boutons radio (masqués visuellement) : un seul choix,
 * navigation aux flèches du clavier, annonce correcte par les lecteurs d'écran.
 */
export function StatusPicker({ defaultValue = "TODO" }: StatusPickerProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-body-s text-black">Statut :</legend>
      <div className="flex flex-wrap gap-2">
        {EDITABLE_TASK_STATUSES.map((status) => {
          const color = TASK_STATUS_COLORS[status] as keyof typeof CHIP_CLASSES;
          return (
            <label
              key={status}
              className={`cursor-pointer rounded-full px-4 py-1 text-body-s ring-offset-1 has-checked:ring-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-dark ${CHIP_CLASSES[color]}`}
            >
              <input
                type="radio"
                name="status"
                value={status}
                defaultChecked={status === defaultValue}
                className="sr-only"
              />
              {TASK_STATUS_LABELS[status]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
