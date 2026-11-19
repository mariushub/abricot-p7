"use client";

import type { ComponentType } from "react";

export type ViewOption<T extends string> = {
  value: T;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

type ViewSwitcherProps<T extends string> = {
  /** Décrit le groupe pour les lecteurs d'écran (ex. « Affichage des tâches »). */
  label: string;
  options: ViewOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Boutons de changement de vue (composant « Chips » : Liste, Kanban…).
 * Chaque bouton indique son état avec aria-pressed.
 */
export function ViewSwitcher<T extends string>({
  label,
  options,
  value,
  onChange,
}: ViewSwitcherProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2.5">
      {options.map(({ value: optionValue, label: optionLabel, Icon }) => {
        const isSelected = optionValue === value;
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(optionValue)}
            className={`flex h-11.25 items-center gap-3.5 rounded-lg px-4 text-body-s text-brand-dark transition-colors ${
              isSelected ? "bg-brand-light" : "bg-white hover:bg-brand-light"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}
