import { EDITABLE_TASK_STATUSES } from "@/lib/tasks";
import { dateInputToIso, readList, readText, validateRequiredText } from "@/lib/validation";
import type { TaskStatus } from "@/types/api";

/** Lit et valide le formulaire d'une tâche (création et modification). */
export function readTaskForm(formData: FormData) {
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const dueDateInput = readText(formData, "dueDate");
  const dueDate = dateInputToIso(dueDateInput);
  const statusInput = readText(formData, "status") as TaskStatus;
  const status = EDITABLE_TASK_STATUSES.includes(statusInput) ? statusInput : "TODO";

  return {
    // Les cases proposées ne contiennent que les membres actuels ; readList retire les doublons.
    fields: { title, description, dueDate, assigneeIds: readList(formData, "assigneeIds") },
    status,
    fieldErrors: {
      title: validateRequiredText(title, { label: "le titre", min: 2, max: 200 }),
      description: validateRequiredText(description, { label: "la description", max: 1000 }),
      dueDate: !dueDateInput
        ? "Veuillez choisir une date d'échéance."
        : !dueDate
          ? "La date d'échéance est invalide."
          : undefined,
    },
  };
}
