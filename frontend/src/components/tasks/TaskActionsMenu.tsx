"use client";

import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

import { MoreIcon } from "@/components/icons/MoreIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { IconButton } from "@/components/ui/IconButton";

type TaskActionsMenuProps = {
  taskTitle: string;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * Bouton « … » d'une tâche, qui déplie les actions Modifier / Supprimer.
 * Se ferme avec Échap (le focus revient sur le bouton) ou en quittant le menu.
 */
export function TaskActionsMenu({ taskTitle, onEdit, onDelete }: TaskActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  function close() {
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && isOpen) {
      close();
      toggleRef.current?.focus();
    }
  }

  // Ferme le menu quand le focus sort du composant (Tab, clic ailleurs).
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  }

  function runAction(action: () => void) {
    close();
    action();
  }

  return (
    <div className="relative" onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <IconButton
        ref={toggleRef}
        aria-label={`Actions pour la tâche ${taskTitle}`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <MoreIcon className="w-3.75" />
      </IconButton>
      {isOpen && (
        <ul
          id={menuId}
          className="absolute top-full right-0 z-10 mt-2 flex min-w-40 flex-col rounded-[10px] border border-grey-200 bg-white p-1 shadow-md"
        >
          <li>
            <button
              type="button"
              onClick={() => runAction(onEdit)}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-body-s text-grey-800 hover:bg-grey-50"
            >
              <PencilIcon className="size-3.5 text-grey-600" />
              Modifier
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => runAction(onDelete)}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-body-s text-error-dark hover:bg-error-light"
            >
              <TrashIcon className="h-3.5 w-4" />
              Supprimer
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
