import { readProjectForm } from "@/app/api/projects/project-form";
import { backendRequest } from "@/lib/backend";
import { hasErrors } from "@/lib/validation";
import type { ProjectDetail, ProjectSummary } from "@/types/api";

/**
 * GET /api/projects : projets de l'utilisateur (propriétaire ou membre) avec
 * leurs tâches, pour calculer la progression : la liste du backend ne donne que
 * le nombre de tâches, on charge donc le détail de chaque projet.
 */
export async function GET() {
  const listResult = await backendRequest<{ projects: ProjectSummary[] }>("/projects");
  if (!listResult.ok) {
    return Response.json({ message: listResult.message }, { status: listResult.status });
  }

  const detailResults = await Promise.all(
    listResult.data.projects.map((project) =>
      backendRequest<{ project: ProjectDetail }>(`/projects/${encodeURIComponent(project.id)}`),
    ),
  );
  // Un projet supprimé (ou dont l'utilisateur a été retiré) entre les deux appels
  // répond 403 ou 404 : il est simplement absent de la liste. Toute autre erreur est renvoyée.
  const failure = detailResults.find(
    (result) => !result.ok && result.status !== 403 && result.status !== 404,
  );
  if (failure && !failure.ok) {
    return Response.json({ message: failure.message }, { status: failure.status });
  }

  return Response.json({
    projects: detailResults.flatMap((result) => (result.ok ? [result.data.project] : [])),
  });
}

/** POST /api/projects : création d'un projet. L'utilisateur en devient propriétaire. */
export async function POST(request: Request) {
  const { name, description, contributorEmails, fieldErrors } = readProjectForm(
    await request.formData(),
  );
  if (hasErrors(fieldErrors)) return Response.json({ fieldErrors }, { status: 400 });

  // Les contributeurs sont ajoutés par email.
  const result = await backendRequest("/projects", {
    method: "POST",
    body: { name, description, contributors: contributorEmails },
  });
  if (!result.ok) {
    return Response.json(
      { message: result.message, fieldErrors: { name: result.fieldErrors.name } },
      { status: result.status },
    );
  }

  return Response.json({ success: `Le projet « ${name} » a été créé.` }, { status: 201 });
}
