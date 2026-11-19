"use client";

import { ContributorPicker } from "@/components/projects/ContributorPicker";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { TextField } from "@/components/ui/TextField";
import { useModalForm } from "@/hooks/useModalForm";
import { getProjectPeople } from "@/lib/projects";
import type { ProjectDetail } from "@/types/api";

type ProjectFormProps = {
  /** Projet à modifier ; sans projet, le formulaire crée un nouveau projet. */
  project?: ProjectDetail;
  onSuccess: () => void;
};

/** Formulaire des modales « Créer un projet » et « Modifier un projet ». */
export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const { state, isPending, canSubmit, formProps } = useModalForm({
    url: project ? `/api/projects/${project.id}` : "/api/projects",
    method: project ? "PUT" : "POST",
    onSuccess,
    initiallyComplete: Boolean(project),
  });

  const contributors = project
    ? getProjectPeople(project)
        .filter((person) => !person.isOwner)
        .map((person) => person.user)
    : [];

  return (
    <form {...formProps} className="flex flex-col gap-6">
      <FormError message={state.message} />

      <TextField
        label="Titre"
        showRequiredMark
        name="name"
        required
        minLength={2}
        maxLength={100}
        defaultValue={project?.name}
        error={state.fieldErrors?.name}
      />
      <TextField
        label="Description"
        showRequiredMark
        name="description"
        required
        maxLength={500}
        defaultValue={project?.description ?? ""}
        error={state.fieldErrors?.description}
      />
      <ContributorPicker
        defaultSelected={contributors}
        excludedUserIds={project ? [project.ownerId] : []}
      />

      <Button type="submit" disabled={!canSubmit} className="mt-4 self-start">
        {isPending ? "Enregistrement…" : project ? "Enregistrer" : "Ajouter un projet"}
      </Button>
    </form>
  );
}
