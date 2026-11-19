import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Tag";
import { pluralize } from "@/lib/format";
import type { ProjectPerson } from "@/lib/projects";
import { getDisplayName, getUserInitials } from "@/lib/user";

/** Bandeau « Contributeurs » d'un projet : propriétaire puis membres. */
export function ContributorsBar({ people }: { people: ProjectPerson[] }) {
  return (
    <section
      aria-labelledby="contributors-title"
      className="flex flex-col gap-4 rounded-[10px] bg-grey-100 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-12"
    >
      <h2 id="contributors-title" className="flex items-baseline gap-2 text-h5 text-grey-800">
        Contributeurs
        <span className="font-sans text-body-m font-normal text-grey-600">
          {pluralize(people.length, "personne")}
        </span>
      </h2>
      <ul className="flex flex-wrap items-center gap-2">
        {people.map(({ user, isOwner }) => (
          <li key={user.id} className="flex items-center gap-1">
            <Avatar initials={getUserInitials(user)} highlighted={isOwner} />
            {isOwner ? (
              <>
                <Tag color="brand">Propriétaire</Tag>
                <span className="sr-only">: {getDisplayName(user)}</span>
              </>
            ) : (
              <Tag color="grey">{getDisplayName(user)}</Tag>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
