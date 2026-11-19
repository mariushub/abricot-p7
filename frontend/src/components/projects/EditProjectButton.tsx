"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ProjectForm } from "@/components/projects/ProjectForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { sendToApi } from "@/lib/api-client";
import type { ProjectDetail } from "@/types/api";

type EditProjectButtonProps = {
  project: ProjectDetail;
  /** Seul le propriétaire peut supprimer le projet. */
  canDelete: boolean;
};

/** Lien « Modifier » à côté du nom du projet, qui ouvre la modale de modification. */
export function EditProjectButton({ project, canDelete }: EditProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const router = useRouter();

  function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer le projet « ${project.name} » ? Toutes ses tâches et leurs commentaires seront supprimés. Cette action est définitive.`,
    );
    if (!confirmed) return;

    startDeleting(async () => {
      const result = await sendToApi(`/api/projects/${project.id}`, "DELETE");
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      // Pas de rechargement de cette page (le projet n'existe plus) : on quitte la page.
      toast.success(result.success);
      router.push("/projects");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className="rounded-sm text-body-s text-brand-dark underline hover:no-underline"
      >
        Modifier<span className="sr-only"> le projet</span>
      </button>
      <Modal title="Modifier un projet" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ProjectForm project={project} onSuccess={() => setIsOpen(false)} />
        {canDelete && (
          <div className="border-t border-grey-200 pt-6">
            <Button variant="outline" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Suppression…" : "Supprimer le projet"}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
