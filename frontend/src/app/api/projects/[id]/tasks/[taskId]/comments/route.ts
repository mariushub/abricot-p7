import { backendRequest } from "@/lib/backend";
import { readText, validateRequiredText } from "@/lib/validation";

/** POST /api/projects/:id/tasks/:taskId/comments : ajout d'un commentaire (1 à 2000 caractères). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const { id, taskId } = await params;
  const content = readText(await request.formData(), "content");

  const contentError = validateRequiredText(content, { label: "le commentaire", max: 2000 });
  if (contentError) {
    return Response.json({ fieldErrors: { content: contentError } }, { status: 400 });
  }

  const result = await backendRequest(
    `/projects/${encodeURIComponent(id)}/tasks/${encodeURIComponent(taskId)}/comments`,
    { method: "POST", body: { content } },
  );
  if (!result.ok) return Response.json({ message: result.message }, { status: result.status });
  return Response.json({ success: "Commentaire publié." }, { status: 201 });
}
