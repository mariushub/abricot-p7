"use client";

import { StatusPicker } from "@/components/tasks/StatusPicker";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { TextField } from "@/components/ui/TextField";
import { useModalForm } from "@/hooks/useModalForm";
import { toDateInputValue } from "@/lib/format";
import type { ProjectPerson } from "@/lib/projects";
import { getDisplayName } from "@/lib/user";
import type { Task } from "@/types/api";

type TaskFormProps = {
  projectId: string;
  /** Personnes du projet : seules elles peuvent être assignées. */
  people: ProjectPerson[];
  /** Tâche à modifier ; sans tâche, le formulaire en crée une. */
  task?: Task;
  onSuccess: () => void;
};

/** Formulaire des modales « Créer une tâche » et « Modifier ». */
export function TaskForm({ projectId, people, task, onSuccess }: TaskFormProps) {
  const tasksUrl = `/api/projects/${projectId}/tasks`;
  const { state, isPending, canSubmit, formProps } = useModalForm({
    url: task ? `${tasksUrl}/${task.id}` : tasksUrl,
    method: task ? "PUT" : "POST",
    onSuccess,
    initiallyComplete: Boolean(task),
  });

  const assigneeOptions = people.map(({ user }) => ({
    value: user.id,
    label: getDisplayName(user),
    hint: user.name ? user.email : undefined,
  }));
  // Un ancien membre peut rester assigné : on ne garde que les membres actuels,
  // sinon l'API refuserait la modification.
  const currentAssigneeIds = (task?.assignees ?? [])
    .map((assignee) => assignee.user.id)
    .filter((userId) => people.some((person) => person.user.id === userId));

  return (
    <form {...formProps} className="flex flex-col gap-6">
      <FormError message={state.message} />

      <TextField
        label="Titre"
        showRequiredMark
        name="title"
        required
        minLength={2}
        maxLength={200}
        defaultValue={task?.title}
        error={state.fieldErrors?.title}
      />
      <TextField
        label="Description"
        showRequiredMark
        name="description"
        required
        maxLength={1000}
        defaultValue={task?.description ?? ""}
        error={state.fieldErrors?.description}
      />
      <TextField
        label="Échéance"
        showRequiredMark
        name="dueDate"
        type="date"
        required
        defaultValue={toDateInputValue(task?.dueDate)}
        error={state.fieldErrors?.dueDate}
      />
      <MultiSelect
        label="Assigné à :"
        name="assigneeIds"
        options={assigneeOptions}
        defaultSelected={currentAssigneeIds}
        placeholder="Choisir un ou plusieurs collaborateurs"
        searchable={assigneeOptions.length > 6}
      />
      <StatusPicker defaultValue={task?.status === "CANCELLED" ? "TODO" : task?.status} />

      <Button type="submit" disabled={!canSubmit} className="mt-4 self-start">
        {isPending ? "Enregistrement…" : task ? "Enregistrer" : "+ Ajouter une tâche"}
      </Button>
    </form>
  );
}
