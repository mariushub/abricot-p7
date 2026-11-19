"use client";

import { useId } from "react";

import { SearchIcon } from "@/components/icons/SearchIcon";

type SearchFieldProps = {
  /** Libellé lu par les lecteurs d'écran, repris en texte d'exemple. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Champ de recherche avec icône (filtre une liste au fil de la saisie). */
export function SearchField({ label, value, onChange, className = "" }: SearchFieldProps) {
  const inputId = useId();

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className="h-15.75 w-full rounded-[10px] border border-grey-200 bg-white pr-12 pl-8 text-body-m text-grey-950 placeholder:text-grey-600 sm:text-body-s"
      />
      <SearchIcon className="pointer-events-none absolute top-1/2 right-6 size-3.5 -translate-y-1/2 text-grey-600" />
    </div>
  );
}
