import Link from "next/link";

import { TeamIcon } from "@/components/icons/TeamIcon";
import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Tag";
import { getProjectPeople, getProjectProgress } from "@/lib/projects";
import { getDisplayName, getUserInitials } from "@/lib/user";
import type { ProjectDetail } from "@/types/api";

type ProjectCardProps = {
  project: ProjectDetail;
};

/** Carte d'un projet (composant « Card projet ») : progression et équipe. */
export function ProjectCard({ project }: ProjectCardProps) {
  const { done, total, percent } = getProjectProgress(project.tasks);
  const [owner, ...members] = getProjectPeople(project);

  return (
    <article className="relative flex flex-col gap-14 rounded-[10px] border border-grey-200 bg-white px-8.5 py-7.5 transition-shadow focus-within:shadow-md hover:shadow-md">
      <div className="flex flex-col gap-2">
        <h2 className="text-h5 text-grey-800">
          {/* Le lien couvre toute la carte (pseudo-élément), son nom accessible reste le titre. */}
          <Link
            href={`/projects/${project.id}`}
            className="after:absolute after:inset-0 after:rounded-[10px]"
          >
            {project.name}
          </Link>
        </h2>
        {project.description && (
          <p className="line-clamp-2 text-body-s text-grey-600">{project.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between text-body-xs">
          <span className="text-grey-600">Progression</span>
          <span className="text-grey-800">{percent}%</span>
        </div>
        <div className="flex flex-col gap-2">
          <div
            role="progressbar"
            aria-label={`Progression du projet ${project.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-1.75 overflow-hidden rounded-full bg-grey-200"
          >
            <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-body-2xs text-grey-600">
            {done}/{total} tâche{total > 1 ? "s" : ""} terminée{total > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3.75">
        <p className="flex items-center gap-2 text-body-2xs text-grey-600">
          <TeamIcon className="h-2.75 w-3" />
          Équipe ({members.length + 1})
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <Avatar initials={getUserInitials(owner.user)} highlighted />
          <Tag color="brand">Propriétaire</Tag>
          <span className="sr-only">: {getDisplayName(owner.user)}.</span>
          {members.length > 0 && (
            <ul className="ml-1 flex" aria-label="Membres">
              {members.map(({ user }) => (
                <li key={user.id} className="-ml-2 first:ml-0">
                  <Avatar initials={getUserInitials(user)} />
                  <span className="sr-only">{getDisplayName(user)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
