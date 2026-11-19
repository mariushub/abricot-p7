type FormErrorProps = {
  message?: string;
};

/**
 * Erreur générale d'un formulaire (identifiants refusés, serveur injoignable…).
 * `role="alert"` la fait annoncer immédiatement par les lecteurs d'écran.
 */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="w-full rounded-sm border border-error bg-error-light px-4 py-3 text-body-s text-error-dark"
    >
      {message}
    </p>
  );
}
