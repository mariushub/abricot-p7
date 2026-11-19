"use client";

import { useEffect, useId, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { useModalForm } from "@/hooks/useModalForm";
import { formatCommentDate } from "@/lib/format";
import { getDisplayName, getUserInitials } from "@/lib/user";
import type { TaskComment, User } from "@/types/api";

type TaskCommentsProps = {
  projectId: string;
  taskId: string;
  comments: TaskComment[];
  currentUser: User;
};

/** Fil de commentaires d'une tâche (composant « Comment ») et ajout d'un commentaire. */
export function TaskComments({ projectId, taskId, comments, currentUser }: TaskCommentsProps) {
  const [content, setContent] = useState("");
  const textareaId = useId();
  const errorId = `${textareaId}-error`;

  const { state, isPending, formProps } = useModalForm({
    url: `/api/projects/${projectId}/tasks/${taskId}/comments`,
    method: "POST",
    onSuccess: () => setContent(""),
  });

  // Après publication, le focus revient dans le champ pour enchaîner un autre commentaire.
  useEffect(() => {
    if (state.success) formProps.ref.current?.querySelector("textarea")?.focus();
  }, [state, formProps.ref]);

  return (
    <div className="flex flex-col gap-4">
      {comments.length > 0 && (
        <ol className="flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3.5">
              <Avatar
                initials={getUserInitials(comment.author)}
                highlighted={comment.author.id === currentUser.id}
              />
              <article className="flex flex-1 flex-col gap-4.5 rounded-[10px] bg-grey-100 px-3.5 py-4.5">
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="font-sans text-body-s text-grey-950">
                    {getDisplayName(comment.author)}
                  </h4>
                  <time dateTime={comment.createdAt} className="text-body-2xs text-grey-600">
                    {formatCommentDate(comment.createdAt)}
                  </time>
                </header>
                <p className="text-body-xs whitespace-pre-line text-black">{comment.content}</p>
              </article>
            </li>
          ))}
        </ol>
      )}

      <form {...formProps} className="flex flex-col gap-4">
        <FormError message={state.message} />
        <div className="flex gap-3.5">
          <Avatar initials={getUserInitials(currentUser)} highlighted />
          <label htmlFor={textareaId} className="sr-only">
            Ajouter un commentaire
          </label>
          <textarea
            id={textareaId}
            name="content"
            required
            maxLength={2000}
            rows={3}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Ajouter un commentaire..."
            aria-invalid={state.fieldErrors?.content ? true : undefined}
            aria-describedby={state.fieldErrors?.content ? errorId : undefined}
            className="min-h-20.75 flex-1 resize-y rounded-[10px] bg-grey-50 px-3.5 py-4.5 text-body-m text-black placeholder:text-black sm:text-body-xs"
          />
        </div>
        {state.fieldErrors?.content && (
          <p id={errorId} className="text-body-xs text-error-dark">
            {state.fieldErrors.content}
          </p>
        )}
        <Button type="submit" disabled={!content.trim() || isPending} className="self-end">
          {isPending ? "Envoi…" : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
