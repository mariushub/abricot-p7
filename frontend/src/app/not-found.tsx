import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
};

/** Page affichée pour toute URL qui ne correspond à aucune route. */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-h2 text-grey-800">Page introuvable</h1>
      <p className="text-body-l text-grey-600">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/dashboard"
        className="rounded-[10px] bg-grey-950 px-6 py-3 text-body-m text-white transition-colors hover:bg-grey-800"
      >
        Retour au tableau de bord
      </Link>
    </main>
  );
}
