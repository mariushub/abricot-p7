import { Logo } from "@/components/ui/Logo";

/** Pied de page des pages connectées. */
export function Footer() {
  return (
    <footer className="flex items-center justify-between gap-4 bg-white px-4 py-6 md:px-7.5">
      {/* Logo décoratif : le nom « Abricot » est déjà donné par le texte à côté. */}
      <Logo className="h-auto w-25.25 text-grey-950" />
      <p className="text-body-m text-black">Abricot 2025</p>
    </footer>
  );
}
