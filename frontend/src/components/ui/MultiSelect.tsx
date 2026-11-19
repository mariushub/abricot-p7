"use client";

import { useId, useState } from "react";

import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { pluralize } from "@/lib/format";

export type MultiSelectOption = {
  value: string;
  label: string;
  /** Texte secondaire (ex. email), aide à distinguer deux homonymes. */
  hint?: string;
};

type MultiSelectProps = {
  label: string;
  /** Nom des cases à cocher : la route /api lit les valeurs avec formData.getAll(name). */
  name: string;
  options: MultiSelectOption[];
  defaultSelected?: string[];
  placeholder: string;
  /** Affiche un champ pour filtrer la liste (utile quand elle est longue). */
  searchable?: boolean;
};

/**
 * Liste déroulante à choix multiples (composant « Combo box » de la maquette).
 * Bouton qui déplie une liste de cases à cocher natives : utilisable au
 * clavier et annoncée correctement par les lecteurs d'écran.
 */
export function MultiSelect({
  label,
  name,
  options,
  defaultSelected = [],
  placeholder,
  searchable = false,
}: MultiSelectProps) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const summaryId = `${baseId}-summary`;
  const panelId = `${baseId}-panel`;

  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = (option: MultiSelectOption) =>
    !normalizedQuery ||
    `${option.label} ${option.hint ?? ""}`.toLowerCase().includes(normalizedQuery);

  function toggleOption(value: string) {
    setSelected((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  return (
    <div className="flex flex-col gap-1.75">
      <span id={labelId} className="text-body-s text-black">
        {label}
      </span>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-labelledby={`${labelId} ${summaryId}`}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-13.25 w-full items-center justify-between gap-4 rounded-sm border border-grey-200 bg-white px-4.25 text-left text-body-m text-grey-600 sm:text-body-xs"
      >
        <span id={summaryId}>
          {selected.length === 0 ? placeholder : pluralize(selected.length, "collaborateur")}
        </span>
        <ChevronDownIcon
          className={`w-4 shrink-0 text-grey-950 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/*
        Le panneau est masqué avec `hidden` (et non retiré du DOM) : les cases
        cochées restent dans le formulaire et sont envoyées à la soumission.
      */}
      <div id={panelId} hidden={!isOpen} className="rounded-sm border border-grey-200 bg-white p-2">
        <fieldset>
          <legend className="sr-only">{label}</legend>
          {searchable && (
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={`Filtrer : ${label}`}
              placeholder="Rechercher par nom ou email"
              className="mb-2 h-10 w-full rounded-sm border border-grey-200 px-3 text-body-m sm:text-body-xs"
            />
          )}
          {options.length === 0 ? (
            <p className="px-2 py-3 text-body-xs text-grey-600">Aucun utilisateur disponible.</p>
          ) : (
            <ul className="max-h-56 overflow-y-auto">
              {options.map((option) => (
                <li key={option.value} hidden={!matchesQuery(option)}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 hover:bg-grey-50">
                    <input
                      type="checkbox"
                      name={name}
                      value={option.value}
                      checked={selected.includes(option.value)}
                      onChange={() => toggleOption(option.value)}
                      className="size-4 accent-brand-dark"
                    />
                    <span className="text-body-s text-grey-950">
                      {option.label}
                      {option.hint && (
                        <span className="ml-2 text-body-xs text-grey-600">{option.hint}</span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </div>
    </div>
  );
}
