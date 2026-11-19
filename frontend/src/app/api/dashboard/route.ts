import { backendRequest } from "@/lib/backend";
import type { AssignedTask, ProjectWithAssignedTasks } from "@/types/api";

/**
 * GET /api/dashboard : données du tableau de bord.
 * - tasks : tâches assignées à l'utilisateur, tous projets confondus ;
 * - projects : projets où il a des tâches assignées (avec ces tâches uniquement).
 */
export async function GET() {
  const [tasksResult, projectsResult] = await Promise.all([
    backendRequest<{ tasks: AssignedTask[] }>("/dashboard/assigned-tasks"),
    backendRequest<{ projects: ProjectWithAssignedTasks[] }>("/dashboard/projects-with-tasks"),
  ]);
  if (!tasksResult.ok) {
    return Response.json({ message: tasksResult.message }, { status: tasksResult.status });
  }
  if (!projectsResult.ok) {
    return Response.json({ message: projectsResult.message }, { status: projectsResult.status });
  }

  return Response.json({ tasks: tasksResult.data.tasks, projects: projectsResult.data.projects });
}
