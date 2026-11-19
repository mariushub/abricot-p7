"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import { DashboardIcon } from "@/components/icons/DashboardIcon";
import { FolderIcon } from "@/components/icons/FolderIcon";

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  iconClassName: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    Icon: DashboardIcon,
    iconClassName: "size-6",
  },
  {
    href: "/projects",
    label: "Projets",
    Icon: FolderIcon,
    iconClassName: "h-5.75 w-7.25",
  },
];

/**
 * Une section est active sur sa page et sur ses sous-pages :
 * « Projets » reste actif sur /projects/123.
 */
function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navigation principale, avec mise en évidence de la page courante (lue dans l'URL). */
export function MainNavigation() {
  const pathname = usePathname();
  return <MainNavigationView pathname={pathname} />;
}

/**
 * Rendu de la navigation, sans dépendance à l'URL. Utilisé tel quel comme
 * rendu de secours (Suspense) tant que la page courante n'est pas connue.
 */
export function MainNavigationView({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Navigation principale">
      <ul className="flex items-center gap-2 lg:gap-4">
        {NAV_ITEMS.map(({ href, label, Icon, iconClassName }) => {
          const isActive = isActivePath(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex size-12 items-center justify-center gap-4 rounded-[10px] text-body-m transition-colors sm:h-14 sm:w-auto sm:px-5 lg:h-19.5 lg:w-62 lg:px-0 ${
                  isActive
                    ? "bg-grey-950 text-white"
                    : "bg-white text-brand-dark hover:bg-grey-950 hover:text-white"
                }`}
              >
                <Icon className={`shrink-0 ${iconClassName}`} />
                {/* Sur mobile, seule l'icône est visible : le libellé reste lu par les lecteurs d'écran. */}
                <span className="sr-only sm:not-sr-only">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
