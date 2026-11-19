/*
 * Types des réponses du backend (vérifiés sur le code et des réponses réelles).
 * Les dates sont des chaînes ISO. Les champs facultatifs valent null.
 */

/** Enveloppe commune à toutes les réponses du backend. */
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export type ProjectRole = "ADMIN" | "CONTRIBUTOR";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/** Utilisateur (le nom est facultatif). */
export type User = {
  id: string;
  email: string;
  name: string | null;
};

/** Membre d'un projet. Le propriétaire n'en fait pas partie : il est dans `owner`. */
export type ProjectMember = {
  id: string;
  role: ProjectRole;
  userId: string;
  user: User;
};

type ProjectBase = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: User;
};

export type TaskBase = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  projectId: string;
};

/** Projet de la liste « Mes projets » (GET /projects). Le propriétaire a le rôle ADMIN. */
export type ProjectSummary = ProjectBase & {
  members: ProjectMember[];
  userRole: ProjectRole;
  _count: { tasks: number };
};

/** Projet détaillé (GET /projects/:id) : tâches sans assignés ni commentaires. */
export type ProjectDetail = ProjectSummary & {
  tasks: TaskBase[];
};

/** Tâche proposée par l'IA (POST /api/projects/:id/tasks/generate), pas encore enregistrée. */
export type GeneratedTask = {
  title: string;
  description: string;
  /** Format AAAA-MM-JJ, comme un champ <input type="date">. */
  dueDate: string;
};

export type TaskAssignee = {
  id: string;
  user: User;
};

export type TaskComment = {
  id: string;
  content: string;
  createdAt: string;
  author: User;
};

/** Tâche complète d'un projet (GET /projects/:id/tasks). Commentaires du plus ancien au plus récent. */
export type Task = TaskBase & {
  creator: User;
  project: { id: string; name: string };
  assignees: TaskAssignee[];
  comments: TaskComment[];
};

/** Tâche assignée à l'utilisateur (GET /dashboard/assigned-tasks). */
export type AssignedTask = TaskBase & {
  project: { id: string; name: string; description: string | null };
  assignees: TaskAssignee[];
  comments: TaskComment[];
};

/** Projet où l'utilisateur a des tâches, avec uniquement ses tâches (GET /dashboard/projects-with-tasks). */
export type ProjectWithAssignedTasks = ProjectBase & {
  tasks: (TaskBase & { assignees: TaskAssignee[]; comments: TaskComment[] })[];
};
