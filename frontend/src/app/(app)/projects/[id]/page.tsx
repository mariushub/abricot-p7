import type { Metadata } from "next";
import { Suspense } from "react";

import { ProjectContent } from "@/components/projects/ProjectContent";

export const metadata: Metadata = {
  title: "Projet",
};

/**
 * Page d'un projet. L'identifiant n'est connu qu'à la requête : avec Cache
 * Components, son accès est placé dans un Suspense.
 */
export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-body-l text-grey-600">Chargement du projet…</p>}>
      {params.then(({ id }) => (
        <ProjectContent projectId={id} />
      ))}
    </Suspense>
  );
}
