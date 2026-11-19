"use client";

import { useState } from "react";

import { ProjectForm } from "@/components/projects/ProjectForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

/** Bouton « + Créer un projet » et sa modale (tableau de bord et liste des projets). */
export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} aria-haspopup="dialog">
        + Créer un projet
      </Button>
      <Modal title="Créer un projet" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ProjectForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
