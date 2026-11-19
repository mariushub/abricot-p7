"use client";

import { useState } from "react";

import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ProjectPerson } from "@/lib/projects";

type CreateTaskButtonProps = {
  projectId: string;
  people: ProjectPerson[];
};

/** Bouton « Créer une tâche » de la page projet et sa modale. */
export function CreateTaskButton({ projectId, people }: CreateTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Largeur de la maquette (141 px) : marges intérieures réduites. */}
      <Button onClick={() => setIsOpen(true)} aria-haspopup="dialog" className="sm:px-2.5!">
        Créer une tâche
      </Button>
      <Modal title="Créer une tâche" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <TaskForm projectId={projectId} people={people} onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
