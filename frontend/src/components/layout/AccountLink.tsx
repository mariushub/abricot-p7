"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useApi } from "@/hooks/useApi";
import { getUserInitials } from "@/lib/user";
import type { User } from "@/types/api";

/** Pastille « Mon compte » de l'en-tête, avec les initiales de l'utilisateur connecté. */
export function AccountLink() {
  const pathname = usePathname();
  const { data } = useApi<{ user: User }>("/api/account");

  return (
    <AccountLinkView
      initials={data ? getUserInitials(data.user) : null}
      isActive={pathname === "/account"}
    />
  );
}

type AccountLinkViewProps = {
  /** Initiales de l'utilisateur, ou null tant qu'il n'est pas chargé. */
  initials: string | null;
  /** Vrai sur la page « Mon compte ». */
  isActive: boolean;
};

/** Rendu de la pastille, utilisé aussi comme rendu de secours (Suspense). */
export function AccountLinkView({ initials, isActive }: AccountLinkViewProps) {
  return (
    <Link
      href="/account"
      aria-label="Mon compte"
      aria-current={isActive ? "page" : undefined}
      className={`flex size-12 shrink-0 items-center justify-center rounded-full text-body-s transition-colors lg:size-16.25 ${
        isActive
          ? "bg-brand-dark text-white"
          : "bg-brand-light text-grey-950 hover:bg-brand-dark hover:text-white"
      }`}
    >
      <span aria-hidden>{initials}</span>
    </Link>
  );
}
