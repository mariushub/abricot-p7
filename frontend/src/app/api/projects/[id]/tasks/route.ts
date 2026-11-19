import { readTaskForm } from "@/app/api/projects/[id]/tasks/task-form";
import { backendRequest } from "@/lib/backend";
import { hasErrors } from "@/lib/validation";

/**
 * POST /api/projects/:id/tasks : création d'une tâche. Le backend crée toujours
 * la tâche « À faire » : si un autre statut est choisi, il est appliqué juste
 * après par une modification.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const tasksPath = `/projects/${encodeURIComponent((await params).id)}/tasks`;
  const { fields, status, fieldErrors } = readTaskForm(await request.formData());
  if (hasErrors(fieldErrors)) return Response.json({ fieldErrors }, { status: 400 });

  const result = await backendRequest<{ task: { id: string } }>(tasksPath, {
    method: "POST",
    body: fields,
  });
  if (!result.ok) return Response.json({ message: result.message }, { status: result.status });

  if (status !== "TODO") {
    const statusResult = await backendRequest(
      `${tasksPath}/${encodeURIComponent(result.data.task.id)}`,
      { method: "PUT", body: { status } },
    );
    if (!statusResult.ok) {
      return Response.json(
        {
          message: `La tâche a été créée, mais son statut n'a pas pu être modifié : ${statusResult.message}`,
        },
        { status: statusResult.status },
      );
    }
  }

  return Response.json({ success: `La tâche « ${fields.title} » a été créée.` }, { status: 201 });
}
