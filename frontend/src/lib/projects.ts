import type { ProjectRole, ProjectSummary, TaskBase, User } from "@/types/api";

export type ProjectPerson = {
  user: User;
  isOwner: boolean;
  role: ProjectRole;
};

/**
 * Personnes d'un projet : le propriétaire d'abord, puis les membres.
 * Le backend ne liste pas le propriétaire dans `members`, mais il peut y
 * apparaître s'il a été ajouté par erreur : on supprime le doublon.
 */
export function getProjectPeople(
  project: Pick<ProjectSummary, "owner" | "members">,
): ProjectPerson[] {
  const members = project.members
    .filter((member) => member.userId !== project.owner.id)
    .map((member) => ({ user: member.user, isOwner: false, role: member.role }));
  return [{ user: project.owner, isOwner: true, role: "ADMIN" }, ...members];
}

/** Le propriétaire et les administrateurs peuvent modifier le projet et ses contributeurs. */
export function canManageProject(project: Pick<ProjectSummary, "userRole">): boolean {
  return project.userRole === "ADMIN";
}

/** Seul le propriétaire peut supprimer un projet. */
export function isProjectOwner(project: Pick<ProjectSummary, "ownerId">, userId: string): boolean {
  return project.ownerId === userId;
}

/** Progression d'un projet : part des tâches terminées. */
export function getProjectProgress(tasks: Pick<TaskBase, "status">[]) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "DONE").length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
