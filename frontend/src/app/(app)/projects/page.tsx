import type { Metadata } from "next";

import { ProjectsContent } from "@/components/projects/ProjectsContent";

export const metadata: Metadata = {
  title: "Mes projets",
};

export default function ProjectsPage() {
  return <ProjectsContent />;
}
