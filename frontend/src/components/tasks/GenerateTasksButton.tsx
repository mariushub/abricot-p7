"use client";

import { useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { toast } from "sonner";

import { PencilIcon } from "@/components/icons/PencilIcon";
import { SparkleIcon } from "@/components/icons/SparkleIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { useFocusFirstInvalidField } from "@/hooks/useFocusFirstInvalidField";
import { notifyDataChanged, sendToApi } from "@/lib/api-client";
import { readText, validateRequiredText } from "@/lib/validation";
import type { GeneratedTask } from "@/types/api";
import type { FormState } from "@/types/forms";

/**
 * Bouton « IA » de la page projet et sa modale (maquettes « Modale création de
 * tâche IA » puis « Modale liste de tâche IA »).
 */
export function GenerateTasksButton({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);

  function open() {
    setTasks([]);
    setIsOpen(true);
  }

  return (
    <>
      <Button
        variant="brand"
        onClick={open}
        aria-haspopup="dialog"
        aria-label="IA : générer des tâches"
        className="gap-2.5! sm:px-6!"
      >
        <SparkleIcon className="size-5.25" />
        IA
      </Button>
      <Modal
        title={tasks.length > 0 ? "Vos tâches..." : "Créer une tâche"}
        icon={<SparkleIcon className="size-5.25 shrink-0 text-brand" />}
        size="wide"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <AiTasksPanel
          projectId={projectId}
          tasks={tasks}
          onTasksChange={setTasks}
          onDone={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}

type AiTasksPanelProps = {
  projectId: string;
  tasks: GeneratedTask[];
  onTasksChange: Dispatch<SetStateAction<GeneratedTask[]>>;
  onDone: () => void;
};

/**
 * L'utilisateur décrit son besoin, l'IA propose des tâches. Il peut en
 * supprimer, en modifier ou en demander d'autres, puis les ajoute au projet.
 */
function AiTasksPanel({ projectId, tasks, onTasksChange, onDone }: AiTasksPanelProps) {
  const [promptError, setPromptError] = useState<string>();
  const [error, setError] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsGenerating(true);
    setError(undefined);
    const result = (await sendToApi(
      `/api/projects/${projectId}/tasks/generate`,
      "POST",
      new FormData(form),
    )) as FormState & { tasks?: GeneratedTask[] };
    setIsGenerating(false);

    setPromptError(result.fieldErrors?.prompt);
    const generatedTasks = result.tasks;
    if (generatedTasks) {
      // Une nouvelle demande complète la liste, comme dans une conversation.
      onTasksChange((current) => [...current, ...generatedTasks]);
      form.reset();
    } else if (!result.fieldErrors) {
      setError(result.message);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setError(undefined);

    // Chaque tâche passe par la route de création habituelle (mêmes validations).
    let created = 0;
    for (const task of tasks) {
      const formData = new FormData();
      formData.set("title", task.title);
      formData.set("description", task.description);
      formData.set("dueDate", task.dueDate);
      const result = await sendToApi(`/api/projects/${projectId}/tasks`, "POST", formData);
      if (!result.success) {
        setError(`La tâche « ${task.title} » n'a pas pu être ajoutée : ${result.message ?? ""}`);
        break;
      }
      created += 1;
    }
    setIsSaving(false);

    if (created > 0) notifyDataChanged();
    if (created === tasks.length) {
      toast.success(created > 1 ? `${created} tâches ajoutées.` : "1 tâche ajoutée.");
      onDone();
    } else {
      // On retire celles déjà créées : un nouvel essai ne les dupliquera pas.
      onTasksChange((current) => current.slice(created));
    }
  }

  // Champ « Décrivez les tâches… » de la maquette : pastille grise et bouton rond orange.
  const promptForm = (
    <form onSubmit={handleGenerate} noValidate className="flex flex-col gap-2">
      <div className="flex h-15 items-center gap-2.5 rounded-full bg-grey-50 px-6 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-dark sm:px-8">
        <label htmlFor="ai-prompt" className="sr-only">
          Décrivez les tâches que vous souhaitez ajouter
        </label>
        <input
          id="ai-prompt"
          name="prompt"
          type="text"
          required
          maxLength={500}
          autoComplete="off"
          placeholder="Décrivez les tâches que vous souhaitez ajouter..."
          aria-invalid={promptError ? true : undefined}
          aria-describedby={promptError ? "ai-prompt-error" : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-body-m text-black placeholder:text-black focus-visible:outline-none sm:text-body-2xs"
        />
        <button
          type="submit"
          disabled={isGenerating}
          aria-label="Générer les tâches"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-dark text-white transition-colors hover:bg-brand-dark/90 disabled:bg-grey-400"
        >
          <SparkleIcon className="size-2" />
        </button>
      </div>
      {promptError && (
        <p id="ai-prompt-error" className="px-6 text-body-xs text-error-dark sm:px-8">
          {promptError}
        </p>
      )}
    </form>
  );

  const statusText = isGenerating ? "Génération des tâches en cours…" : "";

  // Maquette « Modale création de tâche IA » : zone vide, puis le champ en bas.
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col gap-14 sm:pb-5">
        <div className="flex h-[min(28.125rem,50vh)] flex-col items-center justify-center gap-4">
          <p aria-live="polite" className="text-center text-body-s text-grey-600">
            {statusText}
          </p>
          <FormError message={error} />
        </div>
        {promptForm}
      </div>
    );
  }

  // Maquette « Modale liste de tâche IA ».
  return (
    <div className="flex flex-col gap-6 sm:-mb-5">
      <ul className="flex flex-col gap-6">
        {tasks.map((task, index) => (
          <li key={index}>
            {editingIndex === index ? (
              <SuggestionEditor
                task={task}
                onSave={(updatedTask) => {
                  onTasksChange((current) =>
                    current.map((item, itemIndex) => (itemIndex === index ? updatedTask : item)),
                  );
                  setEditingIndex(null);
                }}
                onCancel={() => setEditingIndex(null)}
              />
            ) : (
              <article className="flex flex-col rounded-[10px] border border-grey-200 bg-white px-5 py-6.25 sm:px-10">
                <h3 className="text-h5 text-black">{task.title}</h3>
                <p className="mt-1.75 text-body-s text-grey-600">{task.description}</p>
                <div className="mt-8 flex items-center gap-3.75 text-body-xs text-grey-600">
                  <button
                    type="button"
                    onClick={() =>
                      onTasksChange((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    className="flex items-center gap-1 rounded-sm hover:text-grey-950"
                  >
                    <TrashIcon className="h-3.5 w-4 text-grey-400" />
                    Supprimer<span className="sr-only"> la tâche « {task.title} »</span>
                  </button>
                  <span aria-hidden className="h-2.75 w-px bg-grey-400" />
                  <button
                    type="button"
                    onClick={() => setEditingIndex(index)}
                    className="flex items-center gap-1 rounded-sm hover:text-grey-950"
                  >
                    <PencilIcon className="size-3.5 text-grey-600" />
                    Modifier<span className="sr-only"> la tâche « {task.title} »</span>
                  </button>
                </div>
              </article>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-6">
        <FormError message={error} />
        <p aria-live="polite" className="sr-only">
          {statusText}
        </p>
        <Button
          onClick={handleSave}
          disabled={isSaving || isGenerating || editingIndex !== null}
          className="self-center sm:px-3.75!"
        >
          {isSaving ? "Ajout en cours…" : "+ Ajouter les tâches"}
        </Button>
        {/* Trait sur toute la largeur de la modale, comme dans la maquette. */}
        <hr className="-mx-6 border-grey-200 sm:-mx-13" />
        {promptForm}
      </div>
    </div>
  );
}

type SuggestionEditorProps = {
  task: GeneratedTask;
  onSave: (task: GeneratedTask) => void;
  onCancel: () => void;
};

/** Modification d'une tâche proposée, avant son ajout au projet. */
function SuggestionEditor({ task, onSave, onCancel }: SuggestionEditorProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const formRef = useFocusFirstInvalidField(fieldErrors);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedTask = {
      title: readText(formData, "title"),
      description: readText(formData, "description"),
      dueDate: readText(formData, "dueDate"),
    };
    const errors = {
      title: validateRequiredText(updatedTask.title, { label: "le titre", min: 2, max: 200 }),
      description: validateRequiredText(updatedTask.description, {
        label: "la description",
        max: 1000,
      }),
      dueDate: updatedTask.dueDate ? undefined : "Veuillez choisir une date d'échéance.",
    };
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }
    onSave(updatedTask);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-[10px] border border-brand-dark px-5 py-6.25 sm:px-10"
    >
      <TextField
        label="Titre"
        name="title"
        id="ai-edit-title"
        defaultValue={task.title}
        error={fieldErrors.title}
        autoFocus
      />
      <TextField
        label="Description"
        name="description"
        id="ai-edit-description"
        defaultValue={task.description}
        error={fieldErrors.description}
      />
      <TextField
        label="Échéance"
        name="dueDate"
        id="ai-edit-due-date"
        type="date"
        defaultValue={task.dueDate}
        error={fieldErrors.dueDate}
      />
      <div className="flex flex-wrap gap-4">
        <Button type="submit">Valider</Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
