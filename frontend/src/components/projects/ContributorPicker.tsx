"use client";

import { useId, useRef, useState, useTransition } from "react";

import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { pluralize } from "@/lib/format";
import { getDisplayName } from "@/lib/user";
import type { User } from "@/types/api";

type ContributorPickerProps = {
  /** Contributeurs déjà présents (modification d'un projet). */
  defaultSelected?: User[];
  /** Utilisateurs à ne pas proposer (le propriétaire du projet). */
  excludedUserIds?: string[];
};

const SEARCH_DELAY_MS = 250;

/** Recherche d'utilisateurs via GET /api/users/search (liste vide en cas d'erreur). */
async function searchUsers(query: string): Promise<User[]> {
  try {
    const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const { users } = await response.json();
    return users;
  } catch {
    return [];
  }
}

/**
 * Choix des contributeurs d'un projet (composant « Combo box »). La liste des
 * utilisateurs vient de la recherche du backend (2 caractères minimum).
 * Les emails choisis sont envoyés dans des champs cachés « contributors ».
 */
export function ContributorPicker({
  defaultSelected = [],
  excludedUserIds = [],
}: ContributorPickerProps) {
  const [selected, setSelected] = useState<User[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, startSearch] = useTransition();
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestQuery = useRef("");
  const baseId = useId();

  function handleQueryChange(value: string) {
    setQuery(value);
    latestQuery.current = value;
    clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    // On attend une courte pause dans la frappe avant d'interroger le backend.
    searchTimeout.current = setTimeout(() => {
      startSearch(async () => {
        const users = await searchUsers(value);
        // Ignore une réponse arrivée après une saisie plus récente.
        if (latestQuery.current !== value) return;
        setResults(users.filter((user) => !excludedUserIds.includes(user.id)));
      });
    }, SEARCH_DELAY_MS);
  }

  function toggleUser(user: User) {
    setSelected((current) =>
      current.some((item) => item.id === user.id)
        ? current.filter((item) => item.id !== user.id)
        : [...current, user],
    );
  }

  const searchStatus =
    query.trim().length < 2
      ? "Saisissez au moins 2 caractères du nom ou de l'email."
      : isSearching
        ? "Recherche…"
        : results.length === 0
          ? "Aucun utilisateur trouvé."
          : pluralize(results.length, "résultat");

  return (
    <div className="flex flex-col gap-1.75">
      <span id={`${baseId}-label`} className="text-body-s text-black">
        Contributeurs
      </span>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`${baseId}-panel`}
        aria-labelledby={`${baseId}-label ${baseId}-summary`}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-13.25 w-full items-center justify-between gap-4 rounded-sm border border-grey-200 bg-white px-4.25 text-left text-body-m text-grey-600 sm:text-body-xs"
      >
        <span id={`${baseId}-summary`}>
          {selected.length === 0
            ? "Choisir un ou plusieurs collaborateurs"
            : pluralize(selected.length, "collaborateur")}
        </span>
        <ChevronDownIcon
          className={`w-4 shrink-0 text-grey-950 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Emails envoyés au serveur, même quand le panneau est fermé. */}
      {selected.map((user) => (
        <input key={user.id} type="hidden" name="contributors" value={user.email} />
      ))}

      <div
        id={`${baseId}-panel`}
        hidden={!isOpen}
        className="flex flex-col gap-3 rounded-sm border border-grey-200 bg-white p-3"
      >
        {selected.length > 0 && (
          <ul aria-label="Contributeurs sélectionnés" className="flex flex-wrap gap-2">
            {selected.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => toggleUser(user)}
                  aria-label={`Retirer ${getDisplayName(user)}`}
                  className="flex items-center gap-2 rounded-full bg-grey-200 px-3 py-1 text-body-xs text-grey-800 hover:bg-grey-100"
                >
                  {getDisplayName(user)}
                  <CloseIcon className="size-2.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label htmlFor={`${baseId}-search`} className="sr-only">
          Rechercher un utilisateur
        </label>
        <input
          id={`${baseId}-search`}
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="Rechercher par nom ou email"
          aria-describedby={`${baseId}-status`}
          className="h-10 w-full rounded-sm border border-grey-200 px-3 text-body-m sm:text-body-xs"
        />
        <p id={`${baseId}-status`} aria-live="polite" className="text-body-xs text-grey-600">
          {searchStatus}
        </p>

        {results.length > 0 && (
          <ul className="max-h-48 overflow-y-auto">
            {results.map((user) => (
              <li key={user.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 hover:bg-grey-50">
                  <input
                    type="checkbox"
                    checked={selected.some((item) => item.id === user.id)}
                    onChange={() => toggleUser(user)}
                    className="size-4 accent-brand-dark"
                  />
                  <span className="text-body-s text-grey-950">
                    {getDisplayName(user)}
                    {user.name && (
                      <span className="ml-2 text-body-xs text-grey-600">{user.email}</span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
