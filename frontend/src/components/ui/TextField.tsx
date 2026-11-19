import type { InputHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
  label: string;
  name: string;
  /** Consigne affichée sous le champ (ex. règles du mot de passe). */
  hint?: string;
  /** Message d'erreur : le champ passe en rouge et le message est lu avec le champ. */
  error?: string;
  /** Affiche « * » après le libellé (champ obligatoire dans la maquette). */
  showRequiredMark?: boolean;
};

/**
 * Champ de saisie avec libellé (composant « Input » de la maquette).
 * Le libellé, la consigne et l'erreur sont reliés au champ pour les lecteurs d'écran.
 */
export function TextField({
  label,
  name,
  id,
  hint,
  error,
  showRequiredMark = false,
  className = "",
  ...inputProps
}: TextFieldProps) {
  const inputId = id ?? `field-${name}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex w-full flex-col gap-1.75 ${className}`}>
      <label htmlFor={inputId} className="text-body-s text-black">
        {label}
        {/* L'astérisque est visuel : l'attribut required annonce déjà « obligatoire ». */}
        {showRequiredMark && <span aria-hidden>*</span>}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        // 16px sur mobile pour éviter le zoom automatique d'iOS, 12px (maquette) ensuite.
        className={`h-13.25 w-full rounded-sm border bg-white px-4.25 text-body-m text-grey-950 placeholder:text-grey-600 sm:text-body-xs ${
          error ? "border-error" : "border-grey-200"
        }`}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-body-xs text-grey-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-body-xs text-error-dark">
          {error}
        </p>
      )}
    </div>
  );
}
