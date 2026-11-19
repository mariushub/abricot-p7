"use client";

import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { addMonths, formatMonth } from "@/lib/format";

type MonthNavigatorProps = {
  month: Date;
  onChange: (month: Date) => void;
};

/** Mois affiché, avec boutons mois précédent / suivant (Kanban, calendrier). */
export function MonthNavigator({ month, onChange }: MonthNavigatorProps) {
  const buttonClasses =
    "flex size-10 items-center justify-center rounded-[10px] border border-grey-200 bg-white text-grey-950 transition-colors hover:border-brand-dark";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(addMonths(month, -1))}
        aria-label="Mois précédent"
        className={buttonClasses}
      >
        <ChevronDownIcon className="w-3 rotate-90" />
      </button>
      {/* Annonce le nouveau mois aux lecteurs d'écran après un changement. */}
      <p
        aria-live="polite"
        className="min-w-36 text-center text-body-m text-grey-800 first-letter:uppercase"
      >
        {formatMonth(month)}
      </p>
      <button
        type="button"
        onClick={() => onChange(addMonths(month, 1))}
        aria-label="Mois suivant"
        className={buttonClasses}
      >
        <ChevronDownIcon className="w-3 -rotate-90" />
      </button>
    </div>
  );
}
