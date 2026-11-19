import { readProjectForm } from "@/app/api/projects/project-form";
import { backendRequest } from "@/lib/backend";
import { hasErrors } from "@/lib/validation";
import type { ProjectDetail, Task } from "@/types/api";

type Context = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/:id : projet, ses membres et ses tâches (avec assignés et
 * commentaires). Un projet inexistant ou auquel l'utilisateur n'a pas accès
 * (le backend répond 403 dans les deux cas) renvoie 404.
 */
export async function GET(_request: Request, { params }: Context) {
  const projectPath = `/projects/${encodeURIComponent((await params).id)}`;
  const [projectResult, tasksResult] = await Promise.all([
    backendRequest<{ project: ProjectDetail }>(projectPath),
    backendRequest<{ tasks: Task[] }>(`${projectPath}/tasks`),
  ]);

  if (!projectResult.ok) {
    if (projectResult.status === 403 || projectResult.status === 404) {
      return Response.json({ message: "Projet introuvable." }, { status: 404 });
    }
    return Response.json({ message: projectResult.message }, { status: projectResult.status });
  }
  if (!tasksResult.ok) {
    return Response.json({ message: tasksResult.message }, { status: tasksResult.status });
  }

  return Response.json({ project: projectResult.data.project, tasks: tasksResult.data.tasks });
}

/**
 * PUT /api/projects/:id : modification d'un projet (propriétaire ou administrateur) :
 * nom, description, puis synchronisation des contributeurs. Le backend ajoute un
 * contributeur par email et le retire par identifiant : on compare donc la
 * sélection aux membres actuels.
 */
export async function PUT(request: Request, { params }: Context) {
  const projectPath = `/projects/${encodeURIComponent((await params).id)}`;
  const { name, description, contributorEmails, fieldErrors } = readProjectForm(
    await request.formData(),
  );
  if (hasErrors(fieldErrors)) return Response.json({ fieldErrors }, { status: 400 });

  const updateResult = await backendRequest(projectPath, {
    method: "PUT",
    body: { name, description },
  });
  if (!updateResult.ok) {
    return Response.json({ message: updateResult.message }, { status: updateResult.status });
  }

  const projectResult = await backendRequest<{ project: ProjectDetail }>(projectPath);
  if (!projectResult.ok) {
    return Response.json({ message: projectResult.message }, { status: projectResult.status });
  }
  const { owner, members } = projectResult.data.project;

  const selectedEmails = contributorEmails.map((email) => email.toLowerCase());
  const currentEmails = new Set(members.map((member) => member.user.email.toLowerCase()));
  const emailsToAdd = selectedEmails.filter(
    (email) => !currentEmails.has(email) && email !== owner.email.toLowerCase(),
  );
  const membersToRemove = members.filter(
    (member) => !selectedEmails.includes(member.user.email.toLowerCase()),
  );

  const contributorResults = await Promise.all([
    ...emailsToAdd.map((email) =>
      backendRequest(`${projectPath}/contributors`, { method: "POST", body: { email } }),
    ),
    ...membersToRemove.map((member) =>
      backendRequest(`${projectPath}/contributors/${encodeURIComponent(member.userId)}`, {
        method: "DELETE",
      }),
    ),
  ]);

  const failure = contributorResults.find((result) => !result.ok);
  if (failure && !failure.ok) {
    return Response.json(
      {
        message: `Projet enregistré, mais la liste des contributeurs n'a pas pu être mise à jour : ${failure.message}`,
      },
      { status: failure.status },
    );
  }
  return Response.json({ success: "Le projet a été modifié." });
}

/** DELETE /api/projects/:id : suppression d'un projet et de toutes ses tâches (propriétaire uniquement). */
export async function DELETE(_request: Request, { params }: Context) {
  const result = await backendRequest(`/projects/${encodeURIComponent((await params).id)}`, {
    method: "DELETE",
  });
  if (!result.ok) return Response.json({ message: result.message }, { status: result.status });
  return Response.json({ success: "Le projet a été supprimé." });
}
