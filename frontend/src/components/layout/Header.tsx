import Link from "next/link";
import { Suspense } from "react";

import { AccountLink, AccountLinkView } from "@/components/layout/AccountLink";
import { MainNavigation, MainNavigationView } from "@/components/layout/MainNavigation";
import { Logo } from "@/components/ui/Logo";

/** En-tête des pages connectées : logo, navigation principale et accès au compte. */
export function Header() {
  return (
    <header className="bg-white shadow-[0_4px_12px_rgb(0_0_0/0.02)]">
      <div className="flex items-center justify-between gap-4 px-4 py-2 md:px-10 xl:px-25">
        <Link href="/dashboard" className="shrink-0 rounded-sm">
          <Logo
            label="Abricot, tableau de bord"
            className="h-auto w-24 text-brand-dark lg:w-36.75"
          />
        </Link>

        {/*
          La page active est lue dans l'URL. Sur les routes dynamiques
          (/projects/[id]), elle n'est connue qu'à la requête : Suspense permet
          de pré-rendre l'en-tête avec une navigation sans élément actif.
        */}
        <Suspense fallback={<MainNavigationView pathname={null} />}>
          <MainNavigation />
        </Suspense>

        {/* Même raison : la pastille lit l'URL pour savoir si « Mon compte » est la page active. */}
        <Suspense fallback={<AccountLinkView initials={null} isActive={false} />}>
          <AccountLink />
        </Suspense>
      </div>
    </header>
  );
}
