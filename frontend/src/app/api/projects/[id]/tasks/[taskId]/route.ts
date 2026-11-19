import { readTaskForm } from "@/app/api/projects/[id]/tasks/task-form";
import { backendRequest } from "@/lib/backend";
import { hasErrors } from "@/lib/validation";

type Context = { params: Promise<{ id: string; taskId: string }> };

async function getTaskPath(params: Context["params"]) {
  const { id, taskId } = await params;
  return `/projects/${encodeURIComponent(id)}/tasks/${encodeURIComponent(taskId)}`;
}

/** PUT /api/projects/:id/tasks/:taskId : modification d'une tâche (titre, description, échéance, assignés, statut). */
export async function PUT(request: Request, { params }: Context) {
  const { fields, status, fieldErrors } = readTaskForm(await request.formData());
  if (hasErrors(fieldErrors)) return Response.json({ fieldErrors }, { status: 400 });

  const result = await backendRequest(await getTaskPath(params), {
    method: "PUT",
    body: { ...fields, status },
  });
  if (!result.ok) return Response.json({ message: result.message }, { status: result.status });
  return Response.json({ success: "La tâche a été modifiée." });
}

/** DELETE /api/projects/:id/tasks/:taskId : suppression d'une tâche et de ses commentaires. */
export async function DELETE(_request: Request, { params }: Context) {
  const result = await backendRequest(await getTaskPath(params), { method: "DELETE" });
  if (!result.ok) return Response.json({ message: result.message }, { status: result.status });
  return Response.json({ success: "La tâche a été supprimée." });
}
